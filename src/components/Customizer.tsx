'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
import type { NFT } from '@/lib/fetchNFTs';
import { useCart } from '@/store/cart';
import { ClothingMockup } from './ClothingPreview';
import { NFTGallery } from './NFTGallery';

interface Props {
  product: Product;
  onClose: () => void;
}

export function Customizer({ product, onClose }: Props) {
  const { address } = useAccount();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const canAdd = selectedNFT !== null && selectedSize !== '';

  function handleAddToCart() {
    if (!selectedNFT || !selectedSize) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      price: product.price,
      currency: product.currency,
      nftName: selectedNFT.name,
      nftCollection: selectedNFT.collection,
      nftContract: selectedNFT.contract,
      nftTokenId: selectedNFT.tokenId,
      nftImage: selectedNFT.image,
      nftChainId: selectedNFT.chainId,
      walletAddress: address || '',
    });

    setAdded(true);
    setTimeout(() => {
      onClose();
      router.push('/cart');
    }, 1200);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-5xl bg-dark-800 border border-dark-500 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-dark-500 flex-shrink-0">
            <div>
              <h2 className="text-white font-bold text-xl">{product.name}</h2>
              <p className="text-gold-500 text-sm mt-0.5">Customize with your NFT</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

            {/* Left: Preview */}
            <div className="lg:w-[45%] flex flex-col items-center p-6 border-b lg:border-b-0 lg:border-r border-dark-500 bg-dark-700/30 flex-shrink-0">
              <div className="w-full max-w-xs flex items-center justify-center mb-6">
                <ClothingMockup type={product.type} color={selectedColor.hex} nftImage={selectedNFT?.image ?? null} size="lg" />
              </div>

              {selectedNFT ? (
                <div className="w-full p-3 bg-dark-700 rounded-xl border border-gold-500/20 mb-4">
                  <p className="text-xs text-gray-500 mb-0.5">Embroidering:</p>
                  <p className="text-white text-sm font-semibold">{selectedNFT.name}</p>
                  <p className="text-gray-400 text-xs">{selectedNFT.collection}</p>
                </div>
              ) : (
                <div className="w-full p-3 bg-dark-700 rounded-xl border border-dashed border-dark-500 text-center mb-4">
                  <p className="text-gray-500 text-sm">Select an NFT from your collection →</p>
                </div>
              )}

              {/* Color */}
              <div className="w-full mb-4">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Color — <span className="text-gold-400 normal-case font-normal">{selectedColor.name}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor.name === c.name ? 'border-gold-500 scale-110 shadow-lg shadow-gold-500/30' : 'border-dark-500 hover:border-gray-400'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="w-full mb-6">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedSize === s ? 'bg-gold-500 text-black border-gold-500' : 'bg-transparent text-gray-400 border-dark-500 hover:border-gray-400 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to cart */}
              <div className="w-full border-t border-dark-500 pt-4">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-gold-400 font-black text-2xl">€{product.price}</span>
                </div>
                <button
                  disabled={!canAdd || added}
                  onClick={handleAddToCart}
                  className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-green-500 text-white cursor-default'
                      : canAdd
                      ? 'btn-gold bg-gold-500 hover:bg-gold-600 text-black shadow-lg shadow-gold-500/20'
                      : 'bg-dark-600 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {added ? (
                    <><Check size={16} /> Added! Redirecting to cart…</>
                  ) : !selectedNFT ? (
                    'Select an NFT first'
                  ) : !selectedSize ? (
                    'Select a size'
                  ) : (
                    <><ShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
              </div>
            </div>

            {/* Right: NFT Gallery */}
            <div className="lg:w-[55%] flex flex-col p-5 overflow-hidden min-h-0">
              <div className="mb-4 flex-shrink-0">
                <h3 className="text-white font-semibold text-base mb-0.5">Your NFT Collection</h3>
                <p className="text-gray-500 text-xs">Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <div className="flex-1 min-h-0">
                <NFTGallery selectedNFT={selectedNFT} onSelect={setSelectedNFT} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
