import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Companies from '@/components/sections/Companies';
import Services from '@/components/sections/Services';
import ProjectsPreview from '@/components/sections/ProjectsPreview';
import Contact from '@/components/sections/Contact';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <Hero />
      
      <About />
      
      <Companies />
      
      <Services />
      
      <ProjectsPreview />
      
      <Contact locale={locale as 'en' | 'ar'} />
    </>
  );
}
