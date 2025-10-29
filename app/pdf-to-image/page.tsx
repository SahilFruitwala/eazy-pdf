"use client"

import { useState } from "react"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { FileUploadZone } from "@/components/file-upload-zone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, ImageIcon, Loader2 } from "lucide-react"
import { downloadBlob } from "@/lib/pdf-utils"
import JSZip from "jszip"

export default function PDFToImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<{ pageNumber: number; dataUrl: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [format, setFormat] = useState<"png" | "jpg">("png")
  const [quality, setQuality] = useState(0.92)

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setImages([])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)

    try {
      const { renderPDFPagesToImages } = await import("@/lib/pdf-renderer")
      console.log("[v0] Starting PDF to image conversion with format:", format, "quality:", quality)
      const convertedImages = await renderPDFPagesToImages(
        file,
        format,
        quality,
        2.5
      )

      setImages(convertedImages)
      console.log("[v0] Converted", convertedImages.length, "pages to images")
    } catch (error) {
      console.error("[v0] Error converting PDF to images:", error)
      alert("Failed to convert PDF to images. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSingleImage = (image: { pageNumber: number; dataUrl: string }) => {
    const link = document.createElement("a")
    link.href = image.dataUrl
    link.download = `${file?.name.replace(".pdf", "")}_page_${image.pageNumber}.${format}`
    link.click()
  }

  const downloadAllAsZip = async () => {
    if (images.length === 0) return

    setIsProcessing(true)
    try {
      const zip = new JSZip()
      const baseName = file?.name.replace(".pdf", "") || "document"

      images.forEach((image) => {
        const base64Data = image.dataUrl.split(",")[1]
        zip.file(`${baseName}_page_${image.pageNumber}.${format}`, base64Data, { base64: true })
      })

      const blob = await zip.generateAsync({ type: "blob" })
      downloadBlob(blob, `${baseName}_images.zip`)
    } catch (error) {
      console.error("[v0] Error creating zip:", error)
      alert("Failed to create zip file. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">PDF to Image</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Convert each page of your PDF into individual images
          </p>
        </div>

        <PrivacyNotice />

        <Card className="mb-6">
          <CardContent className="pt-6">
            <FileUploadZone onFileSelect={handleFileSelect} accept=".pdf" />
          </CardContent>
        </Card>

        {file && !isProcessing && images.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Output Format</Label>
                  <RadioGroup value={format} onValueChange={(value) => setFormat(value as "png" | "jpg")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="png" id="png" />
                      <Label htmlFor="png" className="cursor-pointer">
                        PNG (Lossless, larger file size)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jpg" id="jpg" />
                      <Label htmlFor="jpg" className="cursor-pointer">
                        JPG (Compressed, smaller file size)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button onClick={handleConvert} className="w-full">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Convert to Images
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                <span className="text-lg text-muted-foreground">Converting PDF to images...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {images.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Converted {images.length} page{images.length !== 1 ? "s" : ""} to {format.toUpperCase()}
                    </p>
                  </div>
                  <Button onClick={downloadAllAsZip} disabled={isProcessing}>
                    <Download className="w-4 h-4 mr-2" />
                    Download All as ZIP
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.pageNumber} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-3 overflow-hidden">
                      <img
                        src={image.dataUrl || "/placeholder.svg"}
                        alt={`Page ${image.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Page {image.pageNumber}</span>
                      <Button size="sm" variant="outline" onClick={() => downloadSingleImage(image)}>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
