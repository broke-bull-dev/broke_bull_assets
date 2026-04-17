'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PRODUCTION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SHIPPED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AccountOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/account/orders')
        .then((r) => r.json())
        .then(setOrders)
        .finally(() => setLoading(false));
    }
  }, [status]);

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Home
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm mb-8">Welcome, {session?.user?.name}</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No orders yet.</p>
            <Link href="/#products" className="text-gold-400 hover:underline text-sm mt-2 inline-block">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-dark-800 border border-dark-500 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-white font-bold">{order.productName}</p>
                    <p className="text-gray-500 text-sm">{order.productColor} · Size {order.productSize}</p>
                    <p className="text-gray-600 text-xs mt-1 font-mono">{order.id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gold-400 font-black text-xl">€{order.total}</p>
                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || STATUS_COLORS.PENDING}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-dark-500">
                  {order.nftImage && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-dark-500 flex-shrink-0">
                      <Image src={order.nftImage} alt={order.nftName} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{order.nftName}</p>
                    <p className="text-gray-500 text-xs">{order.nftCollection}</p>
                  </div>
                  <p className="ml-auto text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
