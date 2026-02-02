import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { SessionProvider } from '@/components/providers/session-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pointfly.app'),
  title: {
    default: 'PointFly - Free Sports Predictions',
    template: '%s | PointFly',
  },
  description:
    'Free play-to-earn sports predictions. Pick your favorite NBA team, bet on the spread with virtual points, and compete with friends. No real money involved.',
  keywords: [
    'sports predictions',
    'NBA betting',
    'fantasy sports',
    'free sports game',
    'spread betting',
    'basketball predictions',
    'sports picks',
    'play to earn',
  ],
  authors: [{ name: 'PointFly' }],
  creator: 'PointFly',
  publisher: 'PointFly',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PointFly',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PointFly',
    title: 'PointFly - Free Sports Predictions',
    description:
      'Pick your favorite NBA team, bet on the spread with virtual points, and compete with friends. Free to play, no real money involved.',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'PointFly Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'PointFly - Free Sports Predictions',
    description:
      'Pick your favorite NBA team, bet on the spread with virtual points, and compete with friends.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
