'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { ProductCard } from './ProductCard';
import { Customizer } from './Customizer';
import type { Product } from '@/lib/products';

export function ProductsSection() {
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);

  return (
    <section id="products" className="py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Choose Your <span className="gold-text">Canvas</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Premium garments waiting for your NFT. Each piece embroidered with up to 15,000 stitches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCustomize={() => setCustomizerProduct(product)}
            />
          ))}
        </div>
      </div>

      {customizerProduct && (
        <Customizer
          product={customizerProduct}
          onClose={() => setCustomizerProduct(null)}
        />
      )}
    </section>
  );
}
