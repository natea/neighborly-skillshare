import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans';
import './globals.css'

export const metadata: Metadata = {
  title: 'Neighborly Skillshare',
  description: 'A hyperlocal platform connecting neighbors to exchange skills and services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        {children}
      </body>
    </html>
  )
}