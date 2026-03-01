# StyleSwipe Architecture Review (March 2026)

## Phase 1 — Current State

### Functional Intent
- Users sign in, complete onboarding, swipe inspiration cards, and receive product recommendations.
- Swipes update profile tag affinity (`tag_scores`) in Supabase.
- Recommendations are ranked by tag affinity and shown in a separate shopping tab.

### Runtime Boundaries
- Mobile app (Expo Router + React Native) handles UX and interaction.
- Supabase Auth handles identity/session.
- Supabase Postgres stores profiles, inspiration items, products, and swipes.
- Supabase Edge Functions provide server-side feed and recommendation logic.

### Data Flows
1. `AuthContext` resolves session and user.
2. Hooks request feed/recommendations/my-style from Edge Functions.
3. Swipe submission writes `swipes` and updates profile tag scores.
4. Tabs read and render feed/recommendations/my-style.

### Coupling and Organic Growth Signals
- Client hooks mixed UI state, auth concerns, transport details, and fallback logic.
- Onboarding persistence rules were duplicated across screens.
- Edge functions duplicated CORS, auth parsing, JSON parsing, and response handling.
- Domain logic existed, but was spread across screens/hooks/functions without a clear service boundary.

## Phase 2 — Critical Questions

### Architecture Fit
- Serverless Edge Functions remain appropriate for this product size and request pattern.
- A microservice split would add operational complexity without solving current bottlenecks.

### Abstraction Quality
- Existing abstractions were too UI-centric.
- Missing middle layer: feature services/use-cases between screens/hooks and transport.

### Data Model
- Core schema remains valid for MVP:
  - `profiles` (preference + learned affinity)
  - `swipes` (behavior trail)
  - `inspiration_items` (learning content)
  - `products` (buyable recommendations)
- Main issue was not schema shape, but how consistently it was used in code.

### Dependencies
- Dependency set is reasonable for Expo + gesture UX.
- The bigger issue was custom duplicated plumbing, not package choice.

### Structure/Readability
- Top-level folders were understandable, but responsibilities were blurred:
  - Hooks had infra + domain + view concerns.
  - Edge handlers repeated boilerplate that hid business intent.

## Phase 3 — Ideal Design (Applied)

### Target Architecture
- Keep deployment model (Expo + Supabase serverless).
- Introduce explicit layers:
  - `app/` screens (view)
  - `hooks/` orchestration
  - `features/` domain/application services
  - `lib/` infrastructure adapters
  - `supabase/functions/_shared` backend infrastructure helpers
  - `supabase/functions/*` backend use-case handlers

### Design Principles
- One source for domain mapping rules.
- One path for authenticated Edge Function calls on client.
- One path for CORS/auth/error handling on backend.
- Preserve behavior while reducing accidental complexity.

## Phase 4 — Rebuild Work Executed

### Client-Side Re-architecture
- Added a feature-oriented service layer:
  - `features/core/authSession.js`
  - `features/core/edgeFunctionClient.js`
  - `features/swipeFeed/swipeFeedService.js`
  - `features/recommendations/recommendationsService.js`
  - `features/myStyle/myStyleService.js`
  - `features/onboarding/onboardingProfileService.js`
- Migrated hooks to consume services instead of inlining HTTP/auth logic.
- Removed dead abstractions:
  - deleted `hooks/useSubmitSwipe.js`
  - deleted `services/api.js`

### Backend Re-architecture
- Added shared function infrastructure:
  - `supabase/functions/_shared/httpErrors.ts`
  - `supabase/functions/_shared/http.ts`
  - `supabase/functions/_shared/supabaseAdmin.ts`
  - `supabase/functions/_shared/auth.ts`
- Refactored all Edge handlers to use shared helpers:
  - `submit-swipe`
  - `swipe-feed`
  - `recommendations`
  - `my-style`
- Added tests for shared auth parsing:
  - `supabase/functions/_shared/auth.test.ts`

### Documentation
- Updated `README.md` with the new layering model.

## Phase 5 — Outcome

### What Improved
- Domain rules are centralized and reusable.
- UI hooks are focused on orchestration/state, not transport internals.
- Edge handlers now read like business logic, not protocol boilerplate.
- Security-relevant parsing/authorization logic is standardized.

### What Remains for Next Iteration
- Add dedicated test harness for React hooks/services.
- Add typed contracts shared between mobile and edge functions.
- Consider moving JS app code to TypeScript for stronger maintainability.
