'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { Product } from '@/lib/products';
import { ClothingMockup } from './ClothingPreview';

interface Props {
  product: Product;
  onCustomize: () => void;
}

export function ProductCard({ product, onCustomize }: Props) {
  const { isConnected } = useAccount();

  return (
    <div className="card-hover bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
      {/* Garment preview */}
      <div className="relative bg-dark-700 p-8 flex items-center justify-center min-h-[280px]">
        {product.badge && (
          <div className="absolute top-4 left-4 bg-gold-500 text-black text-xs font-bold px-3 py-1 rounded-full">
            {product.badge}
          </div>
        )}
        <ClothingMockup type={product.type} color="#1a1a1a" nftImage={null} size="md" />
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-xl">{product.name}</h3>
          <div className="text-right flex-shrink-0 ml-4">
            <span className="text-gold-400 font-black text-2xl">€{product.price}</span>
          </div>
        </div>

        <p className="text-gold-500 text-sm font-medium mb-3">{product.tagline}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{product.description}</p>

        {/* Details */}
        <ul className="space-y-1 mb-6">
          {product.details.slice(0, 3).map((d) => (
            <li key={d} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gold-500">✓</span>
              {d}
            </li>
          ))}
        </ul>

        {/* Colors preview */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-500">Colors:</span>
          {product.colors.map((c) => (
            <div
              key={c.name}
              title={c.name}
              className="w-5 h-5 rounded-full border-2 border-dark-500"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* CTA */}
        {isConnected ? (
          <button
            onClick={onCustomize}
            className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/20"
          >
            Customize with Your NFT
          </button>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full border border-gold-500/40 hover:border-gold-500 text-gold-400 hover:text-gold-300 font-bold py-3.5 rounded-xl transition-all duration-300"
              >
                Connect Wallet to Customize
              </button>
            )}
          </ConnectButton.Custom>
        )}
      </div>
    </div>
  );
}
