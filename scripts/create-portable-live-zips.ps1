param(
    [ValidateSet("all", "backend", "frontend")]
    [string]$Target = "all",
    [string]$OutputDirectory = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path (Split-Path $repoRoot -Parent) "FoodOnlines-Live-Releases"
}
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
[IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Remove-TemporaryFile([string]$Path) {
    if ([IO.File]::Exists($Path)) {
        [IO.File]::Delete($Path)
    }
}

function Remove-TemporaryDirectory([string]$Path, [string]$ExpectedParent) {
    if (-not [IO.Directory]::Exists($Path)) {
        return
    }
    if ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Path)) -ne $ExpectedParent) {
        throw "Refusing to remove verification directory outside the release directory: $Path"
    }
    [IO.Directory]::Delete($Path, $true)
}

function Assert-PortablePath([string]$Path, [bool]$IsDirectory) {
    if ([string]::IsNullOrWhiteSpace($Path)) {
        throw "Archive entry path is empty."
    }
    if ($IsDirectory -and -not $Path.EndsWith("/")) {
        throw "Directory entry must end with '/': $Path"
    }
    if (-not $IsDirectory -and $Path.EndsWith("/")) {
        throw "File entry must not end with '/': $Path"
    }

    $candidate = if ($IsDirectory) { $Path.TrimEnd([char]47) } else { $Path }
    if ([string]::IsNullOrWhiteSpace($candidate) -or $candidate.Contains([char]92) -or
        $candidate.StartsWith("/") -or $candidate.Contains(":") -or $candidate.Contains("//")) {
        throw "Archive entry is not a portable relative path: $Path"
    }

    foreach ($segment in $candidate.Split([char]47)) {
        if ([string]::IsNullOrEmpty($segment) -or $segment -eq "." -or $segment -eq "..") {
            throw "Archive entry has an unsafe path segment: $Path"
        }
    }
}

function Get-RelativePath([IO.FileSystemInfo]$Item, [string]$Source) {
    return $Item.FullName.Substring($Source.Length + 1).Replace([char]92, [char]47)
}

function Get-FileDigest([string]$Path) {
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Invoke-HostingerClassicBackendBuild([string]$Source, [string]$TemporaryArchive) {
    $builder = Join-Path $repoRoot "scripts/create-hostinger-classic-backend-zip.py"
    $reader = Join-Path $repoRoot "scripts/verify-hostinger-classic-zip.mjs"
    $pythonOutput = & python $builder --source $Source --archive $TemporaryArchive
    if ($LASTEXITCODE -ne 0) { throw "Hostinger classic backend ZIP build failed." }
    $pythonResult = ($pythonOutput -join "`n") | ConvertFrom-Json
    $nodeOutput = & node $reader --archive $TemporaryArchive
    if ($LASTEXITCODE -ne 0) { throw "Node classic ZIP reader rejected the backend archive." }
    $nodeResult = ($nodeOutput -join "`n") | ConvertFrom-Json
    if (-not $pythonResult.zip32 -or $pythonResult.zip64 -or $pythonResult.directories -ne 0 -or $pythonResult.compression -ne "deflate" -or
        -not $nodeResult.zip32 -or $nodeResult.zip64 -or $nodeResult.explicitDirectories -ne 0 -or $nodeResult.encryptedEntries -ne 0 -or $nodeResult.symlinks -ne 0) {
        throw "Backend archive is not the required classic ZIP32/Deflate payload."
    }
    return [pscustomobject]@{ Python = $pythonResult; Node = $nodeResult }
}

function Invoke-PhpZipArchiveExtraction([string]$ArchivePath, [string]$OutputPath) {
    $verifier = Join-Path $repoRoot "scripts/verify-hostinger-classic-zip.php"
    $output = & php $verifier $ArchivePath $OutputPath
    if ($LASTEXITCODE -ne 0) { throw "PHP ZipArchive extraction rejected the backend archive." }
    return ($output -join "`n") | ConvertFrom-Json
}

function Get-SecretFindings([System.Collections.IEnumerable]$Files) {
    $findings = New-Object 'System.Collections.Generic.List[string]'
    $textExtensions = @(".css", ".html", ".htaccess", ".js", ".json", ".lock", ".md", ".php", ".txt", ".xml", ".yml", ".yaml")
    $patterns = @(
        "-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "AKIA[0-9A-Z]{16}",
        "gh[pousr]_[A-Za-z0-9_]{20,}",
        "sk_live_[A-Za-z0-9]{16,}"
    )

    foreach ($file in $Files) {
        $extension = [IO.Path]::GetExtension($file.RelativePath).ToLowerInvariant()
        if ($file.Length -gt 2000000 -or $textExtensions -notcontains $extension) {
            continue
        }
        $content = [IO.File]::ReadAllText($file.FullName)
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $findings.Add($file.RelativePath)
                break
            }
        }
    }
    return @($findings)
}

