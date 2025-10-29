import Link from "next/link"
import { FileDown, Scissors, Merge, FileStack, ImageIcon, FileImage } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"

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

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8 md:pt-8">
        <div className="max-w-3xl flex mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Professional PDF Tools for Everyone
          </h1>
          <ModeToggle />
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Tool</h2>
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
      {/* <section id="features" className="bg-muted/30 py-16">
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
      </section> */}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 PDF Tools. All processing happens locally in your browser.</p>
        </div>
      </footer>
    </div>
  )
}
