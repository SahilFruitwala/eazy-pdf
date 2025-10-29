"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { formatFileSize, downloadBlob, isPDFFile } from "@/lib/pdf-utils"
import { compressPDF } from "@/lib/pdf-compression"

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [quality, setQuality] = useState([75])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isPDFFile(selectedFile)) {
      setFile(selectedFile)
      setOriginalSize(selectedFile.size)
      setCompressedBlob(null)
      setCompressedSize(0)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isPDFFile(droppedFile)) {
      setFile(droppedFile)
      setOriginalSize(droppedFile.size)
      setCompressedBlob(null)
      setCompressedSize(0)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const compressPDFFile = async () => {
    if (!file) return

    setCompressing(true)
    try {
      const blob = await compressPDF(file, quality[0])
      setCompressedBlob(blob)
      setCompressedSize(blob.size)
    } catch (error) {
      console.error("[v0] Error compressing PDF:", error)
      alert("Failed to compress PDF. Please try another file.")
    } finally {
      setCompressing(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedBlob || !file) return
    downloadBlob(compressedBlob, `compressed-${file.name}`)
  }

  const compressionPercentage =
    originalSize && compressedSize ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Compress PDF</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Reduce your PDF file size while maintaining quality. All processing happens in your browser.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>Select or drag and drop a PDF file to compress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium mb-2">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground">PDF files only</p>
                </label>
              </div>

              {/* Quality Slider */}
              {file && !compressedBlob && (
                <div className="space-y-3">
                  <Label htmlFor="quality-slider">Compression Level: {quality[0]}%</Label>
                  <Slider
                    id="quality-slider"
                    min={25}
                    max={100}
                    step={5}
                    value={quality}
                    onValueChange={setQuality}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Lower values = smaller file size, higher values = better quality
                  </p>
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Original Size:</span>
                    <span className="text-sm font-medium text-foreground">{formatFileSize(originalSize)}</span>
                  </div>
                  {compressedSize > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Compressed Size:</span>
                        <span className="text-sm font-medium text-foreground">{formatFileSize(compressedSize)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reduction:</span>
                        <span className="text-sm font-medium text-primary">
                          {compressionPercentage > 0 ? `${compressionPercentage}% smaller` : "No reduction"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!compressedBlob ? (
                  <Button onClick={compressPDFFile} disabled={!file || compressing} className="w-full sm:flex-1">
                    {compressing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      "Compress PDF"
                    )}
                  </Button>
                ) : (
                  <>
                    <Button onClick={downloadCompressed} className="w-full sm:flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed PDF
                    </Button>
                    <Button
                      onClick={() => {
                        setFile(null)
                        setCompressedBlob(null)
                        setOriginalSize(0)
                        setCompressedSize(0)
                      }}
                      variant="outline"
                      className="w-full sm:flex-1"
                    >
                      Compress Another
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <PrivacyNotice />
        </div>
      </main>
    </div>
  )
}
