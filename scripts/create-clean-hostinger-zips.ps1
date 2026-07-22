param(
    [string]$ReleaseDirectory = "",
    [string]$FrontendDirectory = "",
    [string]$BackendDirectory = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
if ([string]::IsNullOrWhiteSpace($ReleaseDirectory)) {
    $ReleaseDirectory = Join-Path (Split-Path $repoRoot -Parent) "FoodOnlines-Live-Releases"
}
if ([string]::IsNullOrWhiteSpace($FrontendDirectory)) {
    $FrontendDirectory = Join-Path $ReleaseDirectory "FoodOnlines-Frontend-Clean"
}
if ([string]::IsNullOrWhiteSpace($BackendDirectory)) {
    $BackendDirectory = Join-Path $ReleaseDirectory "FoodOnlines-Backend-Clean"
}

$ReleaseDirectory = [IO.Path]::GetFullPath($ReleaseDirectory).TrimEnd([char]92, [char]47)
$FrontendDirectory = [IO.Path]::GetFullPath($FrontendDirectory).TrimEnd([char]92, [char]47)
$BackendDirectory = [IO.Path]::GetFullPath($BackendDirectory).TrimEnd([char]92, [char]47)

if ((Split-Path -Parent $FrontendDirectory) -ne $ReleaseDirectory -or (Split-Path -Leaf $FrontendDirectory) -ne "FoodOnlines-Frontend-Clean") {
    throw "Unsafe frontend clean staging path: $FrontendDirectory"
}
if ((Split-Path -Parent $BackendDirectory) -ne $ReleaseDirectory -or (Split-Path -Leaf $BackendDirectory) -ne "FoodOnlines-Backend-Clean") {
    throw "Unsafe backend clean staging path: $BackendDirectory"
}
$pythonVerifier = Join-Path $repoRoot "scripts/verify-standard-hostinger-zip.py"
$phpCreator = Join-Path $repoRoot "scripts/create-standard-hostinger-zip.php"
$phpExtractor = Join-Path $repoRoot "scripts/extract-standard-hostinger-zip.php"
foreach ($tool in @($pythonVerifier, $phpCreator, $phpExtractor)) {
    if (-not (Test-Path -LiteralPath $tool -PathType Leaf)) { throw "Required clean package tool is missing: $tool" }
}

function Assert-PortablePath([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or $Path.Contains([char]92) -or $Path.StartsWith("/") -or $Path.Contains(":") -or $Path.Contains("//")) {
        throw "Unsafe portable path: $Path"
    }
    foreach ($segment in $Path.Split([char]47)) {
        if ([string]::IsNullOrWhiteSpace($segment) -or $segment -eq "." -or $segment -eq "..") {
            throw "Unsafe portable path: $Path"
        }
    }
}

function Reset-CleanStage([string]$Source, [string]$Target, [string]$ExpectedLeaf) {
    $sourcePath = [IO.Path]::GetFullPath($Source).TrimEnd([char]92, [char]47)
    $targetPath = [IO.Path]::GetFullPath($Target).TrimEnd([char]92, [char]47)
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
        throw "Authoritative package source is missing: $sourcePath"
    }
    if ((Split-Path -Parent $targetPath) -ne $ReleaseDirectory -or (Split-Path -Leaf $targetPath) -ne $ExpectedLeaf) {
        throw "Refusing to replace an unexpected clean staging path: $targetPath"
    }
    if (Test-Path -LiteralPath $targetPath) {
        Remove-Item -LiteralPath $targetPath -Force -Recurse
    }
    New-Item -ItemType Directory -Path $targetPath | Out-Null

    foreach ($file in Get-ChildItem -LiteralPath $sourcePath -File -Recurse -Force) {
        if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Linked files are not allowed in a clean package source: $($file.FullName)"
        }
        $relative = $file.FullName.Substring($sourcePath.Length + 1).Replace([char]92, [char]47)
        Assert-PortablePath $relative
        $destination = Join-Path $targetPath $relative.Replace([char]47, [IO.Path]::DirectorySeparatorChar)
        $destinationDirectory = Split-Path -Parent $destination
        if (-not (Test-Path -LiteralPath $destinationDirectory -PathType Container)) {
            New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        }
        [IO.File]::Copy($file.FullName, $destination, $true)
    }
}

