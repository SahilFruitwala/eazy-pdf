import * as pdfjsLib from "pdfjs-dist"

let workerInitialized = false

export function initializePDFWorker() {
  if (workerInitialized || typeof window === "undefined") {
    return
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    workerInitialized = true
    console.log("[v0] PDF.js worker initialized successfully")
  } catch (error) {
    console.error("[v0] Failed to initialize PDF.js worker:", error)
  }
}
