# PointFly Implementation Tasks

## Progress Tracker

- [x] Planning complete
- [ ] Phase 1: Project Foundation
- [ ] Phase 2: Backend Foundation
- [ ] Phase 3: Data Models
- [ ] Phase 4: Backend Authentication
- [ ] Phase 5: Odds API Integration
- [ ] Phase 6: Backend API Endpoints
- [ ] Phase 7: Frontend Foundation
- [ ] Phase 8: Frontend Authentication
- [ ] Phase 9: Frontend UI
- [ ] Phase 10: Testing
- [ ] Phase 11: Documentation

---

## Phase 1: Project Foundation

### Prerequisites

- [ ] Node.js 18+ installed
- [ ] GitHub account ready
- [ ] Git configured with name and email

### Tasks

#### 1.1 GitHub Repository Setup

- [ ] Create new repository on GitHub named `pointfly`
- [ ] Initialize local git repo
- [ ] Add remote origin
- [ ] Create initial commit

#### 1.2 Create Directory Structure

- [ ] Create `frontend/` directory
- [ ] Create `backend/` directory
- [ ] Create `docs/` directory

#### 1.3 Root Configuration

- [ ] Create root package.json with scripts
- [ ] Create .nvmrc for Node version
- [ ] Create .gitignore

#### 1.4 Code Formatting

- [ ] Create .prettierrc
- [ ] Create .prettierignore
- [ ] Create .editorconfig

#### 1.5 Push to GitHub

- [ ] Stage all files
- [ ] Create initial commit
- [ ] Push to GitHub

**Commit**: `chore: initialize project with frontend and backend structure`

---

## Phase 2: Backend Foundation

### Tasks

- [ ] Create NestJS app in `backend/`
- [ ] Install core dependencies (mongoose, config, jwt, passport, axios, class-validator)
- [ ] Configure environment validation with Joi
- [ ] Set up MongoDB connection
- [ ] Create common utilities (exception filter, transform interceptor)

**Commit**: `feat(backend): initialize nestjs with mongodb and configuration`

---

## Phase 3: Data Models

### Tasks

- [ ] Create User schema (`email`, `name`, `image?`, `providerId`, `points`)
- [ ] Create Game schema (`gameId`, `homeTeam`, `awayTeam`, `startTime`, `spread`, `spreadTeam`, `status: 'upcoming'|'finished'`, `finalHomeScore?`, `finalAwayScore?`, timestamps)
- [ ] Create Bet schema (`userId`, `gameId`, `selection: 'favorite'|'opponent'`, `status: 'pending'|'won'|'lost'|'push'`, `spreadAtBet`, `createdAt`)
- [ ] Add compound unique index on `userId + gameId` for Bet

**Commit**: `feat(backend): add mongoose schemas for user, game, and bet`

---

## Phase 4: Backend Authentication

### Tasks

- [ ] Create JWT Strategy (validates tokens from NextAuth)
- [ ] Create JwtAuthGuard for protected endpoints
- [ ] Create AdminApiKeyGuard (checks `x-admin-api-key` header)
- [ ] Create CurrentUser decorator
- [ ] Create auth endpoint to exchange OAuth tokens for backend JWT

**Commit**: `feat(backend): implement jwt authentication and admin api key guard`

---

## Phase 5: Odds API Integration

### Tasks

- [ ] Create OddsApiService
- [ ] Implement game fetching from The Odds API (filters by `FAVORITE_TEAM` env var)
- [ ] Parse spread data from bookmakers array
- [ ] Upsert Game document in MongoDB (create or update)
- [ ] Return next upcoming game for favorite team

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
- [ ] In JWT callback: exchange OAuth token for backend JWT
- [ ] Store backend JWT in session
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
