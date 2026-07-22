#!/usr/bin/env python3
"""Independent structural and CRC verifier for standard Hostinger ZIP files."""

from __future__ import annotations

import argparse
import json
import os
import stat
import sys
import zipfile
from pathlib import PurePosixPath


def is_unsafe(name: str) -> bool:
    if not name or "\\" in name or name.startswith("/") or ":" in name or "//" in name:
        return True
    path = PurePosixPath(name)
    return any(part in {"", ".", ".."} for part in path.parts)


def has_ntfs_extra(extra: bytes) -> bool:
    index = 0
    while index + 4 <= len(extra):
        header = int.from_bytes(extra[index : index + 2], "little")
        length = int.from_bytes(extra[index + 2 : index + 4], "little")
        if header == 0x000A:
            return True
        index += 4 + length
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive")
    args = parser.parse_args()

    archive_path = os.path.abspath(args.archive)
    with open(archive_path, "rb") as raw:
        raw_bytes = raw.read()

    with zipfile.ZipFile(archive_path, "r") as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        directories = [info.filename for info in infos if info.is_dir()]
        unsafe = [name for name in names if is_unsafe(name)]
        duplicate_entries = len(names) - len(set(names))
        encrypted = [info.filename for info in infos if info.flag_bits & 0x1]
        symlinks = [
            info.filename
            for info in infos
            if stat.S_ISLNK((info.external_attr >> 16) & 0o177777)
        ]
        non_deflate = [
            info.filename for info in infos if not info.is_dir() and info.compress_type != zipfile.ZIP_DEFLATED
        ]
        ntfs_extra = [info.filename for info in infos if has_ntfs_extra(info.extra)]
        crc_failure = archive.testzip()

    # ZIP64 EOCD records are only required when normal EOCD fields use sentinel values.
    eocd = raw_bytes.rfind(b"PK\x05\x06")
    zip64 = False
    if eocd >= 0 and eocd + 22 <= len(raw_bytes):
        entry_count = int.from_bytes(raw_bytes[eocd + 10 : eocd + 12], "little")
        directory_size = int.from_bytes(raw_bytes[eocd + 12 : eocd + 16], "little")
        directory_offset = int.from_bytes(raw_bytes[eocd + 16 : eocd + 20], "little")
        zip64 = entry_count == 0xFFFF or directory_size == 0xFFFFFFFF or directory_offset == 0xFFFFFFFF
    else:
        zip64 = True

    result = {
        "files": len(names) - len(directories),
        "entries": len(names),
        "explicitDirectories": len(directories),
        "unsafePaths": len(unsafe),
        "duplicateEntries": duplicate_entries,
        "encryptedEntries": len(encrypted),
        "symlinks": len(symlinks),
        "nonDeflateEntries": len(non_deflate),
        "ntfsExtraEntries": len(ntfs_extra),
        "zip64": zip64,
        "crcFailure": crc_failure,
        "valid": not any([
            unsafe,
            duplicate_entries,
            encrypted,
            symlinks,
            non_deflate,
            ntfs_extra,
            zip64,
            crc_failure,
            directories,
        ]),
    }
    print(json.dumps(result, separators=(",", ":")))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
