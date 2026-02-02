import type { UserData } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchCurrentUser(accessToken: string): Promise<UserData | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status);
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}
