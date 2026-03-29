import { notFound } from 'next/navigation';
import { Cairo, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import '../globals.css';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import HashScrollHandler from '../../../components/layout/HashScrollHandler';
import { TranslationProvider } from '../../contexts/TranslationContext';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '600', '700'],
  preload: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
  weight: ['400', '600', '700', '800', '900'],
  preload: false,
});

const locales = ['en', 'ar'];

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className={`${locale === 'ar' ? cairo.variable : playfairDisplay.variable} ${locale === 'ar' ? 'font-cairo' : 'font-playfair-display'} min-h-screen bg-white text-neutral-900 antialiased`}>
      <TranslationProvider initialLocale={locale}>
        <Suspense>
          <HashScrollHandler />
        </Suspense>
        <Header />
        <main>{children}</main>
        <Footer />
      </TranslationProvider>
    </div>
  );
}
