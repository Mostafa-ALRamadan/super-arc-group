import Hero from '@/components/sections/Hero';
import { Metadata } from 'next';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    en: 'Home',
    ar: 'الرئيسية'
  };
  
  const descriptions = {
    en: 'Super Arc Group - A trusted regional engineering, contracting, and development partner delivering integrated solutions across infrastructure, deep foundations, drilling, and real estate sectors.',
    ar: 'مجموعة سوبر آرك - شريك إقليمي موثوق في الهندسة والمقاولات والتطوير، يقدم حلولاً متكاملة في قطاعات البنية التحتية والأساسات العميقة والحفر والعقارات.'
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <Hero />
    </>
  );
}
