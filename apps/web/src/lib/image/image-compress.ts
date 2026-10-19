export interface ImageCompressOptions {
  mode: "target" | "quality";
  targetKB?: number;
  quality?: number; // 0.01 - 1.0
  format?: "image/jpeg" | "image/webp" | "image/png";
  maxIterations?: number;
  onProgress?: (progress: { percent: number; stage: string; currentIteration?: number }) => void;
}

export interface ImageCompressResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  newSize: number;
  savingsPercent: number;
  iterationsRun: number;
  qualityUsed: number;
  scaleUsed: number;
  width: number;
  height: number;
  message?: string;
  isTargetMet: boolean;
}

/**
 * Load an image Blob or File into an HTMLImageElement
 */
export function loadImageElement(source: Blob | File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image: " + err));
    if (typeof source === "string") {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
  });
}

/**
 * Render image to canvas at specific scale and export to blob
 */
export async function encodeCanvasToBlob(
  img: HTMLImageElement,
  scale: number,
  format: string,
  quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
  const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
  const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not create canvas context");

  // White background for JPEG to prevent black transparent areas
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width: targetW, height: targetH });
        } else {
          reject(new Error("Canvas blob encoding failed"));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Iterative binary search image compressor to hit exact target KB
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  options: ImageCompressOptions
): Promise<ImageCompressResult> {
  const originalSize = fileOrBlob.size;
  const img = await loadImageElement(fileOrBlob);
  const format = options.format || (fileOrBlob.type === "image/png" ? "image/jpeg" : fileOrBlob.type || "image/jpeg");
  const { onProgress } = options;

  if (options.mode === "quality") {
    const q = options.quality ?? 0.8;
    onProgress?.({ percent: 50, stage: `Compressing at ${Math.round(q * 100)}% quality...` });
    const { blob, width, height } = await encodeCanvasToBlob(img, 1.0, format, q);
    const newSize = blob.size;
    const savings = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
    const dataUrl = URL.createObjectURL(blob);

    return {
      blob,
      dataUrl,
      originalSize,
      newSize,
      savingsPercent: savings,
      iterationsRun: 1,
      qualityUsed: q,
      scaleUsed: 1.0,
      width,
      height,
      isTargetMet: true,
      message: `Quality compressed to ${(newSize / 1024).toFixed(1)} KB`,
    };
  }

  // TARGET SIZE MODE
  const targetBytes = (options.targetKB || 100) * 1024;
  const acceptableMin = targetBytes * 0.92; // 8% window under target
  const maxIter = options.maxIterations || 7;

  let lowQ = 0.15;
  let highQ = 0.98;
  let currentScale = 1.0;
  let iter = 0;

  let bestBlob: Blob | null = null;
  let bestSize = Infinity;
  let bestQ = 0.8;
  let bestW = img.naturalWidth;
  let bestH = img.naturalHeight;
  let targetMet = false;

  while (iter < maxIter) {
    iter++;
    const midQ = Number(((lowQ + highQ) / 2).toFixed(2));

    onProgress?.({
      percent: Math.round((iter / maxIter) * 85),
      stage: `Binary search iteration ${iter}/${maxIter} (Q: ${Math.round(midQ * 100)}%)...`,
      currentIteration: iter,
    });

    const { blob, width, height } = await encodeCanvasToBlob(img, currentScale, format, midQ);
    const candidateSize = blob.size;

    if (candidateSize <= targetBytes) {
      bestBlob = blob;
      bestSize = candidateSize;
      bestQ = midQ;
      bestW = width;
      bestH = height;
      targetMet = true;

      // If we are within acceptable sweet spot, we can stop early
      if (candidateSize >= acceptableMin) {
        break;
      }
      // Too small, try higher quality
      lowQ = midQ;
    } else {
      // Still too large
      highQ = midQ;

      // If we are already at minimum quality and still too large, downscale image dimensions
      if (midQ <= 0.22 && currentScale > 0.4) {
        currentScale = Number((currentScale * 0.8).toFixed(2));
        lowQ = 0.2;
        highQ = 0.85;
      }

      if (candidateSize < bestSize) {
        bestBlob = blob;
        bestSize = candidateSize;
        bestQ = midQ;
        bestW = width;
        bestH = height;
      }
    }
  }

  onProgress?.({ percent: 100, stage: "Finalizing compressed image..." });

  if (!bestBlob) {
    const fallback = await encodeCanvasToBlob(img, 0.5, format, 0.3);
    bestBlob = fallback.blob;
    bestSize = fallback.blob.size;
    bestW = fallback.width;
    bestH = fallback.height;
  }

  const savings = Math.max(0, Math.round(((originalSize - bestSize) / originalSize) * 100));
  const dataUrl = URL.createObjectURL(bestBlob);

  let message = `Compressed to ${(bestSize / 1024).toFixed(1)} KB (Target: ${options.targetKB} KB).`;
  if (!targetMet && bestSize > targetBytes) {
    message = `Best achievable size is ${(bestSize / 1024).toFixed(1)} KB without excessive downscaling.`;
  }

  return {
    blob: bestBlob,
    dataUrl,
    originalSize,
    newSize: bestSize,
    savingsPercent: savings,
    iterationsRun: iter,
    qualityUsed: bestQ,
    scaleUsed: currentScale,
    width: bestW,
    height: bestH,
    isTargetMet: targetMet,
    message,
  };
}
