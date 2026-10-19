import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  if (bytes < 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

export function calculateSavings(originalBytes: number, compressedBytes: number) {
  if (!originalBytes || originalBytes <= 0) return { diffBytes: 0, percent: 0, isSmaller: false };
  const diffBytes = originalBytes - compressedBytes;
  const percent = Math.round((diffBytes / originalBytes) * 100);
  return {
    diffBytes,
    percent: Math.max(0, percent),
    isSmaller: compressedBytes < originalBytes,
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke object URL after slight delay to ensure browser completes download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBuffer(buffer: Uint8Array | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([buffer as BlobPart], { type: mimeType });
  downloadBlob(blob, filename);
}

export async function detectFileKind(file: File): Promise<"pdf" | "image" | "heic" | "other"> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || file.type === "application/pdf") {
    return "pdf";
  }
  if (ext === "heic" || ext === "heif" || file.type.includes("heic") || file.type.includes("heif")) {
    return "heic";
  }
  if (file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "avif", "gif", "bmp", "svg"].includes(ext || "")) {
    return "image";
  }

  // Inspect magic bytes if mime type is ambiguous
  try {
    const slice = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(slice);
    // %PDF-
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return "pdf";
    }
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return "image";
    }
    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image";
    }
    // HEIC / HEIF / ftyp
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      return "heic";
    }
  } catch {
    // ignore
  }

  return "other";
}