Reset-CleanStage (Join-Path $repoRoot "dist") $FrontendDirectory "FoodOnlines-Frontend-Clean"
Reset-CleanStage (Join-Path $repoRoot "backend-live") $BackendDirectory "FoodOnlines-Backend-Clean"

function Get-Inventory([string]$Root) {
    $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd([char]92, [char]47)
    return @(Get-ChildItem -LiteralPath $rootPath -File -Recurse -Force | Sort-Object FullName | ForEach-Object {
        if (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Linked files are not allowed in a clean package: $($_.FullName)"
        }
        $relative = $_.FullName.Substring($rootPath.Length + 1).Replace([char]92, [char]47)
        Assert-PortablePath $relative
        [pscustomobject]@{
            RelativePath = $relative
            FullName = $_.FullName
            Bytes = [int64]$_.Length
            SHA256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
        }
    })
}

function Assert-CleanSource([string]$Source, [string]$Kind, [System.Collections.IEnumerable]$Files) {
    $fileNames = @($Files | ForEach-Object { $_.RelativePath })
    $rootDirectories = @(Get-ChildItem -LiteralPath $Source -Directory -Force | ForEach-Object { $_.Name })
    if ($Kind -eq "frontend") {
        foreach ($required in @("index.html", "admin.html", ".htaccess", "favicon.svg", "404.html", "HOSTINGER-DEPLOYMENT-INSTRUCTIONS.txt")) {
            if ($fileNames -notcontains $required) { throw "Frontend clean stage is missing required file: $required" }
        }
        foreach ($directory in @("assets", "images")) {
            if ($rootDirectories -notcontains $directory) { throw "Frontend clean stage is missing required directory: $directory" }
        }
        $forbidden = @($Files | Where-Object {
            $_.RelativePath -match "^(api|app|bootstrap|config|database|resources|routes|storage|public|vendor|tests|src|node_modules)(/|$)" -or
            $_.RelativePath -match "(^|/)\.env(?:\.|$)" -or $_.RelativePath -match "\.(zip|map)$"
        })
    } else {
        foreach ($required in @("artisan", "composer.json", "composer.lock", "DEPLOYMENT.md", "SHA256SUMS", "public/index.php", "public/.htaccess", "public/backend-path.php.example")) {
            if ($fileNames -notcontains $required) { throw "Backend clean stage is missing required file: $required" }
        }
        foreach ($directory in @("app", "bootstrap", "config", "database", "public", "resources", "routes")) {
            if ($rootDirectories -notcontains $directory) { throw "Backend clean stage is missing required directory: $directory" }
        }
        $forbidden = @($Files | Where-Object {
            $_.RelativePath -match "(^|/)\.env(?:\.|$)" -or
            $_.RelativePath -match "^(vendor|tests|dist|frontend-upload|src|assets|images|node_modules)(/|$)" -or
            $_.RelativePath -match "^storage/(logs|framework/(cache|sessions|views)|app/public/media)(/|$)" -or
            $_.RelativePath -match "\.(zip|sqlite|db|sql|log)$" -or $_.RelativePath -eq "public/backend-path.php"
        })
    }
    if ($forbidden.Count -ne 0) { throw "$Kind clean stage contains forbidden files: $($forbidden.Count)" }
}

function Assert-BackendManifest([string]$Source, [System.Collections.IEnumerable]$Files) {
    $manifestPath = Join-Path $Source "SHA256SUMS"
    $manifest = @{}
    foreach ($line in [IO.File]::ReadAllLines($manifestPath)) {
        if ($line -notmatch "^([a-f0-9]{64})  (.+)$") { throw "Invalid SHA256SUMS line: $line" }
        $relative = $Matches[2]
        Assert-PortablePath $relative
        if ($manifest.ContainsKey($relative)) { throw "Duplicate SHA256SUMS entry: $relative" }
        $manifest[$relative] = $Matches[1]
    }
    $payload = @($Files | Where-Object { $_.RelativePath -ne "SHA256SUMS" })
    if ($manifest.Count -ne $payload.Count) { throw "SHA256SUMS entry count does not match backend payload." }
    foreach ($file in $payload) {
        if (-not $manifest.ContainsKey($file.RelativePath) -or $manifest[$file.RelativePath] -ne $file.SHA256) {
            throw "SHA256SUMS mismatch: $($file.RelativePath)"
        }
    }
}

