export function compressImageToDataUrl(
  file: File,
  maxDimension = 720,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Invalid image data.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback if browser cannot decode into Canvas
        if (dataUrl.length <= 550000) {
          resolve(dataUrl);
        } else {
          reject(new Error('Image file is too large and could not be compressed.'));
        }
      };
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl.slice(0, 550000));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let compressed = canvas.toDataURL('image/jpeg', quality);
        if (compressed.length > 520000) {
          compressed = canvas.toDataURL('image/jpeg', 0.5);
        }
        if (compressed.length > 580000) {
          reject(new Error('Compressed image still exceeds database limit. Please choose a smaller photo.'));
          return;
        }
        resolve(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
