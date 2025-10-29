"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { renderPDFThumbnails, type PageThumbnail } from "@/lib/pdf-renderer"
import { initializePDFWorker } from "@/lib/pdf-worker-setup"

interface PDFThumbnailGridProps {
  file: File
  selectedPages: Set<number>
  onTogglePage: (pageNumber: number) => void
  pageCount: number
}

export function PDFThumbnailGrid({ file, selectedPages, onTogglePage, pageCount }: PDFThumbnailGridProps) {
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadThumbnails = async () => {
      setLoading(true)
      setError(null)

      try {
        initializePDFWorker()

        const thumbs = await renderPDFThumbnails(file, 100)
        if (!cancelled) {
          setThumbnails(thumbs)
        }
      } catch (error) {
        console.error("[v0] Error rendering thumbnails:", error)
        if (!cancelled) {
          setError("Failed to load PDF previews. You can still select pages by number.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadThumbnails()

    return () => {
      cancelled = true
    }
  }, [file])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading page previews...</span>
      </div>
    )
  }

  if (error || thumbnails.length === 0) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onTogglePage(pageNum)}
              className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center font-medium ${
                selectedPages.has(pageNum)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 bg-muted"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {thumbnails.map((thumbnail) => (
        <button
          key={thumbnail.pageNumber}
          onClick={() => onTogglePage(thumbnail.pageNumber)}
          className={`relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
            selectedPages.has(thumbnail.pageNumber)
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="aspect-[3/4] bg-muted relative">
            <img
              src={thumbnail.dataUrl || "/placeholder.svg"}
              alt={`Page ${thumbnail.pageNumber}`}
              className="w-full h-full object-contain"
            />
            {selectedPages.has(thumbnail.pageNumber) && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
            )}
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 py-2 text-center text-sm font-medium ${
              selectedPages.has(thumbnail.pageNumber)
                ? "bg-primary text-primary-foreground"
                : "bg-background/90 text-foreground"
            }`}
          >
            Page {thumbnail.pageNumber}
          </div>
        </button>
      ))}
    </div>
  )
}
