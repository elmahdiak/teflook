const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_INPUT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION_PX = 1000;
const COMPRESSION_QUALITY = 0.78;

async function decodeImageSource(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback for browsers that reject options object on createImageBitmap
      try {
        const bitmap = await createImageBitmap(file);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => bitmap.close(),
        };
      } catch {
        // Fall through to HTMLImageElement fallback
      }
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    element.src = objectUrl;
  });

  return {
    source: img,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Compresses and resizes a customer review image entirely in the browser:
 * - Validates JPEG / PNG / WebP and <= 10 MB limit
 * - Constrains longest dimension to 1000px while preserving aspect ratio & EXIF orientation
 * - Encodes as WebP (or JPEG fallback) at quality 0.78
 */
export async function compressReviewImage(file: File): Promise<File> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Format d'image non supporté. Veuillez choisir un fichier JPG, PNG ou WebP."
    );
  }

  if (file.size > MAX_INPUT_FILE_SIZE_BYTES) {
    throw new Error("L'image dépasse la limite autorisée de 10 Mo.");
  }

  const decoded = await decodeImageSource(file);

  try {
    const { source, width, height } = decoded;
    if (!width || !height) {
      throw new Error("Dimensions d'image invalides.");
    }

    const longestSide = Math.max(width, height);
    const scale = longestSide > MAX_DIMENSION_PX ? MAX_DIMENSION_PX / longestSide : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Contexte canvas indisponible pour la compression.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    let blob = await canvasToBlob(canvas, "image/webp", COMPRESSION_QUALITY);
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", COMPRESSION_QUALITY);
    }

    if (!blob) {
      throw new Error("Échec de la compression de l'image.");
    }

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const baseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 32) || "review";

    return new File([blob], `${baseName}.${ext}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    decoded.cleanup();
  }
}
