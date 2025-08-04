import { type Crop } from 'react-image-crop';

// Helper function to get the cropped image as a File object
export function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Ensure crop dimensions are valid numbers before proceeding
  const cropWidth = typeof crop.width === 'number' ? crop.width : 0;
  const cropHeight = typeof crop.height === 'number' ? crop.height : 0;
  const cropX = typeof crop.x === 'number' ? crop.x : 0;
  const cropY = typeof crop.y === 'number' ? crop.y : 0;

  canvas.width = cropWidth * scaleX;
  canvas.height = cropHeight * scaleY;
  
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get 2D context from canvas');
    return Promise.resolve(null);
  }

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    cropX * scaleX,
    cropY * scaleY,
    cropWidth * scaleX,
    cropHeight * scaleY,
    0,
    0,
    cropWidth * scaleX,
    cropHeight * scaleY
  );

  // Convert the canvas content to a Blob, then to a File
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas to Blob conversion failed');
        resolve(null);
        return;
      }
      resolve(new File([blob], fileName, { type: blob.type || 'image/png' }));
    }, 'image/png'); // Default to PNG, or use original file type if available and needed
  });
}