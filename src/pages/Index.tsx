import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { Solutions } from '@/components/Solutions';
import { Plans } from '@/components/Plans';
import { Differentials } from '@/components/Differentials';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Solutions />
        <Plans />
        <Differentials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
