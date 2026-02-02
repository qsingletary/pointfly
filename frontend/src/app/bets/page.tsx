'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Nav } from '@/components/nav';
import { BetItem } from '@/components/bet-item';
import { getBets, getErrorMessage, setAuthToken } from '@/lib';
import type { Bet } from '@/lib/api';

type Filter = 'all' | 'pending' | 'won' | 'lost';

export default function BetsPage() {
  const { data: session, status } = useSession();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session?.accessToken]);
  useEffect(() => {
    if (status !== 'authenticated') return;

    async function load() {
      try {
        const userBets = await getBets();
        setBets(userBets);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="h-8 w-28 rounded-lg loading-shimmer" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl loading-shimmer" />
              ))}
            </div>
            <div className="h-12 rounded-xl loading-shimmer" />
            <div className="h-24 rounded-xl loading-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  const filtered = filter === 'all' ? bets : bets.filter((b) => b.status === filter);
  const stats = {
    total: bets.length,
    won: bets.filter((b) => b.status === 'won').length,
    lost: bets.filter((b) => b.status === 'lost').length,
    pending: bets.filter((b) => b.status === 'pending').length,
  };

  const winRate =
    stats.won + stats.lost > 0 ? Math.round((stats.won / (stats.won + stats.lost)) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">My Bets</h1>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{
                background: 'rgba(241, 94, 94, 0.1)',
                border: '1px solid rgba(241, 94, 94, 0.2)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--error)' }}>
                {error}
              </span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-8">
            <div className="stat-card stat-card-brand">
              <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                {stats.total}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Total
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {stats.won}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Won
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>
                {stats.lost}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Lost
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                {stats.pending}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Pending
              </p>
            </div>
          </div>

          {stats.won + stats.lost > 0 && (
            <div
              className="p-4 rounded-xl mb-8 flex items-center justify-between"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Win Rate
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: winRate >= 50 ? 'var(--success)' : 'var(--error)' }}
              >
                {winRate}%
              </span>
            </div>
          )}

          <div className="tab-bar mb-6" role="tablist" aria-label="Filter bets">
            {(['all', 'pending', 'won', 'lost'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                role="tab"
                aria-selected={filter === f}
                className={`tab-item capitalize ${filter === f ? 'active' : ''}`}
              >
                {f}
                {f !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({f === 'won' ? stats.won : f === 'lost' ? stats.lost : stats.pending})
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface-2)' }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {filter === 'all' ? 'No bets yet' : `No ${filter} bets`}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {filter === 'all' ? 'Place your first bet to get started' : 'Check other filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((bet, index) => (
                <BetItem key={bet._id} bet={bet} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
