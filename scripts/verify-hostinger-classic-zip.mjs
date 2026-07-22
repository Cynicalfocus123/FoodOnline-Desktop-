import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const archiveIndex = args.indexOf("--archive");
if (archiveIndex < 0 || !args[archiveIndex + 1]) throw new Error("Use --archive <path>.");

const archive = await readFile(args[archiveIndex + 1]);
const eocd = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
const zip64End = Buffer.from([0x50, 0x4b, 0x06, 0x06]);
const zip64Locator = Buffer.from([0x50, 0x4b, 0x06, 0x07]);
const eocdOffset = archive.lastIndexOf(eocd);
if (eocdOffset < 0 || eocdOffset + 22 > archive.length) throw new Error("Classic ZIP end record is missing.");
if (archive.includes(zip64End) || archive.includes(zip64Locator)) throw new Error("ZIP64 records are not permitted.");

const count = archive.readUInt16LE(eocdOffset + 10);
const centralSize = archive.readUInt32LE(eocdOffset + 12);
const centralOffset = archive.readUInt32LE(eocdOffset + 16);
const commentLength = archive.readUInt16LE(eocdOffset + 20);
if (count === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff || commentLength !== 0) throw new Error("ZIP64 or ZIP comments are not permitted.");
if (centralOffset + centralSize !== eocdOffset) throw new Error("Unexpected central-directory layout.");

const names = new Set();
const methods = new Set();
let cursor = centralOffset;
let directories = 0;
let encrypted = 0;
let symlinks = 0;
for (let index = 0; index < count; index += 1) {
  if (archive.readUInt32LE(cursor) !== 0x02014b50) throw new Error(`Invalid central-directory entry ${index}.`);
  const versionMadeBy = archive.readUInt16LE(cursor + 4);
  const flags = archive.readUInt16LE(cursor + 8);
  const method = archive.readUInt16LE(cursor + 10);
  const compressedSize = archive.readUInt32LE(cursor + 20);
  const uncompressedSize = archive.readUInt32LE(cursor + 24);
  const nameLength = archive.readUInt16LE(cursor + 28);
  const extraLength = archive.readUInt16LE(cursor + 30);
  const entryCommentLength = archive.readUInt16LE(cursor + 32);
  const diskStart = archive.readUInt16LE(cursor + 34);
  const externalAttributes = archive.readUInt32LE(cursor + 38);
  const localOffset = archive.readUInt32LE(cursor + 42);
  const nameBytes = archive.subarray(cursor + 46, cursor + 46 + nameLength);
  if ([...nameBytes].some((byte) => byte > 0x7f)) throw new Error("Non-ASCII archive path is not permitted.");
  const name = nameBytes.toString("ascii");
  if (!name || name.includes("\\") || name.startsWith("/") || name.includes(":") || name.split("/").some((part) => !part || part === "." || part === "..")) throw new Error(`Unsafe path: ${name}`);
  if (names.has(name)) throw new Error(`Duplicate path: ${name}`);
  names.add(name);
  methods.add(method);
  if (name.endsWith("/")) directories += 1;
  if (flags !== 0 || ![0, 8].includes(method) || extraLength !== 0 || entryCommentLength !== 0 || diskStart !== 0 || (versionMadeBy >> 8) !== 0 || externalAttributes !== 0x20 || compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localOffset === 0xffffffff) throw new Error(`Unsupported classic ZIP metadata: ${name}`);
  if (flags & 1) encrypted += 1;
  if ((externalAttributes >>> 16 & 0xf000) === 0xa000) symlinks += 1;
  if (archive.readUInt32LE(localOffset) !== 0x04034b50 || archive.readUInt16LE(localOffset + 6) !== flags || archive.readUInt16LE(localOffset + 8) !== method || archive.readUInt16LE(localOffset + 28) !== 0) throw new Error(`Invalid local header: ${name}`);
  cursor += 46 + nameLength + extraLength + entryCommentLength;
}
if (cursor !== centralOffset + centralSize || directories !== 0 || encrypted !== 0 || symlinks !== 0) throw new Error("Backend archive contains unsupported directory, encrypted, symlink, or central-directory data.");

console.log(JSON.stringify({ zip32: true, zip64: false, compressionMethods: [...methods].sort((a, b) => a - b), files: names.size, explicitDirectories: directories, encryptedEntries: encrypted, symlinks, extraFields: 0 }));
