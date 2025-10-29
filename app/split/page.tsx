"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, Loader2, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PDFDocument } from "pdf-lib"
import { PDFHeader } from "@/components/pdf-header"
import { PrivacyNotice } from "@/components/privacy-notice"
import { downloadBlob, isPDFFile } from "@/lib/pdf-utils"
import { PDFSimpleViewer } from "@/components/pdf-simple-viewer"

type SplitMode = "all" | "range" | "interval" | "select"

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [splitFiles, setSplitFiles] = useState<Blob[]>([])
  const [pageCount, setPageCount] = useState<number>(0)
  const [splitMode, setSplitMode] = useState<SplitMode>("all")
  const [rangeStart, setRangeStart] = useState<string>("1")
  const [rangeEnd, setRangeEnd] = useState<string>("")
  const [interval, setInterval] = useState<string>("1")
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isPDFFile(selectedFile)) {
      setFile(selectedFile)
      setSplitFiles([])
      setSelectedPages(new Set())

      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const count = pdfDoc.getPageCount()
        setPageCount(count)
        setRangeEnd(count.toString())
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isPDFFile(droppedFile)) {
      setFile(droppedFile)
      setSplitFiles([])
      setSelectedPages(new Set())

      try {
        const arrayBuffer = await droppedFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const count = pdfDoc.getPageCount()
        setPageCount(count)
        setRangeEnd(count.toString())
      } catch (error) {
        console.error("Error loading PDF:", error)
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

  const splitPDF = async () => {
    if (!file) return

    setSplitting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()
      const newSplitFiles: Blob[] = []

      if (splitMode === "select") {
        if (selectedPages.size === 0) {
          alert("Please select at least one page")
          setSplitting(false)
          return
        }

        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b)
        for (const pageNum of sortedPages) {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1])
          newPdf.addPage(copiedPage)
          const pdfBytes = await newPdf.save()
          newSplitFiles.push(new Blob([pdfBytes], { type: "application/pdf" }))
        }
      } else if (splitMode === "all") {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
          newPdf.addPage(copiedPage)
          const pdfBytes = await newPdf.save()
          newSplitFiles.push(new Blob([pdfBytes], { type: "application/pdf" }))
        }
      } else if (splitMode === "range") {
        const start = Math.max(1, Number.parseInt(rangeStart) || 1)
        const end = Math.min(totalPages, Number.parseInt(rangeEnd) || totalPages)

        if (start <= end) {
          const newPdf = await PDFDocument.create()
          const pagesToCopy = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
          const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy)
          copiedPages.forEach((page) => newPdf.addPage(page))
          const pdfBytes = await newPdf.save()
          newSplitFiles.push(new Blob([pdfBytes], { type: "application/pdf" }))
        }
      } else if (splitMode === "interval") {
        const intervalNum = Math.max(1, Number.parseInt(interval) || 1)
        for (let i = 0; i < totalPages; i += intervalNum) {
          const newPdf = await PDFDocument.create()
          const pagesToCopy = Array.from({ length: Math.min(intervalNum, totalPages - i) }, (_, j) => i + j)
          const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy)
          copiedPages.forEach((page) => newPdf.addPage(page))
          const pdfBytes = await newPdf.save()
          newSplitFiles.push(new Blob([pdfBytes], { type: "application/pdf" }))
        }
      }

      setSplitFiles(newSplitFiles)
    } catch (error) {
      console.error("Error splitting PDF:", error)
      alert("Failed to split PDF. Please try another file.")
    } finally {
      setSplitting(false)
    }
  }

  const downloadFile = (blob: Blob, index: number) => {
    downloadBlob(blob, `split-${file?.name.replace(".pdf", "")}-${index + 1}.pdf`)
  }

  const downloadAll = () => {
    splitFiles.forEach((blob, index) => {
      setTimeout(() => downloadFile(blob, index), index * 100)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <PDFHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Split PDF</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Divide your PDF into multiple files. All processing happens in your browser.
            </p>
          </div>

          <div className={`grid gap-6 ${file && splitFiles.length === 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
            {/* Left side - Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF File</CardTitle>
                <CardDescription>Select or drag and drop a PDF file to split</CardDescription>
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

                {/* Split Options */}
                {file && splitFiles.length === 0 && (
                  <div className="space-y-4">
                    <Label>Split Mode</Label>
                    <RadioGroup value={splitMode} onValueChange={(value) => setSplitMode(value as SplitMode)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="font-normal cursor-pointer">
                          Split into individual pages
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="range" id="range" />
                        <Label htmlFor="range" className="font-normal cursor-pointer">
                          Extract page range
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interval" id="interval" />
                        <Label htmlFor="interval" className="font-normal cursor-pointer">
                          Split by interval
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="select" id="select" />
                        <Label htmlFor="select" className="font-normal cursor-pointer">
                          Select specific pages (by number)
                        </Label>
                      </div>
                    </RadioGroup>

                    {splitMode === "select" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Select Pages to Split</Label>
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
                            {selectedPages.size} of {pageCount} pages selected. Each selected page will be saved as a
                            separate file.
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

                    {splitMode === "range" && (
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label htmlFor="range-start">Start Page</Label>
                          <Input
                            id="range-start"
                            type="number"
                            min="1"
                            max={pageCount}
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="range-end">End Page</Label>
                          <Input
                            id="range-end"
                            type="number"
                            min="1"
                            max={pageCount}
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {splitMode === "interval" && (
                      <div>
                        <Label htmlFor="interval-input">Pages per file</Label>
                        <Input
                          id="interval-input"
                          type="number"
                          min="1"
                          max={pageCount}
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Will create {Math.ceil(pageCount / (Number.parseInt(interval) || 1))} file(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Results */}
                {splitFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-foreground mb-3">
                        Successfully split into {splitFiles.length} file(s)
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {splitFiles.map((blob, index) => (
                          <div key={index} className="flex items-center justify-between bg-background rounded p-2">
                            <span className="text-sm text-foreground">
                              File {index + 1} ({Math.round(blob.size / 1024)} KB)
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => downloadFile(blob, index)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {splitFiles.length === 0 ? (
                    <Button onClick={splitPDF} disabled={!file || splitting} className="w-full sm:flex-1">
                      {splitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Splitting...
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4 mr-2" />
                          Split PDF
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={downloadAll} className="w-full sm:flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download All Files
                      </Button>
                      <Button
                        onClick={() => {
                          setFile(null)
                          setSplitFiles([])
                          setPageCount(0)
                          setSelectedPages(new Set())
                        }}
                        variant="outline"
                        className="w-full sm:flex-1"
                      >
                        Split Another
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {file && splitFiles.length === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">PDF Preview</h3>
                <PDFSimpleViewer file={file} selectedPages={splitMode === "select" ? selectedPages : undefined} />
              </div>
            )}
          </div>

          <PrivacyNotice />
        </div>
      </main>
    </div>
  )
}
