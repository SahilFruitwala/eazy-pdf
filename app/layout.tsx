import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"


export const metadata: Metadata = {
  title: "PDF Tools - Compress, Split, Merge & Extract PDFs",
  description:
    "Free online PDF tools. Compress, split, merge, and extract pages from PDFs entirely in your browser. Fast, secure, and private.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
