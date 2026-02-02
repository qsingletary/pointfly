'use client';

import { useState } from 'react';
import Link from 'next/link';
import { settleGame, getErrorMessage } from '@/lib';
import type { SettleGameResponse } from '@/lib/api';

export default function AdminPage() {
  const [gameId, setGameId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SettleGameResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gameId || homeScore === '' || awayScore === '' || !apiKey) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await settleGame(
        gameId,
        parseInt(homeScore, 10),
        parseInt(awayScore, 10),
        apiKey
      );
      setResult(response);
      setGameId('');
      setHomeScore('');
      setAwayScore('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Home
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--brand)' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Panel</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Manage games and settlements
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-xl mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(191, 255, 0, 0.1)' }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--brand)' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold">Settle Game</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="api-key">Admin API Key</label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your admin API key"
              />
            </div>

            <div>
              <label htmlFor="game-id">Game ID</label>
              <input
                id="game-id"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="MongoDB ObjectId"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="home-score">Home Score</label>
                <input
                  id="home-score"
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="away-score">Away Score</label>
                <input
                  id="away-score"
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {error && (
              <div
                className="p-4 rounded-xl flex items-center gap-3"
                style={{
                  background: 'rgba(241, 94, 94, 0.1)',
                  border: '1px solid rgba(241, 94, 94, 0.2)',
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: 'var(--error)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span className="text-sm" style={{ color: 'var(--error)' }}>
                  {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3.5 text-base"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Settling...
                </>
              ) : (
                'Settle Game'
              )}
            </button>
          </form>
        </div>

        {result && (
          <div
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.08) 0%, transparent 100%)',
              border: '1px solid rgba(30, 215, 96, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(30, 215, 96, 0.15)' }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--success)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--success)' }}>
                Game Settled Successfully
              </h3>
            </div>

            <div className="space-y-4">
              <div
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ background: 'var(--surface)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Matchup
                </span>
                <span className="text-sm font-medium">
                  {result.game.homeTeam} vs {result.game.awayTeam}
                </span>
              </div>

              <div
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ background: 'var(--surface)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Final Score
                </span>
                <span className="text-sm font-medium">
                  {result.game.finalHomeScore} - {result.game.finalAwayScore}
                </span>
              </div>

              <div
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ background: 'var(--surface)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Bets Settled
                </span>
                <span className="text-sm font-medium">{result.settledBets}</span>
              </div>

              <div
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ background: 'var(--surface)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Points Awarded
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                  +{result.pointsAwarded}
                </span>
              </div>
            </div>

            <button onClick={() => setResult(null)} className="w-full mt-6 btn btn-secondary py-3">
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
