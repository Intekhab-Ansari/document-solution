import { loadImageElement } from "./image-compress";

export interface ResizeOptions {
  mode: "dimensions" | "percentage" | "preset";
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  percentage?: number; // e.g. 50 for 50%
  preset?: "passport" | "square" | "story" | "landscape-hd" | "banner";
  format?: string;
  quality?: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PRESET_DIMS: Record<string, [number, number]> = {
  passport: [413, 531], // 35mm x 45mm at 300 DPI standard
  square: [1080, 1080],
  story: [1080, 1920],
  "landscape-hd": [1920, 1080],
  banner: [1200, 628],
};

export async function resizeImage(
  fileOrBlob: File | Blob | string,
  options: ResizeOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImageElement(fileOrBlob);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  let targetW = origW;
  let targetH = origH;

  if (options.mode === "preset" && options.preset) {
    const [pW, pH] = PRESET_DIMS[options.preset] || [origW, origH];
    targetW = pW;
    targetH = pH;
  } else if (options.mode === "percentage") {
    const scale = (options.percentage || 100) / 100;
    targetW = Math.max(1, Math.round(origW * scale));
    targetH = Math.max(1, Math.round(origH * scale));
  } else if (options.mode === "dimensions") {
    const reqW = options.width || origW;
    const reqH = options.height || origH;

    if (options.maintainAspectRatio) {
      if (options.width && !options.height) {
        targetW = reqW;
        targetH = Math.round((origH / origW) * reqW);
      } else if (options.height && !options.width) {
        targetH = reqH;
        targetW = Math.round((origW / origH) * reqH);
      } else {
        // Both provided, fit within box maintaining ratio
        const scale = Math.min(reqW / origW, reqH / origH);
        targetW = Math.round(origW * scale);
        targetH = Math.round(origH * scale);
      }
    } else {
      targetW = reqW;
      targetH = reqH;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const format = options.format || "image/jpeg";
  const quality = options.quality ?? 0.92;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas blob conversion failed"));
        resolve({
          blob,
          dataUrl: URL.createObjectURL(blob),
          width: targetW,
          height: targetH,
        });
      },
      format,
      quality
    );
  });
}

export async function cropImage(
  fileOrBlob: File | Blob | string,
  cropArea: CropArea,
  format = "image/jpeg",
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImageElement(fileOrBlob);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cropArea.width));
  canvas.height = Math.max(1, Math.round(cropArea.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Crop blob failed"));
        resolve({
          blob,
          dataUrl: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
        });
      },
      format,
      quality
    );
  });
}

export async function rotateAndFlipImage(
  fileOrBlob: File | Blob | string,
  rotationAngle = 0, // 0, 90, 180, 270
  flipHorizontal = false,
  flipVertical = false,
  format = "image/jpeg",
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImageElement(fileOrBlob);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  const isSwapped = rotationAngle === 90 || rotationAngle === 270;
  const targetW = isSwapped ? origH : origW;
  const targetH = isSwapped ? origW : origH;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  ctx.translate(targetW / 2, targetH / 2);
  ctx.rotate((rotationAngle * Math.PI) / 180);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

  ctx.drawImage(img, -origW / 2, -origH / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Rotate blob failed"));
        resolve({
          blob,
          dataUrl: URL.createObjectURL(blob),
          width: targetW,
          height: targetH,
        });
      },
      format,
      quality
    );
  });
}
