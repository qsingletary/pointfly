# PointFly

A play-to-earn sports betting app where users predict NBA game outcomes against the spread.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud OAuth 2.0 credentials
- [The Odds API](https://the-odds-api.com) key

### Setup

1. **Clone and install**

```bash
git clone https://github.com/qsingletary/pointfly.git
cd pointfly
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Configure environment**

Copy `.env.example` files and fill in your values:

```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/pointfly
JWT_SECRET=your-jwt-secret-min-32-chars
ADMIN_API_KEY=your-admin-api-key-min-32-chars
ODDS_API_KEY=your-odds-api-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000

# frontend/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Run development servers**

```bash
# From root directory
npm run dev:backend    # Port 3001
npm run dev:frontend   # Port 3000
```

## Project Structure

```
pointfly/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # JWT auth, Google token exchange
│   │   ├── bets/      # Bet placement and history
│   │   ├── games/     # Odds API integration, settlement
│   │   └── users/     # User management
│   └── .env.example
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Pages (home, bets, profile, admin)
│       ├── components/
│       └── lib/       # API client, auth config
└── docs/
```

## API Endpoints

| Endpoint               | Method | Auth  | Description                      |
| ---------------------- | ------ | ----- | -------------------------------- |
| `/auth/token`          | POST   | -     | Exchange Google ID token for JWT |
| `/auth/me`             | GET    | JWT   | Get current user                 |
| `/games/next`          | GET    | JWT   | Get next game for user's team    |
| `/games/next`          | POST   | JWT   | Fetch latest from Odds API       |
| `/games/:id/settle`    | POST   | Admin | Settle game with scores          |
| `/bets`                | POST   | JWT   | Place a bet                      |
| `/bets`                | GET    | JWT   | Get user's bet history           |
| `/users/favorite-team` | PATCH  | JWT   | Set favorite team                |

## How It Works

1. Sign in with Google
2. Select your favorite NBA team
3. View upcoming games with Vegas spreads
4. Bet on your team to cover the spread (or not)
5. Earn 100 points for correct predictions

## Testing

```bash
cd backend && npm test
```

## License

UNLICENSED - Private project
