'use client';

import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function Hero() {
  const { isConnected } = useAccount();

  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gold-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-dark-700 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-xs text-gold-400 font-medium tracking-wide uppercase">
                Web3 Native Clothing
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-white">Wear Your</span>
              <br />
              <span className="gold-text">NFT.</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Connect your wallet, pick any NFT you own, and we'll precision-embroider it on
              premium hoodies and t-shirts. Each piece is hand-crafted and uniquely yours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 shadow-lg shadow-gold-500/25"
                    >
                      Connect Wallet to Start
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <a
                  href="#products"
                  className="btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 shadow-lg shadow-gold-500/25"
                >
                  Browse Products
                </a>
              )}
              <a
                href="#how-it-works"
                className="border border-dark-500 hover:border-gold-500/40 text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-300"
              >
                How it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              {[
                { label: 'Hand-crafted', icon: '🧵' },
                { label: 'Any NFT chain', icon: '⛓️' },
                { label: 'Ships worldwide', icon: '✈️' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo / Visual */}
          <div className="flex-shrink-0 relative animate-fade-in">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/5 blur-2xl" />
              <div className="absolute inset-4 rounded-full border border-gold-500/20" />
              <div className="absolute inset-0 rounded-full border border-gold-500/10" />

              <Image
                src="/LOGO_COIN_METADATA.png"
                alt="Broke Bull"
                fill
                className="object-contain p-8 drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
