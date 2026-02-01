# PointFly Implementation Tasks

## Progress Tracker

- [x] Planning complete
- [x] Phase 1: Project Foundation
- [x] Phase 2: Backend Foundation
- [x] Phase 3: Data Models
- [x] Phase 4: Backend Authentication
- [x] Phase 5: Odds API Integration
- [ ] Phase 6: Backend API Endpoints
- [ ] Phase 7: Frontend Foundation
- [ ] Phase 8: Frontend Authentication
- [ ] Phase 9: Frontend UI
- [ ] Phase 10: Testing
- [ ] Phase 11: Documentation

---

## Phase 1: Project Foundation ✓

### Prerequisites

- [x] Node.js 18+ installed
- [x] GitHub account ready
- [x] Git configured with name and email

### Tasks

#### 1.1 GitHub Repository Setup

- [x] Create new repository on GitHub named `pointfly`
- [x] Initialize local git repo
- [x] Add remote origin
- [x] Create initial commit

#### 1.2 Create Directory Structure

- [x] Create `frontend/` directory
- [x] Create `backend/` directory
- [x] Create `docs/` directory

#### 1.3 Root Configuration

- [x] Create root package.json with scripts
- [x] Create .nvmrc for Node version
- [x] Create .gitignore

#### 1.4 Code Formatting

- [x] Create .prettierrc
- [x] Create .prettierignore
- [x] Create .editorconfig

#### 1.5 Push to GitHub

- [x] Stage all files
- [x] Create initial commit
- [x] Push to GitHub

**Commit**: `chore: initialize project with frontend and backend structure`

---

## Phase 2: Backend Foundation ✓

### Tasks

- [x] Create NestJS app in `backend/`
- [x] Install core dependencies (mongoose, config, jwt, passport, axios, class-validator)
- [x] Configure environment validation with Joi
- [x] Set up MongoDB connection
- [x] Create common utilities (exception filter, transform interceptor)

**Commit**: `feat(backend): initialize nestjs with mongodb and configuration`

---

## Phase 3: Data Models ✓

### Tasks

- [x] Create User schema (`email`, `name`, `image?`, `providerId`, `points`)
- [x] Create Game schema (`gameId`, `homeTeam`, `awayTeam`, `startTime`, `spread`, `spreadTeam`, `status: 'upcoming'|'finished'`, `finalHomeScore?`, `finalAwayScore?`, timestamps)
- [x] Create Bet schema (`userId`, `gameId`, `selection: 'favorite'|'opponent'`, `status: 'pending'|'won'|'lost'|'push'`, `spreadAtBet`, `createdAt`)
- [x] Add compound unique index on `userId + gameId` for Bet

**Commit**: `feat(backend): add mongoose schemas for user, game, and bet`

---

## Phase 4: Backend Authentication ✓

### Tasks

- [x] Create JWT Strategy (validates backend-issued JWTs)
- [x] Create JwtAuthGuard for protected endpoints
- [x] Create AdminApiKeyGuard (checks `x-admin-api-key` header with timing-safe comparison)
- [x] Create CurrentUser decorator
- [x] Create secure token exchange endpoint (`POST /auth/token`)
  - Accepts Google ID token from frontend
  - Verifies token signature against Google's public keys using `google-auth-library`
  - Validates `aud` claim matches `GOOGLE_CLIENT_ID`
  - Extracts user info only after verification
  - Upserts user in database and issues backend JWT
- [x] Create `GET /auth/me` endpoint for fetching current user data

### Security Features

- Google ID token verification prevents token forgery
- Timing-safe comparison on admin API key prevents timing attacks
- JWT expiration enforced (`ignoreExpiration: false`)
- All secrets loaded from validated environment variables

**Commit**: `feat(backend): implement jwt authentication and admin api key guard`

---

## Phase 5: Odds API Integration ✓

### Tasks

- [x] Create OddsApiService
- [x] Implement game fetching from The Odds API (filters by `FAVORITE_TEAM` env var)
- [x] Parse spread data from bookmakers array
- [x] Upsert Game document in MongoDB (create or update)
- [x] Return next upcoming game for favorite team

**Commit**: `feat(backend): integrate the odds api for favorite team game data`

---

## Phase 6: Backend API Endpoints

### Tasks

- [ ] Implement GET /games/next (returns stored next game and odds)
- [ ] Implement POST /games/next (fetches from Odds API and upserts in DB)
- [ ] Implement POST /bets (body: `{ gameId, selection }`, one bet per user per game)
- [ ] Implement GET /bets (returns bets for authenticated user)
- [ ] Implement POST /games/:gameId/settle (admin-only, body: `{ finalHomeScore, finalAwayScore }`)
- [ ] Implement settlement logic (win/lose/push determination, 100 points for wins)

**Commit**: `feat(backend): implement games and bets api endpoints`

---

## Phase 7: Frontend Foundation

### Tasks

- [ ] Create Next.js app with App Router in `frontend/`
- [ ] Configure Tailwind CSS with team colors via CSS variables
- [ ] Create base UI components (button, card, badge, skeleton)
- [ ] Set up API client with axios

**Commit**: `feat(frontend): initialize nextjs with tailwind and app router`

---

## Phase 8: Frontend Authentication

### Tasks

- [ ] Configure NextAuth with Google provider
- [ ] Use JWT session strategy
- [ ] In JWT callback: send `account.id_token` (Google ID token) to `POST /auth/token`
- [ ] Store returned backend JWT (`accessToken`) in session
- [ ] Create middleware for protected routes
- [ ] Create sign-in page

**Commit**: `feat(frontend): implement nextauth with google oauth`

---

## Phase 9: Frontend UI

### Tasks

- [ ] Create NextGameCard component (teams, start time, spread, countdown)
- [ ] Create BetPlacementForm component (selection radio, spread explanation, submit)
- [ ] Create BetList component (user bets with status badges)
- [ ] Create UserPointsDisplay component (show current points)
- [ ] Create dashboard/main page
- [ ] Implement useNextGame hook (fetch next game on page load)
- [ ] Implement useBets hook (fetch user bets if logged in)
- [ ] Implement usePlaceBet mutation hook (refresh bets list on success)

**Commit**: `feat(frontend): implement game display and betting ui`

---

## Phase 10: Testing

### Tasks

- [ ] Write bet placement tests (creates bet, rejects duplicates, rejects after game starts)
- [ ] Write settlement logic tests (marks wins/losses/pushes correctly, awards 100 points)
- [ ] Write auth guard tests (401 for missing/invalid tokens)
- [ ] Write admin guard tests (403 for missing/invalid API key)
- [ ] Write E2E tests for critical paths

**Commit**: `test: add unit and e2e tests for critical paths`

---

## Phase 11: Documentation

### Tasks

- [ ] Create comprehensive README with setup instructions
- [ ] Create .env.example with all required environment variables

**Commit**: `docs: add readme and environment setup`
