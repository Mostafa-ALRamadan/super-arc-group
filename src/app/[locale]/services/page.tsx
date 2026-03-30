import { Metadata } from 'next';
import Services from '@/components/sections/Services';

interface ServicesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'الخدمات | مجموعة سوبر آرك' : 'Services | Super Arc Group',
    description: locale === 'ar' 
      ? 'نقدم خدمات هندسية شاملة تشمل الاستشارات والتصميم والإشراف والتنفيذ'
      : 'We offer comprehensive engineering services including consulting, design, supervision, and execution',
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Services />
    </div>
  );
}
