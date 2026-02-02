'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { settleGame, getAllGames, getAllBets, getAllUsers, getErrorMessage } from '@/lib';
import type { Game, Bet, SettleGameResponse, AdminUser } from '@/lib/api';

type BetWithUser = Bet & { userId?: { name?: string; email?: string } };

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Settle game state
  const [gameId, setGameId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SettleGameResponse | null>(null);

  // Data state
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<BetWithUser[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'bets' | 'users'>('games');

  async function loadData() {
    if (!apiKey) return;
    setDataLoading(true);
    try {
      const [gamesData, betsData, usersData] = await Promise.all([
        getAllGames(apiKey),
        getAllBets(apiKey),
        getAllUsers(apiKey),
      ]);
      setGames(gamesData);
      setBets(betsData);
      setUsers(usersData);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
      setIsAuthenticated(false);
    } finally {
      setDataLoading(false);
    }
  }

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
      // Refresh data after settling
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  const upcomingGames = games.filter(g => g.status === 'upcoming');
  const finishedGames = games.filter(g => g.status === 'finished');
  const pendingBets = bets.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
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

        {/* API Key Input */}
        {!isAuthenticated && (
          <div
            className="p-6 rounded-xl mb-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <label htmlFor="api-key-auth">Admin API Key</label>
            <div className="flex gap-3 mt-2">
              <input
                id="api-key-auth"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your admin API key"
                className="flex-1"
              />
              <button
                onClick={loadData}
                disabled={!apiKey || dataLoading}
                className="btn btn-primary px-6"
              >
                {dataLoading ? 'Loading...' : 'Connect'}
              </button>
            </div>
            {error && (
              <p className="text-sm mt-3" style={{ color: 'var(--error)' }}>{error}</p>
            )}
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              <div className="stat-card">
                <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                  {users.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Users
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold" style={{ color: 'var(--info)' }}>
                  {games.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Games
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                  {upcomingGames.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Upcoming
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold" style={{ color: 'var(--info)' }}>
                  {bets.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Total Bets
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                  {pendingBets.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Pending
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-bar mb-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`tab-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`tab-item ${activeTab === 'games' ? 'active' : ''}`}
              >
                Games ({games.length})
              </button>
              <button
                onClick={() => setActiveTab('bets')}
                className={`tab-item ${activeTab === 'bets' ? 'active' : ''}`}
              >
                Bets ({bets.length})
              </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-3 mb-8">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <div
                      key={user._id}
                      className="p-4 rounded-xl"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                          #{index + 1}
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: 'var(--brand)' }}>
                            {user.points.toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>points</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 flex items-center gap-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <span>
                          Team: <strong className="text-white">{user.favoriteTeam || 'Not set'}</strong>
                        </span>
                        <span>
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
                  </div>
                )}
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-3 mb-8">
                {upcomingGames.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                      Upcoming Games
                    </h3>
                    {upcomingGames.map((game) => (
                      <div
                        key={game._id}
                        className="p-4 rounded-xl"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">{game.awayTeam} @ {game.homeTeam}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              {new Date(game.startTime).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: 'rgba(255, 167, 38, 0.15)', color: 'var(--warning)' }}
                          >
                            Upcoming
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ID:</span>
                            <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--surface-2)' }}>
                              {game._id}
                            </code>
                          </div>
                          <button
                            onClick={() => {
                              copyToClipboard(game._id);
                              setGameId(game._id);
                            }}
                            className="btn btn-ghost text-xs px-3 py-1.5"
                          >
                            Use for Settlement
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {finishedGames.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium uppercase tracking-wider mb-3 mt-6" style={{ color: 'var(--text-muted)' }}>
                      Finished Games
                    </h3>
                    {finishedGames.slice(0, 5).map((game) => (
                      <div
                        key={game._id}
                        className="p-4 rounded-xl"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{game.awayTeam} @ {game.homeTeam}</p>
                            <p className="text-sm mt-1">
                              {game.finalAwayScore} - {game.finalHomeScore}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                          >
                            Finished
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {games.length === 0 && (
                  <div className="p-8 text-center rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No games found</p>
                  </div>
                )}
              </div>
            )}

            {/* Bets Tab */}
            {activeTab === 'bets' && (
              <div className="space-y-3 mb-8">
                {bets.length > 0 ? (
                  bets.map((bet) => {
                    const game = typeof bet.gameId === 'object' ? bet.gameId as Game : null;
                    return (
                      <div
                        key={bet._id}
                        className="p-4 rounded-xl"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {game ? `${game.awayTeam} @ ${game.homeTeam}` : bet.favoriteTeamAtBet}
                            </p>
                            {bet.userId?.name && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {bet.userId.name} ({bet.userId.email})
                              </p>
                            )}
                          </div>
                          <span
                            className={`badge badge-${bet.status}`}
                          >
                            {bet.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>
                            Picked:{' '}
                            <strong style={{ color: 'var(--brand)' }}>
                              {bet.selection === 'favorite'
                                ? bet.favoriteTeamAtBet
                                : game
                                  ? (game.homeTeam === bet.favoriteTeamAtBet ? game.awayTeam : game.homeTeam)
                                  : 'Opponent'}
                            </strong>
                          </span>
                          <span>
                            Spread: <strong className="text-white">{bet.spreadAtBet > 0 ? '+' : ''}{bet.spreadAtBet}</strong>
                          </span>
                          <span>
                            {new Date(bet.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {game && (
                          <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Game ID:</span>
                            <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--surface-2)' }}>
                              {game._id}
                            </code>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No bets found</p>
                  </div>
                )}
              </div>
            )}

            {/* Settle Game Form */}
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
                  <label htmlFor="game-id">Game ID</label>
                  <input
                    id="game-id"
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    placeholder="Select a game above or paste ID"
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

                {error && !dataLoading && (
                  <div
                    className="p-4 rounded-xl flex items-center gap-3"
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
          </>
        )}
      </div>
    </div>
  );
}
