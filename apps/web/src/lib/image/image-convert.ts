import { loadImageElement } from "./image-compress";

export type SupportedTargetFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

export interface ConvertOptions {
  targetFormat: SupportedTargetFormat;
  quality?: number; // 0.1 - 1.0
  backgroundColor?: string; // used when target does not support alpha (e.g. JPEG)
}

/**
 * Decode HEIC/HEIF file client-side to standard JPEG Blob using heic2any
 */
export async function decodeHeicIfApplicable(fileOrBlob: File | Blob): Promise<Blob> {
  const isHeic =
    fileOrBlob.type.includes("heic") ||
    fileOrBlob.type.includes("heif") ||
    ("name" in fileOrBlob && /\.(heic|heif)$/i.test((fileOrBlob as File).name));

  if (!isHeic) {
    return fileOrBlob;
  }

  // Dynamic import of heic2any for client-side decoding
  const heic2anyModule = await import("heic2any");
  const heic2any = heic2anyModule.default || heic2anyModule;

  const result = await heic2any({
    blob: fileOrBlob,
    toType: "image/jpeg",
    quality: 0.95,
  });

  return Array.isArray(result) ? result[0] : result;
}

/**
 * Universal client-side image format converter
 */
export async function convertImage(
  fileOrBlob: File | Blob,
  options: ConvertOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; filename: string }> {
  // Step 1: Normalize HEIC if needed
  const normalizedBlob = await decodeHeicIfApplicable(fileOrBlob);

  // Step 2: Load into HTML image
  const img = await loadImageElement(normalizedBlob);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context for conversion");

  // Step 3: Fill background if converting from alpha-capable to non-alpha (e.g. JPEG)
  if (options.targetFormat === "image/jpeg") {
    ctx.fillStyle = options.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0);

  const quality = options.quality ?? 0.92;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to convert image to ${options.targetFormat}`));
      },
      options.targetFormat,
      quality
    );
  });

  const extMap: Record<SupportedTargetFormat, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };

  const origName = "name" in fileOrBlob ? (fileOrBlob as File).name : "converted";
  const baseName = origName.substring(0, origName.lastIndexOf(".")) || origName;
  const ext = extMap[options.targetFormat] || "jpg";
  const filename = `${baseName}.${ext}`;

  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    width,
    height,
    filename,
  };
}
