import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchCurrentUser } from '@/lib/api/user';
import { getSportDisplayName } from '@/constants';
import { SignOutButton } from './sign-out-button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const userData = session.accessToken ? await fetchCurrentUser(session.accessToken) : null;
  const user = userData ?? session.user;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="text-2xl font-bold">{user.points ?? 0}</p>
            </div>
            <SignOutButton />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Favorite Sport:</span>{' '}
              {getSportDisplayName(user.favoriteSport)}
            </p>
            <p>
              <span className="text-muted-foreground">Favorite Team:</span>{' '}
              {user.favoriteTeam || 'Not set'}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Next Game</h2>
          <p className="text-muted-foreground">Coming in Phase 9: Frontend UI</p>
        </div>
      </div>
    </main>
  );
}
