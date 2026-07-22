<?php

declare(strict_types=1);

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php create-standard-hostinger-zip.php <source-directory> <archive-path>\n");
    exit(64);
}

if (!class_exists(ZipArchive::class)) {
    throw new RuntimeException('PHP ZipArchive is required to create a standard Hostinger ZIP.');
}

/** @return never */
function fail(string $message): void
{
    throw new RuntimeException($message);
}

function archivePathFor(string $source, string $path): string
{
    $relative = substr($path, strlen($source) + 1);
    $relative = str_replace(DIRECTORY_SEPARATOR, '/', $relative);

    if ($relative === '' || str_contains($relative, '\\') || str_starts_with($relative, '/') || str_contains($relative, ':') || str_contains($relative, '//')) {
        fail("Unsafe archive path: {$relative}");
    }

    foreach (explode('/', $relative) as $segment) {
        if ($segment === '' || $segment === '.' || $segment === '..') {
            fail("Unsafe archive path: {$relative}");
        }
    }

    return $relative;
}

try {
    $source = realpath($argv[1]);
    if ($source === false || !is_dir($source)) {
        fail("Source directory does not exist: {$argv[1]}");
    }

    $archive = $argv[2];
    $parent = realpath(dirname($archive));
    if ($parent === false || !is_dir($parent)) {
        fail("Archive parent directory does not exist: " . dirname($archive));
    }
    $archive = $parent . DIRECTORY_SEPARATOR . basename($archive);

    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile()) {
            continue;
        }
        if ($file->isLink()) {
            fail("Symbolic links are not allowed in a Hostinger archive: {$file->getPathname()}");
        }
        $relative = archivePathFor($source, $file->getPathname());
        if (isset($files[$relative])) {
            fail("Duplicate archive path: {$relative}");
        }
        $files[$relative] = $file->getPathname();
    }
    ksort($files, SORT_STRING);
    if ($files === []) {
        fail('Refusing to create an empty archive.');
    }

    if (file_exists($archive) && !unlink($archive)) {
        fail("Unable to replace clean archive target: {$archive}");
    }

    $zip = new ZipArchive();
    if ($zip->open($archive, ZipArchive::CREATE) !== true) {
        fail("Unable to create archive: {$archive}");
    }

    foreach ($files as $relative => $path) {
        if (!$zip->addFile($path, $relative)) {
            fail("Unable to add archive entry: {$relative}");
        }
        if (!$zip->setCompressionName($relative, ZipArchive::CM_DEFLATE)) {
            fail("Unable to set Deflate compression: {$relative}");
        }
        // DOS attributes intentionally avoid POSIX/NTFS metadata in the archive.
        if (!$zip->setExternalAttributesName($relative, ZipArchive::OPSYS_DOS, 0, 0)) {
            fail("Unable to normalize archive metadata: {$relative}");
        }
    }

    if (!$zip->close()) {
        fail("Unable to finalize archive: {$archive}");
    }

    echo json_encode([
        'archive' => $archive,
        'files' => count($files),
        'bytes' => filesize($archive),
        'sha256' => hash_file('sha256', $archive),
        'writer' => 'PHP ZipArchive',
        'compression' => 'Deflate',
        'explicitDirectories' => 0,
    ], JSON_THROW_ON_ERROR) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, "Standard Hostinger ZIP build failed: {$error->getMessage()}\n");
    exit(1);
}
