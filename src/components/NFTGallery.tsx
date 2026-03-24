'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useChainId } from 'wagmi';
import { fetchNFTs, type NFT } from '@/lib/fetchNFTs';
import { CHAIN_OPTIONS } from '@/lib/products';

interface Props {
  selectedNFT: NFT | null;
  onSelect: (nft: NFT) => void;
}

export function NFTGallery({ selectedNFT, onSelect }: Props) {
  const { address } = useAccount();
  const connectedChainId = useChainId();
  const [selectedChainId, setSelectedChainId] = useState<number>(connectedChainId || 1);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    fetchNFTs(address, selectedChainId)
      .then((result) => {
        setNfts(result);
        if (result.length === 0) {
          const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
          if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
            setError('Alchemy API key not configured. Add NEXT_PUBLIC_ALCHEMY_API_KEY to .env.local');
          }
        }
      })
      .catch(() => setError('Failed to load NFTs. Please try again.'))
      .finally(() => setLoading(false));
  }, [address, selectedChainId]);

  const filtered = nfts.filter(
    (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.collection.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chain selector */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {CHAIN_OPTIONS.map((chain) => (
          <button
            key={chain.id}
            onClick={() => setSelectedChainId(chain.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedChainId === chain.id
                ? 'bg-gold-500 text-black'
                : 'bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500'
            }`}
          >
            <span>{chain.icon}</span>
            <span>{chain.name}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by name or collection..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
        />
      </div>

      {/* NFT Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg shimmer" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <span className="text-2xl mb-2">⚠️</span>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && nfts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <span className="text-2xl mb-2">🖼️</span>
            <p className="text-gray-400 text-sm">No NFTs found on this chain.</p>
            <p className="text-gray-500 text-xs mt-1">Try switching to another chain.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((nft) => {
              const isSelected =
                selectedNFT?.contract === nft.contract &&
                selectedNFT?.tokenId === nft.tokenId;
              return (
                <button
                  key={`${nft.contract}-${nft.tokenId}`}
                  onClick={() => onSelect(nft)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-gold-500 shadow-lg shadow-gold-500/30'
                      : 'border-transparent hover:border-gold-500/40'
                  }`}
                  title={`${nft.name} — ${nft.collection}`}
                >
                  {nft.image ? (
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-600 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No img</span>
                    </div>
                  )}

                  {/* Selection overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                      <div className="bg-gold-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    </div>
                  )}

                  {/* Hover tooltip */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-medium truncate">{nft.name}</p>
                    <p className="text-gray-400 text-[9px] truncate">{nft.collection}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected info */}
      {selectedNFT && (
        <div className="mt-3 pt-3 border-t border-dark-500">
          <p className="text-xs text-gray-400">
            Selected:{' '}
            <span className="text-white font-medium">{selectedNFT.name}</span>
            {' — '}
            <span className="text-gray-500">{selectedNFT.collection}</span>
          </p>
        </div>
      )}
    </div>
  );
}
