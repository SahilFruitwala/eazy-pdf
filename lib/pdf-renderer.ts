import * as pdfjsLib from "pdfjs-dist"
import { initializePDFWorker } from "./pdf-worker-setup"

if (typeof window !== "undefined") {
  initializePDFWorker()
}

export interface PageThumbnail {
  pageNumber: number
  dataUrl: string
  width: number
  height: number
}

export async function renderPDFThumbnails(file: File, maxThumbnails = 50): Promise<PageThumbnail[]> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  const thumbnails: PageThumbnail[] = []
  const pageCount = Math.min(pdf.numPages, maxThumbnails)

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.5 })

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) continue

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    thumbnails.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL("image/jpeg", 0.7),
      width: viewport.width,
      height: viewport.height,
    })
  }

  return thumbnails
}

export async function renderSinglePage(file: File, pageNumber: number, scale = 1): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Could not get canvas context")

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise

  return canvas.toDataURL("image/jpeg", 0.8)
}

export async function renderPDFPagesToImages(
  file: File,
  format: "png" | "jpg" = "png",
  quality = 0.92,
  scale = 2.5,
): Promise<PageThumbnail[]> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  const images: PageThumbnail[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { alpha: format === "png" })
    if (!context) continue

    canvas.width = viewport.width
    canvas.height = viewport.height

    // Use high-quality rendering settings
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    const mimeType = format === "png" ? "image/png" : "image/jpeg"
    const dataUrl = canvas.toDataURL(mimeType, quality)

    images.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    })
  }

  return images
}
