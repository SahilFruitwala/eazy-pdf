"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, Loader2, Merge, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PDFDocument } from "pdf-lib"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { downloadBlob, isPDFFile } from "@/lib/pdf-utils"

interface UploadedFile {
  file: File
  id: string
  pageCount: number
}

export default function MergePage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [merging, setMerging] = useState(false)
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      const pdfFiles = selectedFiles.filter((file) => isPDFFile(file))

      const newFiles: UploadedFile[] = []
      for (const file of pdfFiles) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          newFiles.push({
            file,
            id: Math.random().toString(36).substring(7),
            pageCount: pdfDoc.getPageCount(),
          })
        } catch (error) {
          console.error("[v0] Error loading PDF:", error)
        }
      }

      setFiles([...files, ...newFiles])
      setMergedBlob(null)
    },
    [files],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFiles = Array.from(e.dataTransfer.files)
      const pdfFiles = droppedFiles.filter((file) => isPDFFile(file))

      const newFiles: UploadedFile[] = []
      for (const file of pdfFiles) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          newFiles.push({
            file,
            id: Math.random().toString(36).substring(7),
            pageCount: pdfDoc.getPageCount(),
          })
        } catch (error) {
          console.error("[v0] Error loading PDF:", error)
        }
      }

      setFiles([...files, ...newFiles])
      setMergedBlob(null)
    },
    [files],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id))
    setMergedBlob(null)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    setFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const mergePDFs = async () => {
    if (files.length < 2) return

    setMerging(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const uploadedFile of files) {
        const arrayBuffer = await uploadedFile.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      setMergedBlob(blob)
    } catch (error) {
      console.error("[v0] Error merging PDFs:", error)
      alert("Failed to merge PDFs. Please try again.")
    } finally {
      setMerging(false)
    }
  }

  const downloadMerged = () => {
    if (!mergedBlob) return
    downloadBlob(mergedBlob, "merged-document.pdf")
  }

  const totalPages = files.reduce((sum, file) => sum + file.pageCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Merge PDFs</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Combine multiple PDF files into a single document. All processing happens in your browser.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Files</CardTitle>
              <CardDescription>Select or drag and drop multiple PDF files to merge</CardDescription>
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
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">Select multiple PDF files</p>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {files.length} file(s) selected ({totalPages} total pages)
                    </p>
                    <p className="text-xs text-muted-foreground">Drag to reorder</p>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {files.map((uploadedFile, index) => (
                      <div
                        key={uploadedFile.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 bg-muted/50 rounded-lg p-3 cursor-move hover:bg-muted transition-colors ${
                          draggedIndex === index ? "opacity-50" : ""
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {uploadedFile.pageCount} page(s) • {Math.round(uploadedFile.file.size / 1024)} KB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Merged Result */}
              {mergedBlob && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Merge Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Combined {files.length} files into one PDF ({Math.round(mergedBlob.size / 1024)} KB)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!mergedBlob ? (
                  <Button onClick={mergePDFs} disabled={files.length < 2 || merging} className="w-full sm:flex-1">
                    {merging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Merge className="w-4 h-4 mr-2" />
                        Merge PDFs
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button onClick={downloadMerged} className="w-full sm:flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download Merged PDF
                    </Button>
                    <Button
                      onClick={() => {
                        setFiles([])
                        setMergedBlob(null)
                      }}
                      variant="outline"
                      className="w-full sm:flex-1"
                    >
                      Merge Another
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
