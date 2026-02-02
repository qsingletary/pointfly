import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ExtendedToken extends JWT {
  accessToken?: string;
  userId?: string;
  points?: number;
  favoriteSport?: string;
  favoriteTeam?: string;
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      points?: number;
      favoriteSport?: string;
      favoriteTeam?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, trigger }): Promise<ExtendedToken> {
      const extendedToken = token as ExtendedToken;

      // On initial sign-in, exchange Google ID token for backend JWT
      if (account?.id_token) {
        try {
          const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: account.id_token }),
          });

          if (!response.ok) {
            console.error('Failed to exchange token with backend');
            return extendedToken;
          }

          const json = await response.json();
          const data = json.data;
          extendedToken.accessToken = data.accessToken;
          extendedToken.userId = data.user?.id;
          extendedToken.points = data.user?.points;
          extendedToken.favoriteSport = data.user?.favoriteSport;
          extendedToken.favoriteTeam = data.user?.favoriteTeam;
        } catch (error) {
          console.error('Error exchanging token:', error);
        }
      }

      // Refresh user data from backend on session update or when we have a token
      if ((trigger === 'update' || !extendedToken.favoriteTeam) && extendedToken.accessToken) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${extendedToken.accessToken}`,
            },
          });

          if (response.ok) {
            const json = await response.json();
            const user = json.data;
            extendedToken.points = user.points;
            extendedToken.favoriteSport = user.favoriteSport;
            extendedToken.favoriteTeam = user.favoriteTeam;
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }

      return extendedToken;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;

      // Pass the backend access token to the client session
      session.accessToken = extendedToken.accessToken;
      if (extendedToken.userId) {
        session.user.id = extendedToken.userId;
      }
      if (extendedToken.points !== undefined) {
        session.user.points = extendedToken.points;
      }
      if (extendedToken.favoriteSport) {
        session.user.favoriteSport = extendedToken.favoriteSport;
      }
      if (extendedToken.favoriteTeam) {
        session.user.favoriteTeam = extendedToken.favoriteTeam;
      }
      return session;
    },
  },
});
