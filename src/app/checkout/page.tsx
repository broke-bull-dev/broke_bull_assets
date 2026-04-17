'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader } from 'lucide-react';
import { useCart } from '@/store/cart';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inputClass = 'w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    street: '', city: '', postalCode: '', country: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-dark-900">
        <Header />
        <div className="max-w-xl mx-auto px-4 pt-32 pb-16 text-center">
          <p className="text-gray-400 mb-6">Your cart is empty.</p>
          <Link href="/#products" className="text-gold-400 hover:underline">Browse products</Link>
        </div>
        <Footer />
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      for (const item of items) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: { id: item.productId, name: item.productName, price: item.price, currency: item.currency, color: item.color, size: item.size },
            nft: { name: item.nftName, collection: item.nftCollection, contract: item.nftContract, tokenId: item.nftTokenId, image: item.nftImage, chainId: item.nftChainId },
            customer: { ...form, walletAddress: item.walletAddress },
          }),
        });
        if (!res.ok) throw new Error('Order failed');
      }

      clearCart();
      router.push('/checkout/success');
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to cart
        </Link>
        <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Contact</h2>
              <div className="space-y-3">
                <input required placeholder="Full name" value={form.fullName} onChange={set('fullName')} className={inputClass} />
                <input required type="email" placeholder="Email address" value={form.email} onChange={set('email')} className={inputClass} />
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Shipping Address</h2>
              <div className="space-y-3">
                <input required placeholder="Street address" value={form.street} onChange={set('street')} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="City" value={form.city} onChange={set('city')} className={inputClass} />
                  <input required placeholder="Postal code" value={form.postalCode} onChange={set('postalCode')} className={inputClass} />
                </div>
                <input required placeholder="Country" value={form.country} onChange={set('country')} className={inputClass} />
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Notes <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
              <textarea placeholder="Any special instructions for your order?" value={form.notes} onChange={set('notes')} rows={3} className={`${inputClass} resize-none`} />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {submitting ? <><Loader size={18} className="animate-spin" />Placing Order…</> : `Place Order — €${total()}`}
            </button>
            <p className="text-xs text-gray-500 text-center">We'll send a payment link and production confirmation to your email. Ships in 2–3 weeks.</p>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold mb-4">Your Order</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.nftImage && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-dark-500 flex-shrink-0">
                        <Image src={item.nftImage} alt={item.nftName} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{item.productName}</p>
                      <p className="text-gray-500 text-xs">{item.color} · {item.size} · {item.nftName}</p>
                    </div>
                    <span className="text-gold-400 font-bold text-sm flex-shrink-0">€{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-500 pt-4">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-gold-400 font-black text-xl">€{total()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
