import { listenResize } from "@knitkode/core-dom";

/**
 * Size canvas (and return its new width and height)
 *
 * @returns {{ w: number, h: number }} The current canvas height (same as window by default)
 */
function sizeFullscreenCanvas(element: HTMLCanvasElement) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  element.width = w;
  element.height = h;

  return { w, h };
}

/**
 * Create fullscreen canvas
 */
export function createFullscreenCanvas(
  id: string,
  onResize?: (canvas: HTMLCanvasElement, width: number, height: number) => any
) {
  const canvas = document.createElement("canvas");
  canvas.id = id;
  document.body.appendChild(canvas);

  sizeFullscreenCanvas(canvas);

  if (onResize) {
    listenResize(() => {
      const size = sizeFullscreenCanvas(canvas);
      onResize(canvas, size.w, size.h);
    });
  }

  return canvas;
}
