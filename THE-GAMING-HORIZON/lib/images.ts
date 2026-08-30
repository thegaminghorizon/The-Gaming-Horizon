// Resizes and compresses an image file client-side into a JPEG data URL.
// Keeps uploads (profile avatars, blog cover images, design suggestions)
// small enough to store as a data URL without blowing past size limits.
export async function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Please choose an image smaller than 12 MB.')
  const src = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('That image could not be read.'))
      img.src = src
    })
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Image processing is unavailable in this browser.')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(src)
  }
}
