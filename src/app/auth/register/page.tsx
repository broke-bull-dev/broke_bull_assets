'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return; }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/');
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
          <h1 className="text-2xl font-black text-white">Create an account</h1>
          <p className="text-gray-400 text-sm mt-1">Track your NFT orders in one place</p>
        </div>

        <div className="bg-dark-800 border border-dark-500 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', field: 'name' as const, type: 'text', placeholder: 'Satoshi Nakamoto' },
              { label: 'Email', field: 'email' as const, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', field: 'password' as const, type: 'password', placeholder: '8+ characters' },
              { label: 'Confirm Password', field: 'confirm' as const, type: 'password', placeholder: 'Repeat password' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">{label}</label>
                <input required type={type} placeholder={placeholder} value={form[field]} onChange={set(field)} className={inputClass} />
              </div>
            ))}

            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <><Loader size={16} className="animate-spin" />Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
