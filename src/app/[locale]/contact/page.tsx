import { Metadata } from 'next';
import ContactSection from '@/components/sections/Contact';

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    en: 'Contact',
    ar: 'اتصل بنا'
  };
  
  const descriptions = {
    en: 'Contact Super Arc Group for engineering consultancy, construction services, and development projects. Reach us at our offices in Syria, Hama and Abu Dhabi, UAE.',
    ar: 'تواصل مع مجموعة سوبر آرك للاستشارات الهندسية وخدمات البناء ومشاريع التطوير. تواصل معنا في مكاتبنا في سوريا، حماة وأبوظبي، الإمارات العربية المتحدة.'
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen pt-32">
      <ContactSection locale={locale} />
    </div>
  );
}
