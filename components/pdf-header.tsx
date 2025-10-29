
import Link from "next/link"
import { FileStack, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./theme-toggle"

export function PDFHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileStack className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">PDF Tools</span>
        </Link>
        <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
