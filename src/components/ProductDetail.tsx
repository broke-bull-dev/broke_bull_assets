'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import type { Product } from '@/lib/products';
import { ClothingMockup } from './ClothingPreview';
import { Customizer } from './Customizer';
import { Header } from './Header';
import { Footer } from './Footer';

export function ProductDetail({ product }: { product: Product }) {
  const { isConnected } = useAccount();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        <Link href="/#products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — Clothing preview */}
          <div className="bg-dark-800 rounded-2xl border border-dark-500 p-10 flex items-center justify-center min-h-[420px] sticky top-24">
            <ClothingMockup type={product.type} color={selectedColor.hex} nftImage={null} size="lg" />
          </div>

          {/* Right — Product info */}
          <div>
            {product.badge && (
              <span className="inline-block bg-gold-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
                {product.badge}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{product.name}</h1>
            <p className="text-gold-500 font-medium mb-4">{product.tagline}</p>
            <p className="text-4xl font-black text-white mb-6">€{product.price}</p>
            <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>

            {/* Color */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Color — <span className="text-gold-400 normal-case font-normal">{selectedColor.name}</span>
              </p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor.name === c.name
                        ? 'border-gold-500 scale-110 shadow-lg shadow-gold-500/30'
                        : 'border-dark-500 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedSize === s
                        ? 'bg-gold-500 text-black border-gold-500'
                        : 'bg-transparent text-gray-400 border-dark-500 hover:border-gray-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-dark-800 rounded-xl border border-dark-500 p-5 mb-8">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Details</p>
              <ul className="space-y-2">
                {product.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            {isConnected ? (
              <button
                onClick={() => setShowCustomizer(true)}
                className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-xl text-base transition-all shadow-lg shadow-gold-500/20"
              >
                Customize with My NFT
              </button>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="w-full border border-gold-500/40 hover:border-gold-500 text-gold-400 hover:text-gold-300 font-bold py-4 rounded-xl transition-all"
                  >
                    Connect Wallet to Customize
                  </button>
                )}
              </ConnectButton.Custom>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showCustomizer && (
        <Customizer product={product} onClose={() => setShowCustomizer(false)} />
      )}
    </main>
  );
}
