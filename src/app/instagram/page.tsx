'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Unfollower {
  username: string;
  full_name: string;
  profile_pic_url: string;
}

interface Result {
  following_count: number;
  followers_count: number;
  unfollowers: Unfollower[];
}

export default function InstagramPage() {
  const [username, setUsername] = useState('');
  const [sessionid, setSessionid] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/unfollowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sessionid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark-900">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-dark-700 border border-gold-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-gold-500 rounded-full" />
            <span className="text-xs text-gold-400 font-medium tracking-wide uppercase">
              Instagram Tool
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="gold-text">Unfollowers</span> Checker
          </h1>
          <p className="text-gray-400">Descubrí quién no te sigue de vuelta.</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-dark-800 border border-dark-500 rounded-2xl p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Usuario de Instagram</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="lauti.dangelo"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Session ID</label>
              <input
                type="password"
                value={sessionid}
                onChange={(e) => setSessionid(e.target.value)}
                placeholder="Tu sessionid de Instagram"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-600 mt-1.5">
                Chrome: F12 → Application → Cookies → www.instagram.com → sessionid
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full btn-gold bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Analizando... (puede tardar 1-2 min)
              </span>
            ) : (
              'Buscar unfollowers'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-fade-in space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Seguidos', value: result.following_count },
                { label: 'Seguidores', value: result.followers_count },
                { label: 'No te siguen', value: result.unfollowers.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-dark-800 border border-dark-500 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-black text-gold-400">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* List */}
            {result.unfollowers.length > 0 ? (
              <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-dark-500 flex items-center justify-between">
                  <h2 className="text-white font-semibold text-sm">
                    No te siguen de vuelta
                  </h2>
                  <span className="bg-dark-600 text-gold-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    {result.unfollowers.length}
                  </span>
                </div>
                <ul className="divide-y divide-dark-700 max-h-[520px] overflow-y-auto">
                  {result.unfollowers.map((user, i) => (
                    <li
                      key={user.username}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-dark-700 transition-colors group"
                    >
                      <span className="text-xs text-gray-600 w-5 text-right shrink-0">
                        {i + 1}
                      </span>
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-dark-600 shrink-0">
                        {user.profile_pic_url ? (
                          <Image
                            src={user.profile_pic_url}
                            alt={user.username}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://www.instagram.com/${user.username}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white group-hover:text-gold-400 font-medium text-sm transition-colors block truncate"
                        >
                          @{user.username}
                        </a>
                        {user.full_name && (
                          <span className="text-xs text-gray-600 truncate block">
                            {user.full_name}
                          </span>
                        )}
                      </div>
                      <a
                        href={`https://www.instagram.com/${user.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gold-400 transition-colors text-xs shrink-0"
                        aria-label="Ver perfil"
                      >
                        →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-dark-800 border border-dark-500 rounded-2xl">
                Todo el mundo que seguís te sigue de vuelta.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
