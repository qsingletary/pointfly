type Status = 'pending' | 'won' | 'lost' | 'push';

interface BadgeProps {
  status: Status;
  className?: string;
}

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
  push: 'Push',
};

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${status} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}
