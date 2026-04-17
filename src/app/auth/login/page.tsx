'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push(searchParams.get('callbackUrl') || '/');
    }
  }

  const inputClass = 'w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors';

  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative w-10 h-10">
              <Image src="/LOGO_COIN_METADATA.png" alt="On Chain Drip" fill className="object-contain rounded-full" />
            </div>
            <span className="text-white font-bold text-xl">ON CHAIN <span className="text-gold-500">DRIP</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to track your orders</p>
        </div>

        <div className="bg-dark-800 border border-dark-500 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Email</label>
              <input required type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Password</label>
              <input required type="password" placeholder="••••••••" value={form.password} onChange={set('password')} className={inputClass} />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <><Loader size={16} className="animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-gold-400 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
