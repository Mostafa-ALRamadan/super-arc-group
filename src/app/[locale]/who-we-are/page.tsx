import About from '@/components/sections/About';
import Companies from '@/components/sections/Companies';
import Leadership from '@/components/sections/Leadership';
import { Metadata } from 'next';

interface WhoWeArePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: WhoWeArePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    en: 'Who We Are',
    ar: 'من نحن'
  };
  
  const descriptions = {
    en: 'Learn about Super Arc Group - Our history, vision, mission, and leadership team delivering engineering excellence since 1987 across the Middle East region.',
    ar: 'تعرف على مجموعة سوبر آرك - تاريخنا ورؤيتنا ومهمتنا وفريق القيادة الذي يقدم التميز الهندسي منذ 1987 في جميع أنحاء منطقة الشرق الأوسط.'
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
  };
}

export default async function WhoWeArePage({ params }: WhoWeArePageProps) {
  const { locale } = await params;

  return (
    <>
      <About />
      <Companies />
      <Leadership />
    </>
  );
}
