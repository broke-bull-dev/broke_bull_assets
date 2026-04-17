'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/store/cart';

export function Header() {
  const { data: session } = useSession();
  const count = useCart((s) => s.count());

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image src="/LOGO_COIN_METADATA.png" alt="On Chain Drip" fill className="object-contain rounded-full" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">ON CHAIN</span>
              <span className="text-gold-500 font-bold text-lg tracking-tight"> DRIP</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#products" className="text-sm text-gray-400 hover:text-white transition-colors">Products</Link>
            <Link href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it works</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="flex items-center gap-2">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="p-2 text-gray-400 hover:text-gold-400 transition-colors" title="Admin">
                    <LayoutDashboard size={18} />
                  </Link>
                )}
                <Link href="/account/orders" className="p-2 text-gray-400 hover:text-white transition-colors" title="My Orders">
                  <User size={18} />
                </Link>
                <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-white transition-colors" title="Sign out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link href="/auth/register" className="text-sm bg-dark-600 hover:bg-dark-500 text-white px-3 py-1.5 rounded-lg transition-colors border border-dark-500">
                  Register
                </Link>
              </div>
            )}

            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </div>
      </div>
    </header>
  );
}
