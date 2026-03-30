import About from '@/components/sections/About';
import Companies from '@/components/sections/Companies';
import Leadership from '@/components/sections/Leadership';

interface WhoWeArePageProps {
  params: Promise<{
    locale: string;
  }>;
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
