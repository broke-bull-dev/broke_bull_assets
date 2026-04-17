'use client';

import Link from 'next/link';
import type { Product } from '@/lib/products';
import { ClothingMockup } from './ClothingPreview';

interface Props {
  product: Product;
  onCustomize: () => void;
}

export function ProductCard({ product, onCustomize }: Props) {
  return (
    <div className="card-hover bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
      {/* Garment preview */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative bg-dark-700 p-8 flex items-center justify-center min-h-[280px] hover:bg-dark-600 transition-colors">
          {product.badge && (
            <div className="absolute top-4 left-4 bg-gold-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              {product.badge}
            </div>
          )}
          <div className="absolute top-4 right-4 text-xs text-gray-500 bg-dark-800/80 px-2 py-1 rounded-lg">
            Click to view
          </div>
          <ClothingMockup type={product.type} color="#1a1a1a" nftImage={null} size="md" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/products/${product.id}`} className="hover:text-gold-400 transition-colors">
            <h3 className="text-white font-bold text-xl">{product.name}</h3>
          </Link>
          <span className="text-gold-400 font-black text-2xl ml-4 flex-shrink-0">€{product.price}</span>
        </div>

        <p className="text-gold-500 text-sm font-medium mb-3">{product.tagline}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{product.description}</p>

        <ul className="space-y-1 mb-6">
          {product.details.slice(0, 3).map((d) => (
            <li key={d} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gold-500">✓</span>{d}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-500">Colors:</span>
          {product.colors.map((c) => (
            <div key={c.name} title={c.name} className="w-5 h-5 rounded-full border-2 border-dark-500" style={{ backgroundColor: c.hex }} />
          ))}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center border border-dark-500 hover:border-gold-500/40 text-gray-300 hover:text-white font-medium py-3 rounded-xl transition-all text-sm"
          >
            View Details
          </Link>
          <button
            onClick={onCustomize}
            className="flex-1 btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 text-sm"
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
}
