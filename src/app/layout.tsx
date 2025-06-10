import './globals.css'

export const metadata = {
  title: 'Planning Poker',
  description: 'A real-time planning poker application for agile teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
