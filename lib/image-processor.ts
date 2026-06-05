import sharp from "sharp"

interface OptimizationResult {
  buffer: Buffer
  filename: string
  mimeType: string
  isOptimized: boolean
}

/**
 * Optimizes an uploaded image by converting it to WebP format and resizing it
 * if it exceeds 1600px in width or height (maintaining aspect ratio).
 * Non-image files or unsupported formats (like SVG or GIF) are passed through without modification.
 */
export async function optimizeImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<OptimizationResult> {
  // Check if it is a common image format that we want to optimize (JPEG, PNG, WebP)
  const isOptimizableImage =
    mimeType.startsWith("image/") &&
    !mimeType.includes("gif") && // Keep GIFs as is (to avoid breaking animated GIFs)
    !mimeType.includes("svg") && // Keep SVGs as is (vector files)
    !mimeType.includes("icon") && // Keep icons as is
    !mimeType.includes("x-icon")

  if (!isOptimizableImage) {
    return {
      buffer,
      filename: originalFilename,
      mimeType,
      isOptimized: false,
    }
  }

  try {
    let pipeline = sharp(buffer)

    // Resize image maintaining proportions:
    // - fit: "inside" ensures it fits within 1600x1600 box while maintaining aspect ratio
    // - withoutEnlargement: true ensures we don't upscale images smaller than 1600x1600
    pipeline = pipeline.resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })

    // Convert to webp with standard quality level (80)
    const optimizedBuffer = await pipeline.webp({ quality: 80 }).toBuffer()

    // Replace or append .webp extension
    const dotIndex = originalFilename.lastIndexOf(".")
    const baseName = dotIndex !== -1 ? originalFilename.substring(0, dotIndex) : originalFilename
    const newFilename = `${baseName}.webp`

    return {
      buffer: optimizedBuffer,
      filename: newFilename,
      mimeType: "image/webp",
      isOptimized: true,
    }
  } catch (error) {
    console.error("Failed to optimize image, falling back to original:", error)
    return {
      buffer,
      filename: originalFilename,
      mimeType,
      isOptimized: false,
    }
  }
}
