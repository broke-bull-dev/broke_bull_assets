import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-xl mx-auto px-4 pt-32 pb-16 text-center">
        <CheckCircle className="text-gold-500 w-20 h-20 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-white mb-4">Order Placed!</h1>
        <p className="text-gray-400 mb-2">
          Your order is confirmed. We'll send you a payment link and production timeline by email.
        </p>
        <p className="text-gray-500 text-sm mb-10">
          Estimated delivery: <span className="text-white">2–3 weeks</span> from payment confirmation.
        </p>

        <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-white font-bold mb-3">What happens next?</h2>
          <ol className="space-y-3">
            {[
              'You\'ll receive a payment link by email within 24 hours.',
              'Once paid, we begin production of your embroidered piece.',
              'Your garment ships within 2–3 weeks with tracking.',
              'A certificate of authenticity is included with your order.',
            ].map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="text-gold-500 font-bold flex-shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/account/orders" className="border border-dark-500 hover:border-gold-500/40 text-gray-300 font-medium px-6 py-3 rounded-xl transition-all text-sm">
            View My Orders
          </Link>
          <Link href="/" className="btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-3 rounded-xl transition-all text-sm">
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