function Get-ForbiddenPaths([System.Collections.IEnumerable]$Files, [System.Collections.IEnumerable]$Directories, [string]$PayloadKind) {
    $forbidden = New-Object 'System.Collections.Generic.List[string]'
    foreach ($item in $Files) {
        $path = $item.RelativePath.ToLowerInvariant()
        $isEnvironment = $path -eq ".env" -or $path.StartsWith(".env.") -or $path.Contains("/.env")
        $common = $isEnvironment -or $path.StartsWith(".git/") -or $path -eq ".git" -or
            $path.EndsWith(".gitignore") -or $path.EndsWith(".gitattributes") -or
            $path.Contains("/node_modules/") -or $path.StartsWith("node_modules/") -or $path.EndsWith(".zip")

        if ($PayloadKind -eq "frontend") {
            $backendPath = $path -match "^(?:api|app|bootstrap|config|database|resources|routes|storage|public|vendor|tests|backend-live)(?:/|$)" -or
                $path -in @("artisan", "composer.json", "composer.lock", "sha256sums", "deployment.md")
            if ($common -or $backendPath -or $path.EndsWith(".map")) {
                $forbidden.Add($item.RelativePath)
            }
        } else {
            $frontendPath = $path -match "^(?:frontend-upload|dist|src|assets|images)(?:/|$)" -or
                $path -in @("index.html", "admin.html", "404.html", "favicon.svg", "package.json", "package-lock.json")
            $runtimeFile = $path -match "^storage/(?:logs|framework/(?:cache|sessions|views))(?:/|$)" -or
                $path -match "^storage/app/public/media(?:/|$)" -or $path.EndsWith(".sqlite") -or
                $path.EndsWith(".db") -or $path.EndsWith(".sql") -or $path.EndsWith(".log")
            if ($common -or $frontendPath -or $runtimeFile -or $path.StartsWith("vendor/") -or $path.StartsWith("tests/")) {
                $forbidden.Add($item.RelativePath)
            }
        }
    }

    foreach ($item in $Directories) {
        $path = $item.RelativePath.TrimEnd([char]47).ToLowerInvariant()
        if (($PayloadKind -eq "frontend" -and $path -match "^(?:api|app|bootstrap|config|database|resources|routes|storage|public|vendor|tests|backend-live)(?:/|$)") -or
            ($PayloadKind -eq "backend" -and ($path -match "^(?:frontend-upload|dist|src|assets|images)(?:/|$)" -or $path -match "^storage/app/public/media(?:/|$)"))) {
            $forbidden.Add($item.RelativePath)
        }
    }
    return @($forbidden)
}

function Assert-RequiredPayload([System.Collections.IEnumerable]$Files, [System.Collections.IEnumerable]$Directories, [string]$PayloadKind) {
    $fileNames = @($Files | ForEach-Object { $_.RelativePath })
    $directoryNames = @($Directories | ForEach-Object { $_.RelativePath })
    if ($PayloadKind -eq "frontend") {
        foreach ($required in @("index.html", "admin.html", ".htaccess", "404.html", "favicon.svg")) {
            if ($fileNames -notcontains $required) {
                throw "Frontend release source is missing required root file: $required"
            }
        }
        foreach ($requiredDirectory in @("assets/", "images/")) {
            if ($directoryNames -notcontains $requiredDirectory) {
                throw "Frontend release source is missing required directory: $requiredDirectory"
            }
        }
        return
    }

    foreach ($required in @("artisan", "composer.json", "composer.lock", "DEPLOYMENT.md", "SHA256SUMS", "public/index.php", "public/.htaccess")) {
        if ($fileNames -notcontains $required) {
            throw "Backend release source is missing required file: $required"
        }
    }
}

