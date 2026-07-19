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

function Write-PortableZip(
    [string]$SourceDirectory,
    [string]$ArchiveName,
    [string]$PayloadKind
) {
    $source = [IO.Path]::GetFullPath($SourceDirectory).TrimEnd([char]92, [char]47)
    if (-not [IO.Directory]::Exists($source)) {
        throw "Missing release source: $source"
    }

    $archivePath = [IO.Path]::Combine($OutputDirectory, $ArchiveName)
    if ([IO.Path]::GetDirectoryName($archivePath) -ne $OutputDirectory) {
        throw "Unsafe archive target: $archivePath"
    }

    $temporaryArchive = [IO.Path]::Combine(
        $OutputDirectory,
        ("portable-" + [guid]::NewGuid().ToString("N") + ".zip")
    )
    $verificationDirectory = [IO.Path]::Combine(
        $OutputDirectory,
        ("extract-verify-" + [guid]::NewGuid().ToString("N"))
    )

    $files = @(Get-ChildItem -LiteralPath $source -File -Recurse | Sort-Object FullName)
    if ($files.Count -eq 0) {
        throw "Release source is empty: $source"
    }

    $expected = @{}
    foreach ($file in $files) {
        if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Release archives cannot contain linked files: $($file.FullName)"
        }
        $relative = $file.FullName.Substring($source.Length + 1).Replace([char]92, [char]47)
        $segments = @($relative.Split([char]47))
        if ($relative.StartsWith("/") -or $segments -contains ".." -or $relative.Contains([char]92)) {
            throw "Unsafe or non-portable source path: $relative"
        }
        if ($expected.ContainsKey($relative)) {
            throw "Duplicate release path: $relative"
        }
        $expected[$relative] = [long]$file.Length
    }

    if ($PayloadKind -eq "frontend") {
        $forbidden = @($expected.Keys | Where-Object {
            $_ -eq "api" -or $_.StartsWith("api/") -or
            $_ -eq ".env" -or $_.StartsWith(".env.") -or
            $_.EndsWith(".map")
        })
        if ($forbidden.Count -gt 0) {
            throw "Frontend archive contains forbidden paths: $($forbidden -join ', ')"
        }
    }

    try {
        $outputStream = [IO.File]::Open($temporaryArchive, [IO.FileMode]::CreateNew)
        try {
            $zip = New-Object IO.Compression.ZipArchive(
                $outputStream,
                [IO.Compression.ZipArchiveMode]::Create,
                $false
            )
            try {
                foreach ($file in $files) {
                    $relative = $file.FullName.Substring($source.Length + 1).Replace([char]92, [char]47)
                    $entry = $zip.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
                    $entry.LastWriteTime = $file.LastWriteTime
                    $inputStream = $file.OpenRead()
                    try {
                        $entryStream = $entry.Open()
                        try {
                            $inputStream.CopyTo($entryStream)
                        } finally {
                            $entryStream.Dispose()
                        }
                    } finally {
                        $inputStream.Dispose()
                    }
                }
            } finally {
                $zip.Dispose()
            }
        } finally {
            $outputStream.Dispose()
        }

        $readZip = [IO.Compression.ZipFile]::OpenRead($temporaryArchive)
        try {
            $actual = @{}
            foreach ($entry in $readZip.Entries) {
                $name = $entry.FullName
                $segments = @($name.Split([char]47))
                if ($name.Contains([char]92) -or $name.StartsWith("/") -or $segments -contains "..") {
                    throw "Archive has a non-portable or unsafe entry: $name"
                }
                if ($actual.ContainsKey($name)) {
                    throw "Archive has a duplicate entry: $name"
                }
                $actual[$name] = [long]$entry.Length
            }

            $missing = @($expected.Keys | Where-Object { -not $actual.ContainsKey($_) })
            $extra = @($actual.Keys | Where-Object { -not $expected.ContainsKey($_) })
            $sizeMismatch = @($expected.Keys | Where-Object {
                $actual.ContainsKey($_) -and $actual[$_] -ne $expected[$_]
            })
            if ($missing.Count -or $extra.Count -or $sizeMismatch.Count) {
                throw "Archive parity failed: missing=$($missing.Count), extra=$($extra.Count), sizeMismatch=$($sizeMismatch.Count)"
            }
        } finally {
            $readZip.Dispose()
        }

        [IO.Compression.ZipFile]::ExtractToDirectory($temporaryArchive, $verificationDirectory)
        foreach ($relative in $expected.Keys) {
            $extractedPath = [IO.Path]::Combine(
                $verificationDirectory,
                $relative.Replace([char]47, [IO.Path]::DirectorySeparatorChar)
            )
            if (-not [IO.File]::Exists($extractedPath)) {
                throw "Extraction verification failed for: $relative"
            }
            if ((Get-Item -LiteralPath $extractedPath).Length -ne $expected[$relative]) {
                throw "Extracted file size differs for: $relative"
            }
        }

        [IO.File]::Copy($temporaryArchive, $archivePath, $true)
        $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath
        [pscustomobject]@{
            Archive = $archivePath
            Files = $files.Count
            Bytes = (Get-Item -LiteralPath $archivePath).Length
            BackslashEntries = 0
            Missing = 0
            Extra = 0
            SizeMismatch = 0
            ExtractionVerified = $true
            SHA256 = $hash.Hash.ToLowerInvariant()
        }
    } finally {
        Remove-TemporaryFile $temporaryArchive
        Remove-TemporaryDirectory $verificationDirectory $OutputDirectory
    }
}

$results = @()
if ($Target -eq "all" -or $Target -eq "backend") {
    $results += Write-PortableZip `
        (Join-Path $repoRoot "backend-live") `
        "FoodOnlines_Backend_Live.zip" `
        "backend"
}
if ($Target -eq "all" -or $Target -eq "frontend") {
    $results += Write-PortableZip `
        (Join-Path $repoRoot "frontend-upload") `
        "FoodOnlines_Frontend_Live.zip" `
        "frontend"
}

$results | ConvertTo-Json -Depth 4
