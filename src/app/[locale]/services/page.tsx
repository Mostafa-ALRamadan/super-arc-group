import { Metadata } from 'next';
import Services from '@/components/sections/Services';

interface ServicesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    en: 'Services',
    ar: 'الخدمات'
  };
  
  const descriptions = {
    en: 'Super Arc Group offers comprehensive engineering services including Engineering & Design, Construction & Infrastructure, Oil & Gas Services, and Development & Investment across the region.',
    ar: 'تقدم مجموعة سوبر آرك خدمات هندسية شاملة تشمل الهندسة والتصميم، الإنشاء والبنية التحتية، النفط والغاز، والتطوير والاستثمار في جميع أنحاء المنطقة.'
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
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
