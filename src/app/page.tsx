import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductsSection } from '@/components/ProductsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <Hero />
      <ProductsSection />
      <HowItWorks />
      <Footer />
    </main>
  );
}
