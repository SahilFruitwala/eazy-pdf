"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, GripVertical, Loader2, FileText } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { downloadBlob, formatFileSize } from "@/lib/pdf-utils"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface ImageFile {
  id: string
  file: File
  preview: string
}

type PageSize = "original" | "a4" | "letter"

type MarginType = "none" | "uniform" | "custom"

const PAGE_SIZES = {
  a4: { width: 595, height: 842 }, // A4 in points (72 points = 1 inch)
  letter: { width: 612, height: 792 }, // Letter in points
}

export default function ImageToPDFPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [pageSize, setPageSize] = useState<PageSize>("a4")
  const [centerImages, setCenterImages] = useState(true)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  const [marginType, setMarginType] = useState<MarginType>("none")
  const [uniformMargin, setUniformMargin] = useState(20)
  const [marginTop, setMarginTop] = useState(20)
  const [marginRight, setMarginRight] = useState(20)
  const [marginBottom, setMarginBottom] = useState(20)
  const [marginLeft, setMarginLeft] = useState(20)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImageFiles(files)
  }

  const addImageFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, JPEG, WebP)")
      return
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingFile(false)

    const files = Array.from(e.dataTransfer.files)
    addImageFiles(files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingFile(false)
  }, [])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) URL.revokeObjectURL(image.preview)
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOverReorder = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const convertToPDF = async () => {
    if (images.length === 0) return

    setIsProcessing(true)
    try {
      console.log("[v0] Starting image to PDF conversion")
      const pdfDoc = await PDFDocument.create()

      for (const image of images) {
        const arrayBuffer = await image.file.arrayBuffer()
        let embeddedImage

        if (image.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer)
        } else if (image.file.type === "image/jpeg" || image.file.type === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
        } else {
          const img = new Image()
          img.src = image.preview
          await new Promise((resolve) => (img.onload = resolve))

          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (!ctx) continue

          ctx.drawImage(img, 0, 0)
          const pngBlob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/png"))
          const pngArrayBuffer = await pngBlob.arrayBuffer()
          embeddedImage = await pdfDoc.embedPng(pngArrayBuffer)
        }

        let pageWidth: number
        let pageHeight: number
        let imageWidth: number
        let imageHeight: number
        let x: number
        let y: number

        let marginT = 0,
          marginR = 0,
          marginB = 0,
          marginL = 0

        if (pageSize !== "original" && marginType !== "none") {
          if (marginType === "uniform") {
            marginT = marginR = marginB = marginL = uniformMargin
          } else {
            marginT = marginTop
            marginR = marginRight
            marginB = marginBottom
            marginL = marginLeft
          }
        }

        if (pageSize === "original") {
          pageWidth = embeddedImage.width
          pageHeight = embeddedImage.height
          imageWidth = embeddedImage.width
          imageHeight = embeddedImage.height
          x = 0
          y = 0
        } else {
          const pageDimensions = PAGE_SIZES[pageSize]
          pageWidth = pageDimensions.width
          pageHeight = pageDimensions.height

          const availableWidth = pageWidth - marginL - marginR
          const availableHeight = pageHeight - marginT - marginB

          if (maintainAspectRatio) {
            const imageAspectRatio = embeddedImage.width / embeddedImage.height
            const availableAspectRatio = availableWidth / availableHeight

            if (imageAspectRatio > availableAspectRatio) {
              imageWidth = availableWidth
              imageHeight = availableWidth / imageAspectRatio
            } else {
              imageHeight = availableHeight
              imageWidth = availableHeight * imageAspectRatio
            }
          } else {
            imageWidth = availableWidth
            imageHeight = availableHeight
          }

          if (centerImages) {
            x = marginL + (availableWidth - imageWidth) / 2
            y = marginB + (availableHeight - imageHeight) / 2
          } else {
            x = marginL
            y = marginB
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight])
        page.drawImage(embeddedImage, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      downloadBlob(blob, "converted-images.pdf")

      console.log("[v0] Successfully converted", images.length, "images to PDF")
    } catch (error) {
      console.error("[v0] Error converting images to PDF:", error)
      alert("Failed to convert images to PDF. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Image to PDF</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Combine multiple images into a single PDF document
          </p>
        </div>

        <PrivacyNotice />

        <Card className="mb-6">
          <CardContent className="pt-6">
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
                isDraggingFile
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50",
              )}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    isDraggingFile ? "bg-primary/20" : "bg-background",
                  )}
                >
                  <Upload
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isDraggingFile ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isDraggingFile ? "Drop your images here" : "Drag and drop images here"}
                </p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG, JPEG, WebP supported</p>
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </label>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Page Size</Label>
              <RadioGroup value={pageSize} onValueChange={(value) => setPageSize(value as PageSize)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a4" id="a4" />
                  <Label htmlFor="a4" className="font-normal cursor-pointer">
                    A4 (595 × 842 pt) - Standard international size
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="letter" id="letter" />
                  <Label htmlFor="letter" className="font-normal cursor-pointer">
                    Letter (612 × 792 pt) - Standard US size
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="original" id="original" />
                  <Label htmlFor="original" className="font-normal cursor-pointer">
                    Original - Use each image's original dimensions
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {pageSize !== "original" && (
              <>
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maintain-aspect"
                      checked={maintainAspectRatio}
                      onCheckedChange={(checked) => setMaintainAspectRatio(checked as boolean)}
                    />
                    <Label htmlFor="maintain-aspect" className="font-normal cursor-pointer">
                      Maintain aspect ratio (prevent stretching)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="center-images"
                      checked={centerImages}
                      onCheckedChange={(checked) => setCenterImages(checked as boolean)}
                    />
                    <Label htmlFor="center-images" className="font-normal cursor-pointer">
                      Center images on page
                    </Label>
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-border">
                  <Label className="text-base font-semibold block">Page Margins</Label>
                  <RadioGroup value={marginType} onValueChange={(value) => setMarginType(value as MarginType)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="margin-none" />
                      <Label htmlFor="margin-none" className="font-normal cursor-pointer">
                        No margins
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="uniform" id="margin-uniform" />
                      <Label htmlFor="margin-uniform" className="font-normal cursor-pointer">
                        Uniform margin (all sides)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="margin-custom" />
                      <Label htmlFor="margin-custom" className="font-normal cursor-pointer">
                        Custom margins (individual sides)
                      </Label>
                    </div>
                  </RadioGroup>

                  {marginType === "uniform" && (
                    <div className="pl-6 pt-2">
                      <Label htmlFor="uniform-margin" className="text-sm mb-2 block">
                        Margin size (points)
                      </Label>
                      <Input
                        id="uniform-margin"
                        type="number"
                        min="0"
                        max="100"
                        value={uniformMargin}
                        onChange={(e) => setUniformMargin(Number(e.target.value))}
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground mt-1">1 inch ≈ 72 points</p>
                    </div>
                  )}

                  {marginType === "custom" && (
                    <div className="pl-6 pt-2 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="margin-top" className="text-sm mb-2 block">
                          Top (points)
                        </Label>
                        <Input
                          id="margin-top"
                          type="number"
                          min="0"
                          max="100"
                          value={marginTop}
                          onChange={(e) => setMarginTop(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="margin-right" className="text-sm mb-2 block">
                          Right (points)
                        </Label>
                        <Input
                          id="margin-right"
                          type="number"
                          min="0"
                          max="100"
                          value={marginRight}
                          onChange={(e) => setMarginRight(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="margin-bottom" className="text-sm mb-2 block">
                          Bottom (points)
                        </Label>
                        <Input
                          id="margin-bottom"
                          type="number"
                          min="0"
                          max="100"
                          value={marginBottom}
                          onChange={(e) => setMarginBottom(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="margin-left" className="text-sm mb-2 block">
                          Left (points)
                        </Label>
                        <Input
                          id="margin-left"
                          type="number"
                          min="0"
                          max="100"
                          value={marginLeft}
                          onChange={(e) => setMarginLeft(Number(e.target.value))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground col-span-2">1 inch ≈ 72 points</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {images.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {images.length} image{images.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total size: {formatFileSize(images.reduce((sum, img) => sum + img.file.size, 0))}
                    </p>
                  </div>
                  <Button onClick={convertToPDF} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Convert to PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">Drag images to reorder them</p>
                <div className="space-y-3">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOverReorder(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-move ${
                        draggedIndex === index ? "opacity-50" : ""
                      }`}
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="w-16 h-16 bg-background rounded overflow-hidden flex-shrink-0">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt={image.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{image.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(image.file.size)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeImage(image.id)} className="flex-shrink-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
