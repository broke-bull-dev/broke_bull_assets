'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/cart';
import { ClothingMockup } from '@/components/ClothingPreview';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CartPage() {
  const { items, removeItem, total } = useCart();

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="text-3xl font-black text-white mb-8">
          Shopping <span className="gold-text">Cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-8">Connect your wallet and pick an NFT to customize a garment.</p>
            <Link href="/#products" className="btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-3 rounded-xl transition-all">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-dark-800 border border-dark-500 rounded-2xl p-5 flex gap-5">

                  {/* Garment thumbnail */}
                  <div className="flex-shrink-0 bg-dark-700 rounded-xl p-3 flex items-center justify-center w-28 h-28">
                    <ClothingMockup type={item.productType} color={item.colorHex} nftImage={item.nftImage} size="sm" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-bold text-base">{item.productName}</h3>
                        <p className="text-gray-400 text-sm">{item.color} · Size {item.size}</p>
                      </div>
                      <span className="text-gold-400 font-black text-xl flex-shrink-0">€{item.price}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.nftImage && (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-dark-500">
                            <Image src={item.nftImage} alt={item.nftName} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-white font-medium">{item.nftName}</p>
                          <p className="text-xs text-gray-500">{item.nftCollection}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate mr-2">{item.productName}</span>
                      <span className="text-white font-medium flex-shrink-0">€{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dark-500 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-gold-400 font-black text-2xl">€{total()}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">+ shipping (calculated at checkout)</p>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gold-500/20"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
