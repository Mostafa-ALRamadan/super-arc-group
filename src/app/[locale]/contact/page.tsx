import { Metadata } from 'next';
import ContactSection from '@/components/sections/Contact';

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'اتصل بنا | مجموعة سوبر آرك' : 'Contact | Super Arc Group',
    description: locale === 'ar' 
      ? 'تواصل معنا لمناقشة مشاريعك واحتياجاتك الهندسية'
      : 'Get in touch with us to discuss your projects and engineering needs',
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
