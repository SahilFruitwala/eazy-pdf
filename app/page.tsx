import Link from "next/link"
import { FileDown, Scissors, Merge, FileStack, Shield, Zap, Lock, ImageIcon, FileImage } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const tools = [
    {
      title: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: FileDown,
      href: "/compress",
      color: "text-primary",
    },
    {
      title: "Split PDF",
      description: "Divide a PDF into multiple separate files",
      icon: Scissors,
      href: "/split",
      color: "text-accent",
    },
    {
      title: "Merge PDF",
      description: "Combine multiple PDFs into a single document",
      icon: Merge,
      href: "/merge",
      color: "text-primary",
    },
    {
      title: "Extract Pages",
      description: "Extract specific pages from your PDF",
      icon: FileStack,
      href: "/extract",
      color: "text-accent",
    },
    {
      title: "PDF to Image",
      description: "Convert PDF pages into individual images",
      icon: ImageIcon,
      href: "/pdf-to-image",
      color: "text-primary",
    },
    {
      title: "Image to PDF",
      description: "Combine multiple images into one PDF",
      icon: FileImage,
      href: "/image-to-pdf",
      color: "text-accent",
    },
  ]

  const features = [
    {
      icon: Lock,
      title: "100% Private",
      description: "All processing happens in your browser. Your files never leave your device.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for performance to handle large PDFs efficiently.",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "No uploads, no servers, no data collection. Complete privacy guaranteed.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">PDF Tools</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Professional PDF Tools for Everyone
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
            Compress, split, merge, extract pages, convert PDF to image, and convert image to PDF entirely in your
            browser. Fast, secure, and completely private. No uploads required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="#tools">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Tool</h2>
          <p className="text-muted-foreground text-lg">Select the PDF operation you need to perform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors ${tool.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Our PDF Tools?</h2>
            <p className="text-muted-foreground text-lg">Built with privacy and performance in mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 PDF Tools. All processing happens locally in your browser.</p>
        </div>
      </footer>
    </div>
  )
}
