'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
    iconFilled: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
      </svg>
    ),
  },
  {
    href: '/bets',
    label: 'My Bets',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
        />
      </svg>
    ),
    iconFilled: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.625 1.5H18.375a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75zm-1.125 8.25h15a.75.75 0 010 1.5h-15a.75.75 0 010-1.5zm0 3.75h15a.75.75 0 010 1.5h-15a.75.75 0 010-1.5zm0 3.75h15a.75.75 0 010 1.5h-15a.75.75 0 010-1.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    iconFilled: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] flex-col bg-[#050505] z-40">
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
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
            <div>
              <span className="text-lg font-semibold tracking-tight">PointFly</span>
              <span
                className="block text-[10px] font-medium tracking-wider uppercase"
                style={{ color: 'var(--brand)' }}
              >
                Beta
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-2" aria-label="Main navigation">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span
                    className="flex items-center justify-center w-6"
                    style={{ color: isActive ? 'var(--brand)' : undefined }}
                  >
                    {isActive ? item.iconFilled : item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 mx-1">
            <div
              className="p-4 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(191, 255, 0, 0.1) 0%, rgba(191, 255, 0, 0.02) 100%)',
                border: '1px solid rgba(191, 255, 0, 0.15)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Your Points
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--brand)' }}>
                {session.user?.points?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-[var(--surface)]"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--surface-2)',
                boxShadow: '0 0 0 2px var(--border)',
              }}
            >
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {session.user?.favoriteTeam || 'No team selected'}
              </p>
            </div>
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </aside>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        aria-label="Mobile navigation"
        style={{
          background: 'rgba(5, 5, 5, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[72px] transition-colors"
                style={{ color: isActive ? 'var(--brand)' : 'var(--text-muted)' }}
              >
                <span className="relative">
                  {isActive ? item.iconFilled : item.icon}
                  {isActive && (
                    <span
                      className="absolute -inset-2 rounded-full -z-10"
                      style={{
                        background: 'rgba(191, 255, 0, 0.1)',
                      }}
                    />
                  )}
                </span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
