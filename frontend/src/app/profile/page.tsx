'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Nav } from '@/components/nav';
import {
  getSports,
  getTeams,
  setFavoriteTeam,
  deleteAccount,
  getErrorMessage,
  setAuthToken,
} from '@/lib';
import type { Sport } from '@/lib/api';

export default function ProfilePage() {
  const { data: session, status, update: refreshSession } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const user = session?.user;

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session?.accessToken]);
  useEffect(() => {
    if (!isOpen) return;

    async function loadSports() {
      setLoading(true);
      setError('');
      try {
        const list = await getSports();
        setSports(list);
        if (user?.favoriteSport) {
          setSelectedSport(user.favoriteSport);
          setSelectedTeam(user.favoriteTeam || '');
        } else if (list.length > 0) {
          setSelectedSport(list[0].key);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadSports();
  }, [isOpen, user?.favoriteSport, user?.favoriteTeam]);

  useEffect(() => {
    if (!selectedSport || !isOpen) return;

    async function loadTeams() {
      setLoading(true);
      try {
        const list = await getTeams(selectedSport);
        setTeams(list);
        if (selectedTeam && !list.includes(selectedTeam)) {
          setSelectedTeam('');
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, [selectedSport, isOpen, selectedTeam]);

  function openModal() {
    setError('');
    setSelectedSport(user?.favoriteSport || '');
    setSelectedTeam(user?.favoriteTeam || '');
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setError('');
  }

  async function handleSave() {
    if (!selectedSport || !selectedTeam) return;

    setSaving(true);
    setError('');
    try {
      const updatedData = await setFavoriteTeam(selectedSport, selectedTeam);
      await refreshSession({
        favoriteSport: updatedData.favoriteSport,
        favoriteTeam: updatedData.favoriteTeam,
      });
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6 safe-top lg:pt-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-8 w-24 rounded-lg loading-shimmer" />
            <div className="h-40 rounded-xl loading-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="lg:ml-[240px] pb-20 lg:pb-0 p-6 safe-top lg:pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Profile</h1>

          <div
            className="p-5 rounded-xl mb-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-4 mb-5">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full"
                  style={{ boxShadow: '0 0 0 2px var(--border)' }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--brand)' }}
                >
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-lg truncate">{user?.name}</p>
                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <div
              className="flex items-center justify-between py-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total Points
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--brand)' }}>
                {user?.points?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <div
            className="p-5 rounded-xl mb-4"
            style={{
              background: user?.favoriteTeam
                ? 'linear-gradient(135deg, rgba(191, 255, 0, 0.08) 0%, transparent 100%)'
                : 'var(--surface)',
              border: user?.favoriteTeam
                ? '1px solid rgba(191, 255, 0, 0.2)'
                : '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Favorite Team
                </p>
                <p className="text-lg font-semibold">{user?.favoriteTeam || 'Not selected'}</p>
              </div>
              <button
                onClick={openModal}
                className={`btn px-4 py-2.5 ${user?.favoriteTeam ? 'btn-secondary' : 'btn-primary'}`}
              >
                {user?.favoriteTeam ? 'Change' : 'Select'}
              </button>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3 text-sm font-medium rounded-xl transition-all cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            Sign out
          </button>

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h2
              className="text-sm font-medium uppercase tracking-wider mb-4"
              style={{ color: 'var(--error)' }}
            >
              Danger Zone
            </h2>
            <div
              className="p-5 rounded-xl"
              style={{
                background: 'rgba(241, 94, 94, 0.05)',
                border: '1px solid rgba(241, 94, 94, 0.2)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium mb-1">Delete Account</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Permanently delete your account and all associated data including bets and
                    points. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer"
                  style={{
                    background: 'transparent',
                    color: 'var(--error)',
                    border: '1px solid var(--error)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--error)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--error)';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-team-title"
          >
            <div
              className="w-full sm:max-w-md sm:rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2 id="select-team-title" className="text-lg font-semibold">
                  Select Team
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close dialog"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-5">
                {error && (
                  <div
                    className="p-4 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(241, 94, 94, 0.1)',
                      border: '1px solid rgba(241, 94, 94, 0.2)',
                    }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--error)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--error)' }}>
                      {error}
                    </span>
                  </div>
                )}

                <div>
                  <label htmlFor="sport-select">Sport</label>
                  <select
                    id="sport-select"
                    value={selectedSport}
                    onChange={(e) => {
                      setSelectedSport(e.target.value);
                      setSelectedTeam('');
                    }}
                    disabled={loading || saving}
                  >
                    <option value="">Select sport...</option>
                    {sports.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="team-select">Team</label>
                  <select
                    id="team-select"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    disabled={!selectedSport || loading || saving || teams.length === 0}
                  >
                    <option value="">Select team...</option>
                    {teams.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSave}
                  disabled={!selectedSport || !selectedTeam || saving}
                  className="w-full btn btn-primary py-3.5 text-base"
                >
                  {saving ? (
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
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleting) {
                setIsDeleteOpen(false);
                setDeleteError('');
              }
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
          >
            <div
              className="w-full sm:max-w-md sm:rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2
                  id="delete-account-title"
                  className="text-lg font-semibold"
                  style={{ color: 'var(--error)' }}
                >
                  Delete Account
                </h2>
                <button
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setDeleteError('');
                  }}
                  disabled={deleting}
                  className="p-2 rounded-lg transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close dialog"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5">
                {deleteError && (
                  <div
                    className="mb-4 p-4 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(241, 94, 94, 0.1)',
                      border: '1px solid rgba(241, 94, 94, 0.2)',
                    }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--error)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--error)' }}>
                      {deleteError}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(241, 94, 94, 0.1)' }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: 'var(--error)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p id="delete-account-description" className="font-medium mb-2">
                      Are you sure you want to delete your account?
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      This will permanently delete:
                    </p>
                    <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
                      <li>• Your profile and account data</li>
                      <li>• All your betting history</li>
                      <li>• Your {user?.points?.toLocaleString() || 0} points</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setDeleteError('');
                  }}
                  disabled={deleting}
                  className="flex-1 btn btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-3 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  style={{ background: 'var(--error)', color: '#fff' }}
                >
                  {deleting ? (
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
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
