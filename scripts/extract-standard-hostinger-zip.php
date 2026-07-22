<?php

declare(strict_types=1);

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php extract-standard-hostinger-zip.php <archive-path> <destination-directory>\n");
    exit(64);
}

if (!class_exists(ZipArchive::class)) {
    fwrite(STDERR, "PHP ZipArchive is unavailable.\n");
    exit(1);
}

try {
    $archive = $argv[1];
    $destination = $argv[2];
    if (!is_dir($destination) && !mkdir($destination, 0777, true) && !is_dir($destination)) {
        throw new RuntimeException("Unable to create extraction directory: {$destination}");
    }

    $zip = new ZipArchive();
    if ($zip->open($archive) !== true) {
        throw new RuntimeException("Unable to open archive: {$archive}");
    }
    for ($index = 0; $index < $zip->numFiles; $index++) {
        $entry = $zip->getNameIndex($index);
        if ($entry === false || str_contains($entry, '\\') || str_starts_with($entry, '/') || str_contains($entry, '../')) {
            throw new RuntimeException("Unsafe archive entry: {$entry}");
        }
        if ($zip->getFromIndex($index) === false) {
            throw new RuntimeException("Unable to read archive entry: {$entry}");
        }
    }
    if (!$zip->extractTo($destination)) {
        throw new RuntimeException('PHP ZipArchive extraction failed.');
    }
    $files = 0;
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($destination, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file instanceof SplFileInfo && $file->isFile()) {
            $files++;
        }
    }
    $zip->close();
    echo json_encode(['phpZipArchive' => true, 'files' => $files], JSON_THROW_ON_ERROR) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, "PHP ZipArchive verification failed: {$error->getMessage()}\n");
    exit(1);
}
