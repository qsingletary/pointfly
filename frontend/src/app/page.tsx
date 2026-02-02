import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PointFly</h1>
        <p className="text-muted-foreground mb-8">Play-to-earn sports betting with points</p>
        <Link href="/auth/signin">
          <Button>Sign in to get started</Button>
        </Link>
      </div>
    </main>
  );
}
