import { Button } from '@/components/ui';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PointFly</h1>
        <p className="text-muted-foreground mb-8">Play-to-earn sports betting with points</p>
        <Button>Sign in to get started</Button>
      </div>
    </main>
  );
}
