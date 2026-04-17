'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PRODUCTION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SHIPPED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    }
    setUpdating(null);
  }

  const displayed = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const revenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Admin <span className="gold-text">Dashboard</span></h1>
            <p className="text-gray-500 text-sm mt-1">Manage all orders and production</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-400' },
            { label: 'Revenue', value: `€${revenue.toFixed(0)}`, icon: TrendingUp, color: 'text-gold-400' },
            { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-dark-800 border border-dark-500 rounded-2xl p-5">
              <Icon size={20} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                filter === s
                  ? 'bg-gold-500 text-black border-gold-500'
                  : 'bg-dark-700 text-gray-400 border-dark-500 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No orders found.</div>
        ) : (
          <div className="space-y-3">
            {displayed.map((order) => (
              <div key={order.id} className="bg-dark-800 border border-dark-500 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* NFT thumbnail */}
                  {order.nftImage && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-dark-500 flex-shrink-0">
                      <Image src={order.nftImage} alt={order.nftName} fill className="object-cover" unoptimized />
                    </div>
                  )}

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-white font-bold">{order.productName} <span className="text-gray-400 font-normal text-sm">· {order.productColor} · {order.productSize}</span></p>
                        <p className="text-gray-400 text-sm">{order.customerName} — {order.customerEmail}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{order.nftName} · {order.nftCollection}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gold-400 font-black text-lg">€{order.total}</p>
                        <p className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status updater */}
                  <div className="flex-shrink-0">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg border bg-dark-700 cursor-pointer transition-colors focus:outline-none focus:border-gold-500/50 ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-dark-700 text-white">{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="mt-3 pt-3 border-t border-dark-500 text-xs text-gray-500">
                  📦 {order.street}, {order.city} {order.postalCode}, {order.country}
                  {order.notes && <span className="ml-3">· Note: {order.notes}</span>}
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
