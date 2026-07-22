#!/usr/bin/env python3
"""Create a conservative ZIP32 backend archive for shared-hosting extractors."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path


def fail(message: str) -> None:
    raise RuntimeError(message)


def relative_name(source: Path, file: Path) -> str:
    name = file.relative_to(source).as_posix()
    if not name or name.startswith("/") or "\\" in name or ".." in name.split("/"):
        fail(f"Unsafe archive path: {name}")
    try:
        name.encode("ascii")
    except UnicodeEncodeError as error:
        raise RuntimeError(f"Non-ASCII archive path is not supported by the Hostinger compatibility ZIP: {name}") from error
    return name


def source_files(source: Path) -> list[tuple[str, Path]]:
    files: list[tuple[str, Path]] = []
    for item in sorted(source.rglob("*"), key=lambda path: path.as_posix()):
        if item.is_symlink():
            fail(f"Linked source item is not permitted: {item}")
        if item.is_file():
            files.append((relative_name(source, item), item))
    if not files:
        fail("Backend release source is empty")
    return files


def info_for(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=(2024, 1, 1, 0, 0, 0))
    info.create_system = 0  # FAT/DOS metadata only; avoids POSIX/NTFS attributes.
    info.create_version = 20
    info.extract_version = 20
    info.flag_bits = 0
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0x20  # normal DOS archive file
    info.extra = b""
    info.comment = b""
    return info


def verify(path: Path, expected: list[tuple[str, Path]]) -> dict[str, object]:
    with zipfile.ZipFile(path, "r") as archive:
        errors = archive.testzip()
        if errors:
            fail(f"CRC validation failed for {errors}")
        entries = archive.infolist()
        expected_names = [name for name, _ in expected]
        names = [entry.filename for entry in entries]
        if names != expected_names:
            fail("Archive file list does not match the verified backend source")
        for entry in entries:
            if entry.is_dir() or entry.compress_type != zipfile.ZIP_DEFLATED or entry.flag_bits != 0:
                fail(f"Archive entry is not classic Deflate file data: {entry.filename}")
            if entry.create_system != 0 or entry.external_attr != 0x20 or entry.extra or entry.comment:
                fail(f"Archive entry has unsupported Hostinger metadata: {entry.filename}")
            if entry.file_size > 0xFFFFFFFF or entry.compress_size > 0xFFFFFFFF or entry.header_offset > 0xFFFFFFFF:
                fail(f"ZIP64-sized entry is not permitted: {entry.filename}")
    data = path.read_bytes()
    if b"PK\x06\x06" in data or b"PK\x06\x07" in data:
        fail("ZIP64 records are not permitted")
    return {
        "files": len(entries),
        "directories": 0,
        "compression": "deflate",
        "zip32": True,
        "zip64": False,
        "encrypted": 0,
        "symlinks": 0,
        "extraFields": 0,
        "bytes": path.stat().st_size,
        "sha256": hashlib.sha256(data).hexdigest(),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--archive", required=True)
    args = parser.parse_args()
    source = Path(args.source).resolve()
    archive = Path(args.archive).resolve()
    if not source.is_dir():
        fail(f"Missing backend source: {source}")
    if archive.exists():
        fail(f"Refusing to overwrite temporary archive: {archive}")
    archive.parent.mkdir(parents=True, exist_ok=True)
    files = source_files(source)
    try:
        with zipfile.ZipFile(archive, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=False) as output:
            for name, file in files:
                with file.open("rb") as input_file:
                    output.writestr(info_for(name), input_file.read(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
        print(json.dumps(verify(archive, files), sort_keys=True))
    except Exception:
        archive.unlink(missing_ok=True)
        raise


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Hostinger classic ZIP build failed: {error}", file=sys.stderr)
        sys.exit(1)