function Assert-BackendManifest([string]$Source, [System.Collections.IEnumerable]$Files) {
    $manifestPath = Join-Path $Source "SHA256SUMS"
    if (-not [IO.File]::Exists($manifestPath)) {
        throw "backend-live is missing SHA256SUMS"
    }
    $listed = @{}
    foreach ($line in [IO.File]::ReadAllLines($manifestPath)) {
        if ($line -notmatch "^([a-f0-9]{64})  (.+)$") {
            throw "Invalid SHA256SUMS line: $line"
        }
        $relative = $Matches[2]
        Assert-PortablePath $relative $false
        if ($listed.ContainsKey($relative)) {
            throw "Duplicate SHA256SUMS entry: $relative"
        }
        $listed[$relative] = $Matches[1]
    }
    $payloadFiles = @($Files | Where-Object { $_.RelativePath -ne "SHA256SUMS" })
    if ($listed.Count -ne $payloadFiles.Count) {
        throw "SHA256SUMS parity failed: expected $($payloadFiles.Count) entries, found $($listed.Count)"
    }
    foreach ($file in $payloadFiles) {
        if (-not $listed.ContainsKey($file.RelativePath) -or $listed[$file.RelativePath] -ne $file.SHA256) {
            throw "SHA256SUMS mismatch: $($file.RelativePath)"
        }
    }
}

