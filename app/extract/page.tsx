"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PDFDocument } from "pdf-lib"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { downloadBlob, isPDFFile } from "@/lib/pdf-utils"
import { PDFSimpleViewer } from "@/components/pdf-simple-viewer"

export default function ExtractPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractedBlob, setExtractedBlob] = useState<Blob | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isPDFFile(selectedFile)) {
      setFile(selectedFile)
      setExtractedBlob(null)
      setSelectedPages(new Set())

      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const count = pdfDoc.getPageCount()
        setPageCount(count)
      } catch (error) {
        console.error("[v0] Error loading PDF:", error)
      }
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isPDFFile(droppedFile)) {
      setFile(droppedFile)
      setExtractedBlob(null)
      setSelectedPages(new Set())

      try {
        const arrayBuffer = await droppedFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const count = pdfDoc.getPageCount()
        setPageCount(count)
      } catch (error) {
        console.error("[v0] Error loading PDF:", error)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const togglePage = (pageNum: number) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum)
    } else {
      newSelected.add(pageNum)
    }
    setSelectedPages(newSelected)
  }

  const selectAll = () => {
    const allPages = new Set(Array.from({ length: pageCount }, (_, i) => i + 1))
    setSelectedPages(allPages)
  }

  const deselectAll = () => {
    setSelectedPages(new Set())
  }

  const extractPages = async () => {
    if (!file || selectedPages.size === 0) return

    setExtracting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const newPdf = await PDFDocument.create()

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b)
      const pagesToCopy = sortedPages.map((pageNum) => pageNum - 1)

      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      setExtractedBlob(blob)
    } catch (error) {
      console.error("[v0] Error extracting pages:", error)
      alert("Failed to extract pages. Please try another file.")
    } finally {
      setExtracting(false)
    }
  }

  const downloadExtracted = () => {
    if (!extractedBlob || !file) return
    downloadBlob(extractedBlob, `extracted-${file.name}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Extract Pages</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Select and extract specific pages from your PDF. All processing happens in your browser.
            </p>
          </div>

          <div className={`grid gap-6 ${file && !extractedBlob ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
            {/* Left side - Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF File</CardTitle>
                <CardDescription>Select or drag and drop a PDF file to extract pages from</CardDescription>
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
                    {pageCount > 0 && (
                      <p className="text-sm text-primary mt-2 font-medium">{pageCount} pages detected</p>
                    )}
                  </label>
                </div>

                {/* Page Selection */}
                {file && pageCount > 0 && !extractedBlob && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Select Pages to Extract</Label>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button size="sm" variant="outline" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedPages.size} of {pageCount} pages selected. Selected pages will be combined into one
                        PDF.
                      </p>
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => togglePage(pageNum)}
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                              selectedPages.has(pageNum)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:border-primary/50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Extraction Result */}
                {extractedBlob && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-2">Extraction Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      Extracted {selectedPages.size} page(s) ({Math.round(extractedBlob.size / 1024)} KB)
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!extractedBlob ? (
                    <Button
                      onClick={extractPages}
                      disabled={!file || selectedPages.size === 0 || extracting}
                      className="w-full sm:flex-1"
                    >
                      {extracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Extract Selected Pages
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={downloadExtracted} className="w-full sm:flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download Extracted PDF
                      </Button>
                      <Button
                        onClick={() => {
                          setFile(null)
                          setExtractedBlob(null)
                          setPageCount(0)
                          setSelectedPages(new Set())
                        }}
                        variant="outline"
                        className="w-full sm:flex-1"
                      >
                        Extract Another
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {file && !extractedBlob && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">PDF Preview</h3>
                <PDFSimpleViewer file={file} selectedPages={selectedPages} />
              </div>
            )}
          </div>

          <PrivacyNotice />
        </div>
      </main>
    </div>
  )
}
