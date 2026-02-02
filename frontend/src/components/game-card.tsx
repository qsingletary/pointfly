'use client';

import { useState } from 'react';
import type { Game, Bet } from '@/lib/api';

interface GameCardProps {
  game: Game;
  favoriteTeam: string;
  existingBet: Bet | null;
  onPlaceBet: (selection: 'favorite' | 'opponent') => Promise<void>;
}

export function GameCard({ game, favoriteTeam, existingBet, onPlaceBet }: GameCardProps) {
  const [confirmBet, setConfirmBet] = useState<'favorite' | 'opponent' | null>(null);
  const [betting, setBetting] = useState(false);

  const isHome = game.homeTeam === favoriteTeam;
  const opponent = isHome ? game.awayTeam : game.homeTeam;
  const gameStarted = new Date(game.startTime) <= new Date();

  async function handleBet(selection: 'favorite' | 'opponent') {
    setConfirmBet(null);
    setBetting(true);
    try {
      await onPlaceBet(selection);
    } finally {
      setBetting(false);
    }
  }

  return (
    <div
      className="p-5 rounded-xl list-item-enter"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-center mb-5">
        <span
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
        >
          {formatTime(game.startTime)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <TeamDisplay
          team={game.awayTeam}
          label="Away"
          isFavorite={game.awayTeam === favoriteTeam}
        />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--surface-2)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            VS
          </span>
        </div>
        <TeamDisplay
          team={game.homeTeam}
          label="Home"
          isFavorite={game.homeTeam === favoriteTeam}
        />
      </div>

      <div className="text-center p-3 rounded-lg mb-5" style={{ background: 'var(--surface-2)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Spread:{' '}
        </span>
        <span className="text-sm font-semibold">
          {game.spreadTeam} {game.spread > 0 ? '+' : ''}
          {game.spread}
        </span>
      </div>

      {game.status === 'upcoming' &&
        !gameStarted &&
        (existingBet ? (
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 255, 0, 0.08) 0%, transparent 100%)',
              border: '1px solid rgba(191, 255, 0, 0.15)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--brand)' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--brand)' }}
              >
                Bet Placed
              </span>
            </div>
            <p className="font-semibold">
              {existingBet.selection === 'favorite' ? favoriteTeam : opponent}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Spread: {existingBet.spreadAtBet > 0 ? '+' : ''}
              {existingBet.spreadAtBet}
            </p>
          </div>
        ) : confirmBet ? (
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <p className="text-center text-sm mb-4">
              Confirm bet on{' '}
              <span className="font-semibold">
                {confirmBet === 'favorite' ? favoriteTeam : opponent}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBet(null)}
                disabled={betting}
                className="flex-1 btn btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBet(confirmBet)}
                disabled={betting}
                className="flex-1 btn btn-primary py-3"
              >
                {betting ? (
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
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setConfirmBet('favorite')}
              disabled={betting}
              className="btn btn-primary py-3.5"
            >
              {favoriteTeam}
            </button>
            <button
              onClick={() => setConfirmBet('opponent')}
              disabled={betting}
              className="btn btn-secondary py-3.5"
            >
              {opponent}
            </button>
          </div>
        ))}

      {game.status === 'upcoming' && gameStarted && !existingBet && (
        <div
          className="p-4 rounded-xl text-center flex items-center justify-center gap-2"
          style={{ background: 'var(--surface-2)' }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'var(--error)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Game in progress
          </span>
        </div>
      )}

      {game.status === 'finished' && (
        <div className="text-center py-3">
          <p className="text-2xl font-bold mb-1">
            {game.finalAwayScore} - {game.finalHomeScore}
          </p>
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Final
          </span>
        </div>
      )}
    </div>
  );
}

function TeamDisplay({
  team,
  label,
  isFavorite,
}: {
  team: string;
  label: string;
  isFavorite: boolean;
}) {
  return (
    <div className="text-center flex-1">
      <div
        className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-lg font-bold"
        style={{
          background: isFavorite ? 'rgba(191, 255, 0, 0.1)' : 'var(--surface-2)',
          color: isFavorite ? 'var(--brand)' : 'var(--text-secondary)',
          border: isFavorite ? '1px solid rgba(191, 255, 0, 0.2)' : '1px solid transparent',
        }}
      >
        {team.substring(0, 2).toUpperCase()}
      </div>
      <p className="font-semibold text-sm">{team}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return (
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    `, ${time}`
  );
}
