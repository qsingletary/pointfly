# PointFly Implementation Plan

## Tech Stack Summary

- **Backend**: NestJS + MongoDB/Mongoose
- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Auth**: Google OAuth via NextAuth + JWT for backend API
- **Admin Auth**: Simple API key in headers
- **Testing**: Jest for critical paths
- **Code Quality**: ESLint, Prettier

---

## Directory Structure

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
│   │   ├── auth/               # JWT strategy, guards
│   │   ├── users/              # User schema, service
│   │   ├── games/              # Odds API, game logic, settlement
│   │   ├── bets/               # Bet placement, history
│   │   └── common/             # Guards, decorators, filters
│   └── package.json
├── docs/
│   ├── plan.md
│   └── tasks.md
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── package.json
└── README.md
```

---

## Implementation Phases

### Phase 1: Project Foundation

**Files**: `.prettierrc`, root `package.json`

1. Initialize Git repository
2. Create frontend and backend directories
3. Set up Prettier and EditorConfig

**Commit**: `chore: initialize project with frontend and backend structure`

---

### Phase 2: Backend Foundation

**Files**: `backend/src/main.ts`, `app.module.ts`, `config/validation.schema.ts`

1. Create NestJS app in `backend/`
2. Install dependencies (mongoose, config, jwt, passport, axios, class-validator)
3. Configure environment validation with Joi
4. Set up MongoDB connection
5. Create common utilities (exception filter, transform interceptor)

**Commit**: `feat(backend): initialize nestjs with mongodb and configuration`

---

### Phase 3: Data Models

**Files**: `backend/src/*/schemas/*.schema.ts`

**User Schema**:

```typescript
{ email, name, image?, providerId, points: 0 }
```

**Game Schema**:

```typescript
{
  gameId,              // string, unique (from Odds API)
  homeTeam,            // string
  awayTeam,            // string
  startTime,           // Date
  spread,              // number (e.g., -4.5)
  spreadTeam,          // string (which team the spread applies to)
  status,              // 'upcoming' | 'finished'
  finalHomeScore?,     // number (optional)
  finalAwayScore?,     // number (optional)
  timestamps           // createdAt, updatedAt (Mongoose option)
}
```

**Bet Schema**:

```typescript
{
  (userId, // reference to User
    gameId, // reference to Game
    selection, // 'favorite' | 'opponent'
    status, // 'pending' | 'won' | 'lost' | 'push'
    spreadAtBet, // number (spread at time of bet)
    createdAt); // Date (Mongoose timestamps)
}
```

- Compound unique index on `userId + gameId` (one bet per game per user)

**Commit**: `feat(backend): add mongoose schemas for user, game, and bet`

---

### Phase 4: Backend Authentication

**Files**: `backend/src/auth/*`, `backend/src/common/guards/*`

1. Create JWT Strategy (validates tokens from NextAuth)
2. Create JwtAuthGuard for protected endpoints
3. Create AdminApiKeyGuard (checks `x-admin-api-key` header)
4. Create CurrentUser decorator
5. Create auth endpoint to exchange OAuth tokens for backend JWT

**Commit**: `feat(backend): implement jwt authentication and admin api key guard`

---

### Phase 5: Odds API Integration

**Files**: `backend/src/games/odds-api.service.ts`

1. Create OddsApiService
2. Fetch from The Odds API (sport endpoint based on `FAVORITE_TEAM` config)
3. Filter for games where `home_team` or `away_team` matches `FAVORITE_TEAM` env var
4. Parse spread from bookmakers array
5. Upsert Game document in MongoDB (create or update)
6. Return next upcoming game

**Commit**: `feat(backend): integrate the odds api for favorite team game data`

---

### Phase 6: Backend API Endpoints

**Files**: `backend/src/games/games.controller.ts`, `backend/src/bets/bets.controller.ts`

**Endpoints**:
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /games/next | JWT | Get next game and odds |
| POST | /games/next | JWT | Fetch from Odds API and upsert |
| POST | /bets | JWT | Place a bet (body: `{ gameId, selection }`) |
| GET | /bets | JWT | Get user's bets |
| POST | /games/:gameId/settle | Admin API Key | Settle bets (body: `{ finalHomeScore, finalAwayScore }`) |

**Settlement Logic**:

```typescript
// Determine which score belongs to favorite team based on home/away
favoriteScore = game.homeTeam === FAVORITE_TEAM ? finalHomeScore : finalAwayScore;
opponentScore = game.homeTeam === FAVORITE_TEAM ? finalAwayScore : finalHomeScore;

actualMargin = favoriteScore - opponentScore;
adjustedMargin = actualMargin + spread;

// 'favorite' bet: adjustedMargin > 0 = WIN, < 0 = LOSE, = 0 = PUSH
// 'opponent' bet: adjustedMargin < 0 = WIN, > 0 = LOSE, = 0 = PUSH
// Award 100 points for WIN
```

**Commit**: `feat(backend): implement games and bets api endpoints`

---

### Phase 7: Frontend Foundation

**Files**: `frontend/*`, `tailwind.config.ts`

1. Create Next.js app with App Router in `frontend/`
2. Configure Tailwind with team colors via CSS variables (configurable via env vars)
3. Create base UI components (button, card, badge, skeleton)
4. Set up API client with axios

**Commit**: `feat(frontend): initialize nextjs with tailwind and app router`

---

### Phase 8: Frontend Authentication

**Files**: `frontend/src/lib/auth.ts`, `frontend/src/app/api/auth/[...nextauth]/route.ts`, `frontend/src/middleware.ts`

1. Configure NextAuth with Google provider
2. Use JWT session strategy
3. In JWT callback: exchange OAuth token for backend JWT
4. Store backend JWT in session
5. Create middleware for protected routes
6. Create sign-in page

**Commit**: `feat(frontend): implement nextauth with google oauth`

---

### Phase 9: Frontend UI

**Files**: `frontend/src/components/*`, `frontend/src/hooks/*`, `frontend/src/app/(protected)/*`

**Components**:

- `NextGameCard` - Display teams, start time, spread, countdown
- `BetPlacementForm` - Selection radio, spread explanation, submit
- `BetList` - User bets with status badges
- `UserPointsDisplay` - Show current points

**Hooks** (using React Query):

- `useNextGame()` - Fetch next game on page load
- `useBets()` - Fetch user bets (if logged in)
- `usePlaceBet()` - Place bet mutation (invalidates/refreshes bets list on success)

**Commit**: `feat(frontend): implement game display and betting ui`

---

### Phase 10: Testing

**Files**: `backend/src/**/*.spec.ts`, `backend/test/*.e2e-spec.ts`

**Critical Tests**:

1. Bet placement - creates bet, rejects duplicates, rejects after game starts
2. Settlement - marks wins/losses/pushes correctly, awards 100 points
3. Auth guards - 401 for missing/invalid tokens
4. Admin guard - 403 for missing/invalid API key

**Commit**: `test: add unit and e2e tests for critical paths`

---

### Phase 11: Documentation

**Files**: `README.md`, `.env.example`

1. Comprehensive README with setup instructions
2. Environment variable examples

**Commit**: `docs: add readme and environment setup`

---

## Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pointfly

# The Odds API
ODDS_API_KEY=your_odds_api_key

# JWT (shared between NextAuth and NestJS)
JWT_SECRET=your_jwt_secret_min_32_chars

# Admin
ADMIN_API_KEY=your_admin_api_key_min_32_chars

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API URL (frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Team Configuration
FAVORITE_TEAM=Your Team Name
NEXT_PUBLIC_TEAM_NAME=TeamName
NEXT_PUBLIC_TEAM_PRIMARY=#000000
NEXT_PUBLIC_TEAM_SECONDARY=#FFFFFF
```

---

## Git Workflow

**Branch Strategy**: Feature branches off `main`

```
main
├── feat/project-setup
├── feat/backend-foundation
├── feat/backend-auth
├── feat/backend-odds-api
├── feat/backend-endpoints
├── feat/frontend-foundation
├── feat/frontend-auth
├── feat/frontend-ui
├── feat/testing
└── docs/readme-setup
```

**Commit Convention**: Conventional Commits

- `feat(backend):` / `feat(frontend):` for features
- `fix(backend):` / `fix(frontend):` for bugs
- `test:` for tests
- `docs:` for documentation
- `chore:` for maintenance

---

## Verification Plan

1. **Backend API**: Test all endpoints via Postman/curl
   - Fetch game from Odds API
   - Place bet (verify one per game limit)
   - Settle game and verify points awarded

2. **Frontend Flow**: Manual E2E test
   - Sign in with Google
   - View next game and spread
   - Place bet
   - View bet in "My Bets"
   - (Admin settles via Postman)
   - Refresh and verify bet status updated + points

3. **Automated Tests**: `npm run test:backend` and `npm run test:frontend` pass all critical path tests
