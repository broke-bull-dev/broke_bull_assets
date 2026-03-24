'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image
                src="/LOGO_COIN_METADATA.png"
                alt="Broke Bull"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">BROKE BULL</span>
              <span className="text-gold-500 font-bold text-lg tracking-tight"> STORE</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm text-gray-400 hover:text-white transition-colors">
              Products
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
              How it works
            </a>
          </nav>

          {/* Wallet connect */}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  );
}
