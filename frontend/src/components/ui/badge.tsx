type Status = 'pending' | 'won' | 'lost' | 'push';

interface BadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  pending: {
    bg: 'rgba(255, 167, 38, 0.12)',
    color: 'var(--warning)',
    label: 'Pending',
  },
  won: {
    bg: 'rgba(30, 215, 96, 0.12)',
    color: 'var(--success)',
    label: 'Won',
  },
  lost: {
    bg: 'rgba(241, 94, 94, 0.12)',
    color: 'var(--error)',
    label: 'Lost',
  },
  push: {
    bg: 'var(--surface-2)',
    color: 'var(--text-muted)',
    label: 'Push',
  },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${className}`}
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
