import axios, { AxiosError } from 'axios';

// ============ API Client Setup ============

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Unwrap backend's { data: ... } wrapper on success responses
api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  (error: AxiosError) => Promise.reject(error)
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// ============ Types ============

export interface Sport {
  key: string;
  name: string;
}

export interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  spread: number;
  spreadTeam: string;
  status: 'upcoming' | 'finished';
  finalHomeScore?: number;
  finalAwayScore?: number;
}

export interface Bet {
  _id: string;
  gameId: string | Game;
  selection: 'favorite' | 'opponent';
  status: 'pending' | 'won' | 'lost' | 'push';
  spreadAtBet: number;
  favoriteTeamAtBet: string;
  createdAt: string;
}

export interface SettleGameResponse {
  game: Game;
  settledBets: number;
  pointsAwarded: number;
}

// ============ Sports & Teams ============

export async function getSports(): Promise<Sport[]> {
  const res = await api.get('/users/sports');
  return res.data?.sports || [];
}

export async function getTeams(sport: string): Promise<string[]> {
  const res = await api.get(`/users/sports/${sport}/teams`);
  return res.data?.teams || [];
}

// ============ User Favorite Team ============

export async function getFavoriteTeam(): Promise<{ sport: string | null; team: string | null }> {
  const res = await api.get('/users/favorite-team');
  return { sport: res.data?.favoriteSport || null, team: res.data?.favoriteTeam || null };
}

export async function setFavoriteTeam(
  sport: string,
  team: string
): Promise<{ favoriteSport: string; favoriteTeam: string }> {
  const res = await api.patch('/users/favorite-team', { sport, favoriteTeam: team });
  return res.data;
}

// ============ Games ============

export async function getNextGame(): Promise<Game | null> {
  try {
    const res = await api.get('/games/next');
    return res.data || null;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 404) return null;
    }
    throw err;
  }
}

export async function fetchGamesFromApi(): Promise<{ game: Game | null; remaining: number }> {
  const res = await api.post('/games/next');
  return { game: res.data?.game || null, remaining: res.data?.remainingRequests || 0 };
}

// ============ Bets ============

export async function placeBet(gameId: string, selection: 'favorite' | 'opponent'): Promise<Bet> {
  const res = await api.post('/bets', { gameId, selection });
  return res.data;
}

export async function getBets(): Promise<Bet[]> {
  const res = await api.get('/bets');
  return Array.isArray(res.data) ? res.data : [];
}

// ============ Admin ============

export async function settleGame(
  gameId: string,
  homeScore: number,
  awayScore: number,
  apiKey: string
): Promise<SettleGameResponse> {
  const res = await api.post(
    `/games/${gameId}/settle`,
    {
      finalHomeScore: homeScore,
      finalAwayScore: awayScore,
    },
    {
      headers: { 'X-Admin-API-Key': apiKey },
    }
  );
  return res.data;
}

// ============ Account ============

export async function deleteAccount(): Promise<{ message: string; deletedBets: number }> {
  const res = await api.delete('/users/me');
  return res.data;
}

// ============ Error Helper ============

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || 'Something went wrong';
  }
  return 'Something went wrong';
}

export default api;
