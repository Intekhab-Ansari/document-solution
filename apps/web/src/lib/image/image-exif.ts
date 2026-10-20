import { loadImageElement } from "./image-compress";

export interface ParsedExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  software?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  hasGpsData: boolean;
  rawTagsCount: number;
}

/**
 * Basic pure client-side EXIF extractor for JPEG images
 */
export async function extractExifMetadata(file: File | Blob): Promise<ParsedExifData> {
  const buffer = await file.slice(0, 128 * 1024).arrayBuffer(); // read first 128KB
  const view = new DataView(buffer);

  const result: ParsedExifData = {
    hasGpsData: false,
    rawTagsCount: 0,
  };

  // Check JPEG SOI marker (0xFFD8)
  if (view.getUint16(0) !== 0xffd8) {
    return result; // Not a JPEG or no standard EXIF
  }

  let offset = 2;
  const length = view.byteLength;

  while (offset < length - 2) {
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 marker (0xFFE1) contains EXIF
    if (marker === 0xffe1) {
      const app1Length = view.getUint16(offset);
      offset += 2;

      // Check for "Exif\0\0" header (0x457869660000)
      if (
        view.getUint32(offset) === 0x45786966 &&
        view.getUint16(offset + 4) === 0x0000
      ) {
        parseTiffHeader(view, offset + 6, result);
      }
      break;
    } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8 && marker !== 0xffd9) {
      // Skip other APP markers
      const markerLength = view.getUint16(offset);
      offset += markerLength;
    } else {
      break;
    }
  }

  return result;
}

function parseTiffHeader(view: DataView, tiffOffset: number, result: ParsedExifData) {
  // Check endianness: 0x4949 ("II" = little endian) or 0x4D4D ("MM" = big endian)
  const byteOrder = view.getUint16(tiffOffset);
  const littleEndian = byteOrder === 0x4949;

  // Check 42 magic number
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) return;

  const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
  if (firstIfdOffset < 8) return;

  parseIfd(view, tiffOffset, tiffOffset + firstIfdOffset, littleEndian, result);
}

function parseIfd(
  view: DataView,
  tiffOffset: number,
  ifdOffset: number,
  littleEndian: boolean,
  result: ParsedExifData
) {
  if (ifdOffset + 2 > view.byteLength) return;
  const entriesCount = view.getUint16(ifdOffset, littleEndian);
  result.rawTagsCount += entriesCount;

  let current = ifdOffset + 2;

  for (let i = 0; i < entriesCount; i++) {
    if (current + 12 > view.byteLength) break;
    const tag = view.getUint16(current, littleEndian);
    const type = view.getUint16(current + 2, littleEndian);
    const count = view.getUint32(current + 4, littleEndian);

    // Common tags
    if (tag === 0x010f) {
      // Make
      result.make = readAsciiString(view, tiffOffset, current + 8, count, littleEndian);
    } else if (tag === 0x0110) {
      // Model
      result.model = readAsciiString(view, tiffOffset, current + 8, count, littleEndian);
    } else if (tag === 0x0131) {
      // Software
      result.software = readAsciiString(view, tiffOffset, current + 8, count, littleEndian);
    } else if (tag === 0x0132 || tag === 0x9003) {
      // DateTime
      result.dateTime = readAsciiString(view, tiffOffset, current + 8, count, littleEndian);
    } else if (tag === 0x8827) {
      // ISO
      result.iso = view.getUint16(current + 8, littleEndian);
    } else if (tag === 0x8825) {
      // GPS IFD Pointer
      result.hasGpsData = true;
      const gpsIfdOffset = view.getUint32(current + 8, littleEndian);
      parseGpsIfd(view, tiffOffset, tiffOffset + gpsIfdOffset, littleEndian, result);
    }

    current += 12;
  }
}

