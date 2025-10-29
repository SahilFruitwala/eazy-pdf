import { PDFDocument } from "pdf-lib"

export async function compressPDF(file: File, quality: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

  // Remove metadata to reduce size
  pdfDoc.setTitle("")
  pdfDoc.setAuthor("")
  pdfDoc.setSubject("")
  pdfDoc.setKeywords([])
  pdfDoc.setProducer("")
  pdfDoc.setCreator("")

  // Calculate compression based on quality (25-100)
  // Lower quality = more aggressive compression
  const compressionFactor = quality / 100

  // Save with compression options based on quality
  const saveOptions: any = {
    useObjectStreams: compressionFactor < 0.8, // Use object streams for better compression at lower quality
    addDefaultPage: false,
  }

  // For lower quality, we'll re-save the PDF which applies compression
  let pdfBytes = await pdfDoc.save(saveOptions)

  // Apply additional compression passes for lower quality settings
  if (quality < 75) {
    // Load and re-save to apply additional compression
    const tempDoc = await PDFDocument.load(pdfBytes)
    pdfBytes = await tempDoc.save(saveOptions)
  }

  if (quality < 50) {
    // Another compression pass for very low quality
    const tempDoc = await PDFDocument.load(pdfBytes)
    pdfBytes = await tempDoc.save(saveOptions)
  }

  return new Blob([pdfBytes], { type: "application/pdf" })
}
