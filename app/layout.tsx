import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NourishLink | Rescue Food. Feed Communities.',
  description: 'The smartest platform to connect surplus food from restaurants with NGOs and communities in need.',
  keywords: 'food rescue, food donation, NGO, restaurant, surplus food, community',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