function New-VerifiedPortableZip([string]$SourceDirectory, [string]$ArchiveName, [string]$PayloadKind) {
    $source = [IO.Path]::GetFullPath($SourceDirectory).TrimEnd([char]92, [char]47)
    if (-not [IO.Directory]::Exists($source)) {
        throw "Missing release source: $source"
    }
    $archivePath = [IO.Path]::Combine($OutputDirectory, $ArchiveName)
    if ([IO.Path]::GetDirectoryName($archivePath) -ne $OutputDirectory) {
        throw "Unsafe archive target: $archivePath"
    }

    $temporaryArchive = [IO.Path]::Combine($OutputDirectory, ("portable-" + [guid]::NewGuid().ToString("N") + ".zip"))
    $verificationDirectory = [IO.Path]::Combine($OutputDirectory, ("extract-verify-" + [guid]::NewGuid().ToString("N")))
    $phpVerificationDirectory = [IO.Path]::Combine($OutputDirectory, ("php-extract-verify-" + [guid]::NewGuid().ToString("N")))
    $keepTemporaryArchive = $false
    $compatibility = $null

    try {
        $sourceFiles = @(Get-ChildItem -LiteralPath $source -File -Recurse -Force | Sort-Object FullName | ForEach-Object {
            if (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Release archives cannot contain linked files: $($_.FullName)"
            }
            $relative = Get-RelativePath $_ $source
            Assert-PortablePath $relative $false
            [pscustomobject]@{ RelativePath = $relative; FullName = $_.FullName; Length = [long]$_.Length; SHA256 = Get-FileDigest $_.FullName }
        })
        $sourceDirectories = @(Get-ChildItem -LiteralPath $source -Directory -Recurse -Force | Sort-Object FullName | ForEach-Object {
            if (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Release archives cannot contain linked directories: $($_.FullName)"
            }
            $relative = (Get-RelativePath $_ $source) + "/"
            Assert-PortablePath $relative $true
            [pscustomobject]@{ RelativePath = $relative; FullName = $_.FullName }
        })
        if ($sourceFiles.Count -eq 0) {
            throw "Release source is empty: $source"
        }
        $allSourceNames = @{}
        foreach ($item in @($sourceFiles) + @($sourceDirectories)) {
            if ($allSourceNames.ContainsKey($item.RelativePath)) {
                throw "Duplicate release source path: $($item.RelativePath)"
            }
            $allSourceNames[$item.RelativePath] = $true
        }

        Assert-RequiredPayload -Files $sourceFiles -Directories $sourceDirectories -PayloadKind $PayloadKind
        $forbidden = @(Get-ForbiddenPaths -Files $sourceFiles -Directories $sourceDirectories -PayloadKind $PayloadKind)
        $secretFindings = @(Get-SecretFindings -Files $sourceFiles)
        if ($forbidden.Count -or $secretFindings.Count) {
            throw "Release source policy failed: forbiddenPaths=$($forbidden.Count), secretFindings=$($secretFindings.Count)"
        }
        if ($PayloadKind -eq "backend") {
            Assert-BackendManifest -Source $source -Files $sourceFiles
        }

        if ($PayloadKind -eq "backend") {
            $compatibility = Invoke-HostingerClassicBackendBuild -Source $source -TemporaryArchive $temporaryArchive
        } else {
            $outputStream = [IO.File]::Open($temporaryArchive, [IO.FileMode]::CreateNew)
            try {
                $zip = New-Object IO.Compression.ZipArchive($outputStream, [IO.Compression.ZipArchiveMode]::Create, $false)
                try {
                    foreach ($directory in $sourceDirectories) {
                        $entry = $zip.CreateEntry($directory.RelativePath, [IO.Compression.CompressionLevel]::NoCompression)
                        $entry.LastWriteTime = (Get-Item -LiteralPath $directory.FullName).LastWriteTime
                    }
                    foreach ($file in $sourceFiles) {
                        $entry = $zip.CreateEntry($file.RelativePath, [IO.Compression.CompressionLevel]::Optimal)
                        $entry.LastWriteTime = (Get-Item -LiteralPath $file.FullName).LastWriteTime
                        $inputStream = [IO.File]::OpenRead($file.FullName)
                        try {
                            $entryStream = $entry.Open()
                            try { $inputStream.CopyTo($entryStream) } finally { $entryStream.Dispose() }
                        } finally { $inputStream.Dispose() }
                    }
                } finally { $zip.Dispose() }
            } finally { $outputStream.Dispose() }
        }

        $actual = @{}
        $readZip = [IO.Compression.ZipFile]::OpenRead($temporaryArchive)
        try {
            foreach ($entry in $readZip.Entries) {
                $isDirectory = $entry.FullName.EndsWith("/")
                Assert-PortablePath $entry.FullName $isDirectory
                if ($actual.ContainsKey($entry.FullName)) {
                    throw "Archive has a duplicate entry: $($entry.FullName)"
                }
                $actual[$entry.FullName] = [pscustomobject]@{ IsDirectory = $isDirectory; Length = [long]$entry.Length }
            }
        } finally { $readZip.Dispose() }

        $expected = @{}
        foreach ($file in $sourceFiles) { $expected[$file.RelativePath] = [pscustomobject]@{ IsDirectory = $false; Length = $file.Length } }
        if ($PayloadKind -eq "frontend") {
            foreach ($directory in $sourceDirectories) { $expected[$directory.RelativePath] = [pscustomobject]@{ IsDirectory = $true; Length = 0 } }
        }
        $missing = @($expected.Keys | Where-Object { -not $actual.ContainsKey($_) })
        $extra = @($actual.Keys | Where-Object { -not $expected.ContainsKey($_) })
        $sizeMismatch = @($expected.Keys | Where-Object {
            $actual.ContainsKey($_) -and (-not $actual[$_].IsDirectory) -and $actual[$_].Length -ne $expected[$_].Length
        })
        if ($missing.Count -or $extra.Count -or $sizeMismatch.Count) {
            throw "Archive parity failed: missing=$($missing.Count), extra=$($extra.Count), sizeMismatch=$($sizeMismatch.Count)"
        }

        Expand-Archive -LiteralPath $temporaryArchive -DestinationPath $verificationDirectory -Force
        if ($PayloadKind -eq "backend") {
            $phpResult = Invoke-PhpZipArchiveExtraction -ArchivePath $temporaryArchive -OutputPath $phpVerificationDirectory
            if (-not $phpResult.phpZipArchive -or $phpResult.files -ne $sourceFiles.Count) { throw "PHP ZipArchive verification did not extract every backend file." }
        }
        $extractedFiles = @(Get-ChildItem -LiteralPath $verificationDirectory -File -Recurse -Force | ForEach-Object {
            [pscustomobject]@{ RelativePath = Get-RelativePath $_ $verificationDirectory; FullName = $_.FullName; Length = [long]$_.Length; SHA256 = Get-FileDigest $_.FullName }
        })
        $extractedDirectories = if ($PayloadKind -eq "frontend") { @(Get-ChildItem -LiteralPath $verificationDirectory -Directory -Recurse -Force | ForEach-Object {
            [pscustomobject]@{ RelativePath = (Get-RelativePath $_ $verificationDirectory) + "/" }
        }) } else { @() }
        $actualExtract = @{}
        foreach ($file in $extractedFiles) { $actualExtract[$file.RelativePath] = $file }
        foreach ($directory in $extractedDirectories) { $actualExtract[$directory.RelativePath] = $directory }
        $extractMissing = @($expected.Keys | Where-Object { -not $actualExtract.ContainsKey($_) })
        $extractExtra = @($actualExtract.Keys | Where-Object { -not $expected.ContainsKey($_) })
        $hashMismatch = @($sourceFiles | Where-Object {
            -not $actualExtract.ContainsKey($_.RelativePath) -or $actualExtract[$_.RelativePath].SHA256 -ne $_.SHA256
        })
        if ($extractMissing.Count -or $extractExtra.Count -or $hashMismatch.Count) {
            throw "Extraction parity failed: missing=$($extractMissing.Count), extra=$($extractExtra.Count), hashMismatch=$($hashMismatch.Count)"
        }

        $keepTemporaryArchive = $true
        return [pscustomobject]@{
            Archive = $archivePath
            TemporaryArchive = $temporaryArchive
            Files = $sourceFiles.Count
            Directories = if ($PayloadKind -eq "backend") { 0 } else { $sourceDirectories.Count }
            Bytes = (Get-Item -LiteralPath $temporaryArchive).Length
            SHA256 = Get-FileDigest $temporaryArchive
            Missing = 0
            Extra = 0
            SizeMismatch = 0
            HashMismatch = 0
            UnsafePaths = 0
            BackslashEntries = 0
            DuplicateEntries = 0
            SecretFindings = 0
            ForbiddenPaths = 0
            ExtractionVerified = $true
            ManifestVerified = ($PayloadKind -eq "backend")
            ZipFormat = if ($PayloadKind -eq "backend") { "ZIP32" } else { "standard" }
            Compression = if ($PayloadKind -eq "backend") { "Deflate level 6" } else { "mixed" }
            Zip64 = if ($PayloadKind -eq "backend") { $false } else { $null }
            ExplicitDirectories = if ($PayloadKind -eq "backend") { 0 } else { $sourceDirectories.Count }
            NodeReaderVerified = ($PayloadKind -eq "backend")
            PhpZipArchiveVerified = ($PayloadKind -eq "backend")
        }
    } finally {
        Remove-TemporaryDirectory $verificationDirectory $OutputDirectory
        Remove-TemporaryDirectory $phpVerificationDirectory $OutputDirectory
        if (-not $keepTemporaryArchive) {
            Remove-TemporaryFile $temporaryArchive
        }
    }
}