function Compare-Inventory([System.Collections.IEnumerable]$Expected, [System.Collections.IEnumerable]$Actual, [string]$Label) {
    $expectedMap = @{}; foreach ($file in $Expected) { $expectedMap[$file.RelativePath] = $file }
    $actualMap = @{}; foreach ($file in $Actual) { $actualMap[$file.RelativePath] = $file }
    $missing = @($expectedMap.Keys | Where-Object { -not $actualMap.ContainsKey($_) })
    $extra = @($actualMap.Keys | Where-Object { -not $expectedMap.ContainsKey($_) })
    $mismatch = @($expectedMap.Keys | Where-Object {
        $actualMap.ContainsKey($_) -and ($expectedMap[$_].Bytes -ne $actualMap[$_].Bytes -or $expectedMap[$_].SHA256 -ne $actualMap[$_].SHA256)
    })
    if ($missing.Count -or $extra.Count -or $mismatch.Count) {
        throw "$Label parity failed: missing=$($missing.Count), extra=$($extra.Count), hashMismatch=$($mismatch.Count)"
    }
}

function Remove-VerificationDirectory([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    $absolute = [IO.Path]::GetFullPath($Path).TrimEnd([char]92, [char]47)
    if ((Split-Path -Parent $absolute) -ne $ReleaseDirectory -or (Split-Path -Leaf $absolute) -notmatch "^verify-clean-") {
        throw "Refusing to remove a directory outside the clean verification scope: $absolute"
    }
    Remove-Item -LiteralPath $absolute -Force -Recurse
}

function Remove-ObsoleteReleaseArchives([string[]]$KeepNames) {
    $allowed = @{}
    foreach ($name in $KeepNames) {
        if ([string]::IsNullOrWhiteSpace($name) -or [IO.Path]::GetFileName($name) -ne $name -or -not $name.EndsWith(".zip", [StringComparison]::OrdinalIgnoreCase)) {
            throw "Unsafe canonical archive name: $name"
        }
        $allowed[$name.ToLowerInvariant()] = $true
    }

    foreach ($archive in Get-ChildItem -LiteralPath $ReleaseDirectory -File -Filter "*.zip" -Force) {
        $archivePath = [IO.Path]::GetFullPath($archive.FullName)
        if ((Split-Path -Parent $archivePath) -ne $ReleaseDirectory) {
            throw "Refusing to remove an archive outside the release directory: $archivePath"
        }
        if (-not $allowed.ContainsKey($archive.Name.ToLowerInvariant())) {
            Remove-Item -LiteralPath $archivePath -Force
        }
    }
}

function Invoke-CleanPackage([string]$Kind, [string]$Source, [string]$ArchiveName) {
    $files = Get-Inventory $Source
    if ($files.Count -eq 0) { throw "$Kind clean stage is empty." }
    Assert-CleanSource $Source $Kind $files
    if ($Kind -eq "backend") { Assert-BackendManifest $Source $files }

    $archive = Join-Path $ReleaseDirectory $ArchiveName
    if ((Split-Path -Parent $archive) -ne $ReleaseDirectory) { throw "Unsafe archive target: $archive" }
    $create = & php $phpCreator $Source $archive
    if ($LASTEXITCODE -ne 0) { throw "PHP ZipArchive creation failed for $Kind." }
    $createResult = ($create -join "`n") | ConvertFrom-Json

    $python = & python $pythonVerifier $archive
    if ($LASTEXITCODE -ne 0) { throw "Python ZIP integrity/metadata verification failed for $Kind." }
    $pythonResult = ($python -join "`n") | ConvertFrom-Json

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archiveEntries = @()
    $read = [IO.Compression.ZipFile]::OpenRead($archive)
    try {
        foreach ($entry in $read.Entries) {
            if ($entry.FullName.EndsWith("/")) { throw "$Kind archive contains an explicit directory: $($entry.FullName)" }
            Assert-PortablePath $entry.FullName
            $archiveEntries += [pscustomobject]@{ RelativePath = $entry.FullName; Bytes = [int64]$entry.Length }
        }
    } finally { $read.Dispose() }
    if (($archiveEntries.RelativePath | Select-Object -Unique).Count -ne $archiveEntries.Count) { throw "$Kind archive has duplicate entries." }
    if ($archiveEntries.Count -ne $files.Count) { throw "$Kind archive file count does not match clean stage." }
    $archiveMap = @{}; foreach ($entry in $archiveEntries) { $archiveMap[$entry.RelativePath] = $entry }
    foreach ($file in $files) {
        if (-not $archiveMap.ContainsKey($file.RelativePath) -or $archiveMap[$file.RelativePath].Bytes -ne $file.Bytes) {
            throw "$Kind archive/source listing parity failed: $($file.RelativePath)"
        }
    }

    $windowsExtraction = Join-Path $ReleaseDirectory ("verify-clean-windows-" + [guid]::NewGuid().ToString("N"))
    $phpExtraction = Join-Path $ReleaseDirectory ("verify-clean-php-" + [guid]::NewGuid().ToString("N"))
    try {
        Expand-Archive -LiteralPath $archive -DestinationPath $windowsExtraction -Force
        $windowsFiles = Get-Inventory $windowsExtraction
        Compare-Inventory $files $windowsFiles "$Kind Windows Expand-Archive"

        $php = & php $phpExtractor $archive $phpExtraction
        if ($LASTEXITCODE -ne 0) { throw "PHP ZipArchive extraction failed for $Kind." }
        $phpResult = ($php -join "`n") | ConvertFrom-Json
        $phpFiles = Get-Inventory $phpExtraction
        Compare-Inventory $files $phpFiles "$Kind PHP ZipArchive"

        $tarCommand = Get-Command tar -ErrorAction SilentlyContinue
        $tarResult = "unavailable"
        if ($null -ne $tarCommand) {
            & $tarCommand.Source -tf $archive 1>$null 2>$null
            $tarResult = if ($LASTEXITCODE -eq 0) { "listed" } else { "available-but-zip-unsupported" }
        }

        $result = [pscustomobject]@{
            kind = $Kind
            cleanFolder = $Source
            archive = $archive
            files = $files.Count
            sourceBytes = ($files | Measure-Object -Property Bytes -Sum).Sum
            archiveBytes = (Get-Item -LiteralPath $archive).Length
            sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash.ToLowerInvariant()
            writer = $createResult.writer
            compression = $createResult.compression
            wrapperCount = 0
            explicitDirectories = $pythonResult.explicitDirectories
            hiddenHtaccess = if ($Kind -eq "frontend") { Test-Path -LiteralPath (Join-Path $windowsExtraction ".htaccess") } else { Test-Path -LiteralPath (Join-Path $windowsExtraction "public/.htaccess") }
            pythonZipfile = "listed+CRC-passed"
            windowsExpandArchive = "extracted+SHA256-parity-passed"
            phpZipArchive = "extracted+SHA256-parity-passed"
            windowsTar = $tarResult
            sevenZip = "unavailable"
            sourceArchiveParity = "passed"
            extractionParity = "passed"
            manifest = if ($Kind -eq "backend") { "passed" } else { "not-applicable" }
            unsafePaths = $pythonResult.unsafePaths
            duplicateEntries = $pythonResult.duplicateEntries
            encryptedEntries = $pythonResult.encryptedEntries
            symlinks = $pythonResult.symlinks
            backslashEntries = 0
            zip64 = $pythonResult.zip64
            ntfsExtraEntries = $pythonResult.ntfsExtraEntries
        }
    } finally {
        Remove-VerificationDirectory $windowsExtraction
        Remove-VerificationDirectory $phpExtraction
    }
    return $result
}

$frontendArchiveName = "FoodOnlines_Frontend_Hostinger_Clean.zip"
$backendArchiveName = "FoodOnlines_Backend_Hostinger_Clean.zip"
$frontend = Invoke-CleanPackage "frontend" $FrontendDirectory $frontendArchiveName
$backend = Invoke-CleanPackage "backend" $BackendDirectory $backendArchiveName
Remove-ObsoleteReleaseArchives @($frontendArchiveName, $backendArchiveName)
[pscustomobject]@{ frontend = $frontend; backend = $backend } | ConvertTo-Json -Depth 5
