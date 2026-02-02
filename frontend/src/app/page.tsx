'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { GameCard } from '@/components/game-card';
import { BetItem } from '@/components/bet-item';
import {
  getNextGame,
  fetchGamesFromApi,
  placeBet,
  getBets,
  getErrorMessage,
  setAuthToken,
} from '@/lib';
import type { Game, Bet } from '@/lib/api';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [existingBet, setExistingBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasCheckedDb, setHasCheckedDb] = useState(false);
  const [totalBets, setTotalBets] = useState(0);

  const user = session?.user;
  const favoriteTeam = user?.favoriteTeam;

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }
    if (!favoriteTeam) {
      setLoading(false);
      setHasCheckedDb(false);
      return;
    }

    async function load() {
      setLoading(true);
      setHasCheckedDb(false);
      try {
        const [nextGame, userBets] = await Promise.all([getNextGame(), getBets()]);
        setTotalBets(userBets.length);
        setBets(userBets.slice(0, 5));

        // If no game in database, automatically fetch from the API
        let gameToShow = nextGame;
        if (!nextGame) {
          try {
            const result = await fetchGamesFromApi();
            gameToShow = result.game;
          } catch (fetchErr) {
            console.error('Auto-fetch error:', fetchErr);
          }
        }

        setGame(gameToShow);
        if (gameToShow) {
          const betOnGame = userBets.find((bet) => {
            const betGameId = typeof bet.gameId === 'string' ? bet.gameId : bet.gameId._id;
            return betGameId === gameToShow!._id;
          });
          setExistingBet(betOnGame || null);
        } else {
          setExistingBet(null);
        }
        setHasCheckedDb(true);
      } catch (err) {
        console.error('Load error:', err);
        setHasCheckedDb(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status, favoriteTeam]);

  async function handleFetchGames() {
    setFetching(true);
    setError('');
    try {
      const [result, userBets] = await Promise.all([fetchGamesFromApi(), getBets()]);
      setGame(result.game);
      if (result.game) {
        const betOnGame = userBets.find((bet) => {
          const betGameId = typeof bet.gameId === 'string' ? bet.gameId : bet.gameId._id;
          return betGameId === result.game!._id;
        });
        setExistingBet(betOnGame || null);
      } else {
        setExistingBet(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFetching(false);
    }
  }

  async function handleBet(selection: 'favorite' | 'opponent') {
    if (!game || !favoriteTeam) return;
    setError('');
    setSuccess('');
    const isHome = game.homeTeam === favoriteTeam;
    const opponent = isHome ? game.awayTeam : game.homeTeam;
    try {
      const newBet = await placeBet(game._id, selection);
      setSuccess(`Bet placed on ${selection === 'favorite' ? favoriteTeam : opponent}!`);
      setExistingBet(newBet);
      const userBets = await getBets();
      setTotalBets(userBets.length);
      setBets(userBets.slice(0, 5));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (status === 'unauthenticated') {
    return <LandingView />;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6 safe-top lg:pt-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="h-8 w-32 rounded-lg loading-shimmer" />
            <div className="h-48 rounded-xl loading-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  if (!favoriteTeam) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6 safe-top lg:pt-6">
          <div className="max-w-md mx-auto text-center py-20">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--brand)' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Choose your team</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Select your favorite NBA team to start making predictions
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="btn btn-primary px-8 py-3 text-base"
            >
              Select Team
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6 safe-top lg:pt-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              Welcome back,
            </p>
            <h1 className="text-2xl font-semibold">{user?.name?.split(' ')[0]}</h1>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="stat-card stat-card-brand">
              <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                {user?.points?.toLocaleString() || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Points
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {bets.filter((b) => b.status === 'won').length}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Wins
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-bold">
                {bets.filter((b) => b.status === 'pending').length}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Pending
              </p>
            </div>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl flex justify-between items-center alert-enter"
              style={{
                background: 'rgba(241, 94, 94, 0.1)',
                border: '1px solid rgba(241, 94, 94, 0.2)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--error)' }}>
                {error}
              </span>
              <button
                onClick={() => setError('')}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 active:scale-95"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {success && (
            <div
              className="mb-6 p-4 rounded-xl flex justify-between items-center alert-enter success-pulse"
              style={{
                background: 'rgba(30, 215, 96, 0.1)',
                border: '1px solid rgba(30, 215, 96, 0.2)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--success)' }}>
                {success}
              </span>
              <button
                onClick={() => setSuccess('')}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 active:scale-95"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Next Game</h2>
              <button
                onClick={handleFetchGames}
                disabled={fetching}
                className="btn btn-ghost px-3 py-1.5 text-xs"
              >
                {fetching ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                ) : (
                  'Refresh'
                )}
              </button>
            </div>

            {game ? (
              <GameCard
                game={game}
                favoriteTeam={favoriteTeam}
                existingBet={existingBet}
                onPlaceBet={handleBet}
              />
            ) : (
              <div
                className="p-8 text-center rounded-xl"
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
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {hasCheckedDb ? 'No upcoming games' : 'Checking schedule...'}
                </p>
                {hasCheckedDb && (
                  <>
                    <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                      {favoriteTeam} doesn&apos;t have any scheduled games
                    </p>
                    <button
                      onClick={handleFetchGames}
                      disabled={fetching}
                      className="btn btn-primary px-6 py-2.5"
                    >
                      {fetching ? 'Checking...' : 'Check for Games'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Recent Bets</h2>
              <Link
                href="/bets"
                className="text-xs font-medium transition-colors hover:text-white"
                style={{ color: 'var(--text-muted)' }}
              >
                View all{totalBets > 5 ? ` (${totalBets})` : ''}
              </Link>
            </div>

            {bets.length > 0 ? (
              <div className="space-y-2">
                {bets.map((bet, index) => (
                  <BetItem key={bet._id} bet={bet} index={index} />
                ))}
              </div>
            ) : (
              <div
                className="p-8 text-center rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No bets yet
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LandingView() {
  return (
    <main className="min-h-screen flex flex-col safe-top" style={{ background: 'var(--bg)' }}>
      <nav className="px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"
                fill="#000"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">PointFly</span>
        </Link>
        <Link
          href="/auth/signin"
          className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-[var(--surface)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Sign in
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--brand)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Free to play
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Predict games.
            <br />
            <span className="text-gradient">Earn points.</span>
          </h1>

          <p
            className="text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Pick your favorite NBA team, bet on the spread, and compete with friends. No real money
            involved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="btn btn-primary px-8 py-4 text-base w-full sm:w-auto"
            >
              Get started
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/auth/signin"
              className="btn btn-outline px-8 py-4 text-base w-full sm:w-auto"
            >
              Learn more
            </Link>
          </div>

          <p className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            Sign in with Google to continue
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-12 py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              }
              title="Pick your team"
              description="Choose your favorite NBA team to follow and support."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              }
              title="Bet the spread"
              description="Make predictions using real Vegas odds and spreads."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                  />
                </svg>
              }
              title="Earn points"
              description="Win bets to climb the leaderboard and compete with friends."
            />
          </div>
        </div>
      </div>

      <footer
        className="px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          No real money involved. Play responsibly.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Built with Next.js
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div
        className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--surface)', color: 'var(--brand)' }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
