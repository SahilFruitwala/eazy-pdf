"use client"

import { useEffect, useState } from "react"
import { Loader2, FileText } from "lucide-react"

interface PDFSimpleViewerProps {
  file: File
  selectedPages?: Set<number>
}

export function PDFSimpleViewer({ file, selectedPages }: PDFSimpleViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)

    // Get page count using pdf-lib
    const getPageCount = async () => {
      try {
        const { PDFDocument } = await import("pdf-lib")
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        setPageCount(pdfDoc.getPageCount())
      } catch (error) {
        console.error("[v0] Error getting page count:", error)
      }
    }

    getPageCount()

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading PDF...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedPages && selectedPages.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedPages.size} page{selectedPages.size !== 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Pages:{" "}
                {Array.from(selectedPages)
                  .sort((a, b) => a - b)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
        <div className="bg-muted/50 px-4 py-2 border-b border-border">
          <p className="text-sm text-muted-foreground">
            {file.name} {pageCount > 0 && `• ${pageCount} pages`}
          </p>
        </div>
        <iframe src={pdfUrl} className="w-full h-[600px] bg-white" title="PDF Preview" />
      </div>
    </div>
  )
}
