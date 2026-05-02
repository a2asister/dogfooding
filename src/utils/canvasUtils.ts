export const getLayerCanvasId = (layerId: string) => `layer-${layerId}`;
export const getLayerMaskCanvasId = (layerId: string) => `layer-mask-${layerId}`;

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');
  return ctx;
};

export const clearCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = getCanvasContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const fillCanvas = (canvas: HTMLCanvasElement, color: string) => {
  const ctx = getCanvasContext(canvas);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const drawImageOnCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  _x?: number,
  _y?: number,
  width?: number,
  height?: number
) => {
  const ctx = getCanvasContext(canvas);
  const w = width ?? image.width;
  const h = height ?? image.height;
  
  const scale = Math.min(canvas.width / w, canvas.height / h) * 0.9;
  const drawWidth = w * scale;
  const drawHeight = h * scale;
  const drawX = (canvas.width - drawWidth) / 2;
  const drawY = (canvas.height - drawHeight) / 2;
  
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
};

export const canvasToBlob = (canvas: HTMLCanvasElement, format: string, quality?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const actualFormat = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not convert canvas to blob'));
      },
      actualFormat,
      quality
    );
  });
};

export const getImageData = (canvas: HTMLCanvasElement): ImageData => {
  const ctx = getCanvasContext(canvas);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

export const putImageData = (canvas: HTMLCanvasElement, imageData: ImageData) => {
  const ctx = getCanvasContext(canvas);
  ctx.putImageData(imageData, 0, 0);
};

export const copyCanvasContent = (source: HTMLCanvasElement, target: HTMLCanvasElement) => {
  const ctx = getCanvasContext(target);
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(source, 0, 0);
};

export const createMaskCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = createCanvas(width, height);
  const ctx = getCanvasContext(canvas);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  return canvas;
};

export const applyMaskToLayer = (
  layerCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): HTMLCanvasElement => {
  const result = createCanvas(layerCanvas.width, layerCanvas.height);
  
  const layerData = getImageData(layerCanvas);
  const maskData = getImageData(maskCanvas);
  
  for (let i = 0; i < layerData.data.length; i += 4) {
    const maskAlpha = maskData.data[i] / 255;
    layerData.data[i + 3] = Math.round(layerData.data[i + 3] * maskAlpha);
  }
  
  putImageData(result, layerData);
  return result;
};