<?php

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php verify-hostinger-classic-zip.php <archive> <destination>\n");
    exit(2);
}

if (! class_exists(ZipArchive::class)) {
    fwrite(STDERR, "PHP ZipArchive is unavailable.\n");
    exit(3);
}

$archivePath = $argv[1];
$destination = $argv[2];
$archive = new ZipArchive();
if ($archive->open($archivePath, ZipArchive::CHECKCONS) !== true) {
    fwrite(STDERR, "PHP ZipArchive could not open the archive.\n");
    exit(1);
}

for ($index = 0; $index < $archive->numFiles; $index++) {
    $entry = $archive->statIndex($index, ZipArchive::FL_UNCHANGED);
    if ($entry === false || ($entry['comp_method'] ?? -1) !== ZipArchive::CM_DEFLATE || (($entry['bitflags'] ?? 0) & 1) !== 0) {
        $archive->close();
        fwrite(STDERR, "PHP ZipArchive rejected a backend entry.\n");
        exit(1);
    }
}

if (! $archive->extractTo($destination)) {
    $archive->close();
    fwrite(STDERR, "PHP ZipArchive extraction failed.\n");
    exit(1);
}
$count = $archive->numFiles;
$archive->close();
echo json_encode(['phpZipArchive' => true, 'files' => $count]).PHP_EOL;
