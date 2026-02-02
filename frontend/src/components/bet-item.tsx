import { Badge } from '@/components/ui';
import type { Bet, Game } from '@/lib/api';

interface BetItemProps {
  bet: Bet;
}

export function BetItem({ bet }: BetItemProps) {
  const game = typeof bet.gameId === 'object' ? (bet.gameId as Game) : null;

  return (
    <div
      className="p-4 rounded-xl transition-all"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {game ? (
            <p className="font-semibold text-sm truncate">
              {game.awayTeam} @ {game.homeTeam}
            </p>
          ) : (
            <p className="font-semibold text-sm truncate">{bet.favoriteTeamAtBet}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background:
                  bet.selection === 'favorite' ? 'rgba(191, 255, 0, 0.1)' : 'var(--surface-2)',
                color: bet.selection === 'favorite' ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              {bet.selection === 'favorite' ? 'Your team' : 'Opponent'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {bet.spreadAtBet > 0 ? '+' : ''}
              {bet.spreadAtBet}
            </span>
          </div>
        </div>
        <Badge status={bet.status} />
      </div>

      {game?.status === 'finished' && (
        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Final Score
          </span>
          <span className="text-sm font-medium">
            {game.finalAwayScore} - {game.finalHomeScore}
          </span>
        </div>
      )}

      {bet.status === 'won' && (
        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Points Earned
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
            +100
          </span>
        </div>
      )}
    </div>
  );
}
