# PointFly

A play-to-earn sports betting application where users earn points by correctly predicting game outcomes against the spread.

---

## Tech Stack

- **Backend**: NestJS + MongoDB/Mongoose
- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Auth**: Google OAuth via NextAuth → Google ID token verified by backend → Backend JWT issued
- **Admin Auth**: API key in headers (timing-safe comparison)
- **Testing**: Jest for critical paths
- **Code Quality**: ESLint, Prettier

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud Console project with OAuth 2.0 credentials
- The Odds API key

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/qsingletary/pointfly.git
cd pointfly
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies (when available)
cd ../frontend && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pointfly

# The Odds API
ODDS_API_KEY=your_odds_api_key

# Backend JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Admin
ADMIN_API_KEY=your_admin_api_key_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

Create a `.env.local` file in the `frontend/` directory (when frontend is implemented):

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Team Configuration
NEXT_PUBLIC_TEAM_NAME=TeamName
NEXT_PUBLIC_TEAM_PRIMARY=#000000
NEXT_PUBLIC_TEAM_SECONDARY=#FFFFFF
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev:backend    # Starts backend on port 3001
npm run dev:frontend   # Starts frontend on port 3000
```

---

## Project Structure

```
pointfly/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # UI components
│   │   ├── hooks/              # useNextGame, useBets, usePlaceBet
│   │   └── lib/                # auth.ts, api-client.ts
│   └── package.json
├── backend/                     # NestJS backend
│   ├── src/
│   │   ├── auth/               # JWT strategy, guards, token exchange
│   │   ├── users/              # User schema, service
│   │   ├── games/              # Odds API, game logic, settlement
│   │   ├── bets/               # Bet placement, history
│   │   └── common/             # Guards, decorators, filters
│   └── package.json
├── docs/
│   ├── plan.md                 # Implementation plan
│   └── tasks.md                # Task tracker
└── package.json                # Root scripts
```

---

## API Endpoints

### Health

| Method | Path | Auth | Description                                      |
| ------ | ---- | ---- | ------------------------------------------------ |
| GET    | /    | None | API health status (version, uptime, environment) |

### Authentication

| Method | Path        | Auth | Description                              |
| ------ | ----------- | ---- | ---------------------------------------- |
| POST   | /auth/token | None | Exchange Google ID token for backend JWT |
| GET    | /auth/me    | JWT  | Get current user data                    |

### Users

| Method | Path                 | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| PATCH  | /users/favorite-team | JWT  | Set user's favorite team |
| GET    | /users/favorite-team | JWT  | Get user's favorite team |

### Games

| Method | Path                  | Auth          | Description                            |
| ------ | --------------------- | ------------- | -------------------------------------- |
| GET    | /games/next           | JWT           | Get next game for user's favorite team |
| POST   | /games/next           | JWT           | Fetch from Odds API for user's team    |
| POST   | /games/:gameId/settle | Admin API Key | Settle game with final scores          |

### Bets

| Method | Path  | Auth | Description                           |
| ------ | ----- | ---- | ------------------------------------- |
| POST   | /bets | JWT  | Place a bet (`{ gameId, selection }`) |
| GET    | /bets | JWT  | Get user's bet history                |

---

## Authentication Flow

```
Frontend                          Backend
   |                                 |
   |  1. User signs in via Google    |
   |  2. NextAuth receives id_token  |
   |                                 |
   |  POST /auth/token               |
   |  { idToken: "eyJ..." }          |
   |  -----------------------------> |
   |                                 |  3. Verify token with Google
   |                                 |  4. Validate aud == GOOGLE_CLIENT_ID
   |                                 |  5. Extract user info (sub, email, name)
   |                                 |  6. Upsert user in MongoDB
   |                                 |  7. Sign backend JWT
   |  <----------------------------- |
   |  { accessToken, user }          |
   |                                 |
   |  Subsequent API calls:          |
   |  Authorization: Bearer <token>  |
   |  -----------------------------> |
```

---

## Data Models

### User

```typescript
{
  email: string;
  name: string;
  image?: string;
  providerId: string;
  points: number;       // Default: 0
  favoriteTeam?: string; // User's selected team
}
```

### Game

```typescript
{
  gameId: string;        // Unique ID from Odds API
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;        // e.g., -4.5
  spreadTeam: string;    // Team the spread applies to
  status: 'upcoming' | 'finished';
  finalHomeScore?: number;
  finalAwayScore?: number;
}
```

### Bet

```typescript
{
  userId: ObjectId; // Reference to User
  gameId: ObjectId; // Reference to Game
  selection: 'favorite' | 'opponent';
  status: 'pending' | 'won' | 'lost' | 'push';
  spreadAtBet: number; // Spread at time of bet
  favoriteTeamAtBet: string; // User's team at bet time (for settlement)
}
```

---

## Settlement Logic

When an admin settles a game, each bet is settled using the user's favorite team **at the time of bet placement** (`favoriteTeamAtBet`). This ensures bets settle correctly even if users change their favorite team after placing a bet.

```typescript
// For each bet:
favoriteScore = game.homeTeam === bet.favoriteTeamAtBet ? finalHomeScore : finalAwayScore;
opponentScore = game.homeTeam === bet.favoriteTeamAtBet ? finalAwayScore : finalHomeScore;

actualMargin = favoriteScore - opponentScore;
adjustedMargin = actualMargin + spreadAtBet;

// 'favorite' bet: adjustedMargin > 0 = WIN, < 0 = LOSE, = 0 = PUSH
// 'opponent' bet: adjustedMargin < 0 = WIN, > 0 = LOSE, = 0 = PUSH
// Award 100 points for WIN
```

---

## Available Scripts

### Root

```bash
npm run dev:backend      # Start backend in dev mode
npm run dev:frontend     # Start frontend in dev mode
npm run build:backend    # Build backend for production
npm run build:frontend   # Build frontend for production
npm run lint:backend     # Lint backend code
npm run lint:frontend    # Lint frontend code
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting
```

### Backend

```bash
cd backend
npm run start:dev        # Start with hot reload
npm run start:prod       # Start production build
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:cov         # Run tests with coverage
```

---

## Implementation Progress

- [x] Phase 1: Project Foundation
- [x] Phase 2: Backend Foundation
- [x] Phase 3: Data Models
- [x] Phase 4: Backend Authentication
- [x] Phase 5: Odds API Integration
- [x] Phase 6: Backend API Endpoints
- [ ] Phase 7: Frontend Foundation
- [ ] Phase 8: Frontend Authentication
- [ ] Phase 9: Frontend UI
- [ ] Phase 10: Testing
- [ ] Phase 11: Documentation

See [docs/tasks.md](docs/tasks.md) for detailed task breakdown.

---

## License

UNLICENSED - Private project
