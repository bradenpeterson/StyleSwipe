# ADR 0001: Introduce Feature Service Layer and Shared Edge Infrastructure

- Status: Accepted
- Date: 2026-03-01

## Context

The prior structure worked functionally but showed clear architectural drift:
- Client hooks combined UI state, auth/session access, HTTP details, and feature logic.
- Onboarding mapping/persistence logic was duplicated per screen.
- Edge functions repeated auth header parsing, CORS handling, JSON parsing, and error response code.
- Dead code (`services/api`, `useSubmitSwipe`) remained after iterative development.

This made the system harder to reason about, harder to test, and easier to break with future changes.

## Decision

### 1) Add a client-side feature service layer

Created `features/` to separate domain/application workflows from UI orchestration:
- `features/core/authSession.js`
- `features/core/edgeFunctionClient.js`
- `features/swipeFeed/swipeFeedService.js`
- `features/recommendations/recommendationsService.js`
- `features/myStyle/myStyleService.js`
- `features/onboarding/onboardingProfileService.js`

Hooks now orchestrate state and call feature services instead of implementing transport/auth details.

### 2) Add shared backend infrastructure for Edge Functions

Created `supabase/functions/_shared` primitives:
- `httpErrors.ts`
- `http.ts`
- `supabaseAdmin.ts`
- `auth.ts`

All major edge handlers now use these shared helpers to standardize:
- CORS preflight handling
- Bearer token validation
- user authorization check
- JSON body parsing and error handling
- JSON responses

### 3) Remove dead abstractions

Deleted:
- `hooks/useSubmitSwipe.js`
- `services/api.js`

## Consequences

### Positive
- Clearer separation of concerns.
- Lower duplication and lower bug surface for auth/error plumbing.
- Faster onboarding for new engineers due to explicit layers.
- Better maintainability and easier incremental enhancement.

### Negative / Tradeoffs
- Slight increase in file count and indirection.
- Migration overhead when touching existing hooks/functions.

The tradeoff is acceptable because complexity moved from implicit duplication to explicit structure.

## Alternatives Considered

1. Keep current structure and only patch bugs.
   - Rejected: does not address structural drift.

2. Full microservice split by feature.
   - Rejected: overkill for MVP scale and team size.

3. Immediate full TypeScript migration.
   - Deferred: valuable, but larger scope than this architectural correction pass.

## What We Deliberately Did Not Change

- Supabase serverless deployment model.
- Core database schema (`profiles`, `swipes`, `inspiration_items`, `products`).
- Primary UX flow and feature behavior.

These remain appropriate for current product scope; the primary issues were code organization and duplicated plumbing, not platform fit.