function parseGpsIfd(
  view: DataView,
  tiffOffset: number,
  gpsOffset: number,
  littleEndian: boolean,
  result: ParsedExifData
) {
  if (gpsOffset + 2 > view.byteLength) return;
  const entries = view.getUint16(gpsOffset, littleEndian);
  let cur = gpsOffset + 2;

  let latRef = "N";
  let lonRef = "E";
  let latDegrees: number[] = [];
  let lonDegrees: number[] = [];

  for (let i = 0; i < entries; i++) {
    if (cur + 12 > view.byteLength) break;
    const tag = view.getUint16(cur, littleEndian);

    if (tag === 0x0001) {
      latRef = String.fromCharCode(view.getUint8(cur + 8));
    } else if (tag === 0x0002) {
      // Latitude rational[3]
      latDegrees = readRationals(view, tiffOffset, cur + 8, 3, littleEndian);
    } else if (tag === 0x0003) {
      lonRef = String.fromCharCode(view.getUint8(cur + 8));
    } else if (tag === 0x0004) {
      // Longitude rational[3]
      lonDegrees = readRationals(view, tiffOffset, cur + 8, 3, littleEndian);
    }
    cur += 12;
  }

  if (latDegrees.length === 3 && lonDegrees.length === 3) {
    let lat = latDegrees[0] + latDegrees[1] / 60 + latDegrees[2] / 3600;
    if (latRef === "S") lat = -lat;
    let lon = lonDegrees[0] + lonDegrees[1] / 60 + lonDegrees[2] / 3600;
    if (lonRef === "W") lon = -lon;

    result.gps = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
    };
    result.hasGpsData = true;
  }
}

function readRationals(
  view: DataView,
  tiffOffset: number,
  valueOffset: number,
  count: number,
  littleEndian: boolean
): number[] {
  const offset = view.getUint32(valueOffset, littleEndian);
  const realOffset = tiffOffset + offset;
  const values: number[] = [];

  for (let i = 0; i < count; i++) {
    const num = view.getUint32(realOffset + i * 8, littleEndian);
    const den = view.getUint32(realOffset + i * 8 + 4, littleEndian);
    values.push(den === 0 ? 0 : num / den);
  }

  return values;
}

function readAsciiString(
  view: DataView,
  tiffOffset: number,
  valueOrOffset: number,
  length: number,
  littleEndian: boolean
): string {
  let strOffset = valueOrOffset;
  if (length > 4) {
    strOffset = tiffOffset + view.getUint32(valueOrOffset, littleEndian);
  }

  let str = "";
  for (let i = 0; i < length; i++) {
    if (strOffset + i >= view.byteLength) break;
    const charCode = view.getUint8(strOffset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }

  return str.trim();
}

/**
 * 100% Client-Side Metadata Stripper
 * Draws pixels onto a clean canvas and re-encodes, stripping all EXIF, GPS, and device traces.
 */
export async function stripImageMetadata(
  fileOrBlob: File | Blob,
  format = "image/jpeg",
  quality = 0.95
): Promise<{ blob: Blob; dataUrl: string; originalSize: number; newSize: number; savingsBytes: number }> {
  const origSize = fileOrBlob.size;
  const img = await loadImageElement(fileOrBlob);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to encode clean metadata-free image"));
      },
      format,
      quality
    );
  });

  return {
    blob: cleanBlob,
    dataUrl: URL.createObjectURL(cleanBlob),
    originalSize: origSize,
    newSize: cleanBlob.size,
    savingsBytes: Math.max(0, origSize - cleanBlob.size),
  };
}

/**
 * Lossless binary-level EXIF stripper for JPEG Uint8Array bytes
 * Removes APP1 (0xFFE1) EXIF segment directly without canvas re-encoding
 */
export function stripExifFromJpegBytes(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes;
  }
  const chunks: Uint8Array[] = [bytes.slice(0, 2)]; // Keep SOI (0xFFD8)
  let offset = 2;

  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xff) {
      chunks.push(bytes.slice(offset));
      break;
    }
    const marker = (bytes[offset] << 8) | bytes[offset + 1];
    offset += 2;

    // Stop at SOS (Start of Scan 0xFFDA) or EOI (0xFFD9)
    if (marker === 0xffda || marker === 0xffd9) {
      chunks.push(bytes.slice(offset - 2));
      break;
    }

    if (offset + 2 > bytes.length) break;
    const length = (bytes[offset] << 8) | bytes[offset + 1];

    // If marker is APP1 (0xFFE1) containing Exif, skip it!
    if (marker === 0xffe1) {
      offset += length;
      continue;
    }

    // Keep other segments
    chunks.push(bytes.slice(offset - 2, offset + length));
    offset += length;
  }

  const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) {
    result.set(c, pos);
    pos += c.length;
  }
  return result;
}

