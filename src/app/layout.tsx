import type { Metadata, Viewport } from "next";
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'Super Arc Group',
    template: '%s | Super Arc Group'
  },
  description: 'Super Arc Group - A trusted regional engineering, contracting, and development partner delivering integrated solutions across infrastructure, deep foundations, drilling, and real estate sectors since 1987.',
  keywords: ['engineering', 'construction', 'development', 'infrastructure', 'deep foundations', 'drilling', 'real estate', 'super arc group', 'UAE', 'Middle East'],
  authors: [{ name: 'Super Arc Group' }],
  creator: 'Super Arc Group',
  publisher: 'Super Arc Group',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://superarcgroup.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon/safari-pinned-tab.svg', color: '#2563eb' }
    ]
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://superarcgroup.com',
    title: 'Super Arc Group',
    description: 'A leading corporate company dedicated to excellence and innovation.',
    siteName: 'Super Arc Group',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Super Arc Group',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Arc Group',
    description: 'A leading corporate company dedicated to excellence and innovation.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'kDVffSkcPAcovlwPoEvjvwUVHPSZZvO8E3D6dho6OUA',
    yandex: 'your-yandex-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