$pending = @()
try {
    if ($Target -eq "all" -or $Target -eq "backend") {
        $pending += New-VerifiedPortableZip -SourceDirectory (Join-Path $repoRoot "backend-live") -ArchiveName "FoodOnlines_Backend_Live.zip" -PayloadKind "backend"
    }
    if ($Target -eq "all" -or $Target -eq "frontend") {
        $pending += New-VerifiedPortableZip -SourceDirectory (Join-Path $repoRoot "frontend-upload") -ArchiveName "FoodOnlines_Frontend_Live.zip" -PayloadKind "frontend"
    }

    foreach ($result in $pending) {
        Remove-TemporaryFile $result.Archive
        [IO.File]::Move($result.TemporaryArchive, $result.Archive)
    }
    $pending | Select-Object Archive, Files, Directories, Bytes, SHA256, Missing, Extra, SizeMismatch, HashMismatch, UnsafePaths, BackslashEntries, DuplicateEntries, SecretFindings, ForbiddenPaths, ExtractionVerified, ManifestVerified, ZipFormat, Compression, Zip64, ExplicitDirectories, NodeReaderVerified, PhpZipArchiveVerified | ConvertTo-Json -Depth 4
} finally {
    foreach ($result in $pending) {
        Remove-TemporaryFile $result.TemporaryArchive
    }
}
