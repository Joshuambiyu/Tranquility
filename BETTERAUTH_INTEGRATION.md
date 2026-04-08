# BetterAuth Integration Guide — TranquilityHub

This document covers the full BetterAuth integration in TranquilityHub, including Google One Tap + social sign-in working together, and every pitfall we hit during migration from NextAuth.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Browser                                             │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                  │
│  │ GoogleOneTap │   │ AuthControls │                  │
│  │ (auto-prompt)│   │ (Sign in btn)│                  │
│  └──────┬──────┘   └──────┬───────┘                  │
│         │                  │                          │
│         ▼                  ▼                          │
│  ┌─────────────────────────────────┐                  │
│  │  authClient (lib/auth-client.ts)│                  │
│  │  - oneTapClient plugin          │                  │
│  │  - useSession() hook            │                  │
│  └──────────────┬──────────────────┘                  │
└─────────────────┼────────────────────────────────────┘
                  │  fetch → /api/auth/*
                  ▼
┌──────────────────────────────────────────────────────┐
│  Server (Next.js App Router)                         │
│                                                      │
│  app/api/auth/[...auth]/route.ts                     │
│       │                                              │
│       ▼                                              │
│  ┌─────────────────────────────────┐                  │
│  │  auth (lib/auth.ts)             │                  │
│  │  - betterAuth()                 │                  │
│  │  - prismaAdapter               │                  │
│  │  - oneTap server plugin         │                  │
│  │  - nextCookies plugin           │                  │
│  └──────────────┬──────────────────┘                  │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────┐                             │
│  │  PostgreSQL (Neon)    │                             │
│  │  User / Account /     │                             │
│  │  Session / Verification│                            │
│  └───────────────────────┘                            │
└──────────────────────────────────────────────────────┘
```

---

## File Map

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Server-side BetterAuth instance, plugins, `getServerSession()` helper |
| `lib/auth-client.ts` | Client-side auth client, `useSession()` hook, One Tap client plugin |
| `app/api/auth/[...auth]/route.ts` | Catch-all API route handler for BetterAuth |
| `app/components/GoogleOneTap.tsx` | Auto-prompts unauthenticated users with Google One Tap |
| `app/components/AuthControls.tsx` | Sign in / Sign out UI + renders `<GoogleOneTap />` |
| `prisma/schema.prisma` | Database models (BetterAuth field naming) |
| `middleware.ts` | Domain canonicalization (passthrough, Vercel handles redirect) |

---

## Server Setup (`lib/auth.ts`)

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustedOrigins: buildTrustedOrigins(), // see below
  plugins: [
    oneTap({ clientId: process.env.GOOGLE_CLIENT_ID }),
    nextCookies(),
  ],
});
```

### Key points

- **`nextCookies()` plugin is required** for Next.js App Router. Without it, cookies are never set on the response and sessions silently fail.
- **`oneTap()` server plugin** handles Google ID token verification server-side. You do NOT need `google-auth-library` — BetterAuth does it internally.
- **`trustedOrigins`** must include every origin your app is served from (apex, www, Vercel preview URLs, localhost). If the origin isn't trusted, BetterAuth rejects the auth request silently.

---

## Client Setup (`lib/auth-client.ts`)

```ts
import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Only set baseURL if explicitly configured; otherwise BetterAuth
  // defaults to same-origin which is correct for most deployments.
  ...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? { baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL }
    : {}),
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
});
```

### `useSession()` compatibility hook

BetterAuth's native `useSession()` returns `{ data, isPending, error }`. If migrating from NextAuth, wrap it:

```ts
export function useSession() {
  const sessionState = authClient.useSession();
  return {
    data: sessionState.data,
    status: sessionState.isPending
      ? "loading"
      : sessionState.data
        ? "authenticated"
        : "unauthenticated",
  };
}
```

---

## Google One Tap + Social Sign-In Together

Both methods coexist in `AuthControls.tsx`:

```tsx
// One Tap auto-fires for unauthenticated users
<GoogleOneTap />

// Manual button uses social OAuth redirect
<button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/voices" })}>
  Sign in with Google
</button>
```

### How they interact

1. **One Tap** fires automatically via `authClient.oneTap()`. Google shows the prompt. If the user clicks "Continue as [Name]", the Google ID token is sent to `/api/auth/one-tap/callback` (handled by BetterAuth's `oneTap` server plugin). BetterAuth verifies the token, creates/updates the user and account, sets session cookies.

2. **Social sign-in** uses `authClient.signIn.social({ provider: "google" })`. This triggers a full OAuth redirect flow: browser → Google consent screen → `/api/auth/callback/google` → BetterAuth creates session → redirect to `callbackURL`.

3. Both flows create the **same user record** (matched by email). No duplicate accounts.

4. The `<GoogleOneTap>` component uses a `useRef` guard (`promptedRef`) to avoid re-prompting after a failed/dismissed tap.

---

## Prisma Schema — Critical Field Names

This is where migration from NextAuth breaks most often. BetterAuth expects **specific column names** that differ from NextAuth.

### Account model

```prisma
model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String    // NextAuth called this "providerAccountId"
  providerId            String    // NextAuth called this "provider"
  accessToken           String?   // NextAuth used "access_token" (snake_case)
  refreshToken          String?   // NextAuth used "refresh_token"
  idToken               String?   // NextAuth used "id_token"
  accessTokenExpiresAt  DateTime? // NextAuth used "expires_at" (Int)
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())  // Required by BetterAuth
  updatedAt             DateTime  @updatedAt        // Required by BetterAuth

  @@unique([providerId, accountId])  // NOT [provider, providerAccountId]
}
```

### Session model

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique    // NOT "sessionToken"
  expiresAt DateTime            // NOT "expires"
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Verification model

```prisma
model Verification {       // NOT "VerificationToken"
  id         String   @id @default(cuid())
  identifier String
  value      String   // NOT "token"
  expiresAt  DateTime // NOT "expires"
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
}
```

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `BETTER_AUTH_URL` | Server | Canonical origin for auth callbacks |
| `BETTER_AUTH_SECRET` | Server | Signs session tokens |
| `GOOGLE_CLIENT_ID` | Server | Google OAuth + One Tap verification |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth token exchange |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google One Tap browser SDK |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client | Optional explicit auth API base URL |

### Fallback chain (for NextAuth migration)

```
BETTER_AUTH_URL → NEXTAUTH_URL → "http://localhost:3000"
BETTER_AUTH_SECRET → NEXTAUTH_SECRET
```

---

## API Route Handler

```ts
// app/api/auth/[...auth]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

The folder **must** be `[...auth]`, not `[...nextauth]`. BetterAuth routes all its endpoints under `/api/auth/*`.

---

## Pitfalls — Everything We Hit

### 1. Schema field names (CRITICAL)

**Symptom:** One Tap prompt appears, user clicks "Continue", page reloads, still unauthenticated. Infinite loop.

**Cause:** BetterAuth silently fails when Prisma throws because `accountId`/`providerId` columns don't exist (NextAuth used `providerAccountId`/`provider`).

**Fix:** Use the exact BetterAuth field names listed above. If migrating from NextAuth, write raw SQL to rename columns and copy data before switching the schema.

### 2. Missing `nextCookies()` plugin

**Symptom:** Sign-in completes server-side (you can see the session in the database) but the browser never receives session cookies. Every request is unauthenticated.

**Cause:** Next.js App Router doesn't automatically forward `Set-Cookie` headers from API route responses. The `nextCookies()` plugin patches this.

**Fix:** Always include `nextCookies()` in the server plugins array.

### 3. Domain mismatch — apex vs www

**Symptom:** Sign-in works on one domain but not the other. Or: infinite redirect loop.

**Cause:** Vercel may redirect `tranquilityhub.co.ke` → `www.tranquilityhub.co.ke` (or vice versa). If `baseURL` points to the non-canonical domain, BetterAuth sets cookies for the wrong host.

**Fix:**
- Set `BETTER_AUTH_URL` to match Vercel's **canonical domain** (check which domain Vercel redirects TO).
- Add both apex and www variants to `trustedOrigins`.
- Don't add middleware that fights Vercel's own redirect configuration.

### 4. `baseURL` on client causing cross-origin cookie loss

**Symptom:** Auth API calls succeed (200 response) but session cookie doesn't stick.

**Cause:** If client `baseURL` is `https://www.example.com` but the page is served from `https://example.com`, the browser treats the cookie as third-party.

**Fix:** Don't set `baseURL` on the client unless necessary. BetterAuth defaults to same-origin, which is always correct.

### 5. Google One Tap origin not allowed

**Symptom:** Console error: `[GSI_LOGGER]: The given origin is not allowed for the given client ID`.

**Cause:** The browser's `window.location.origin` isn't in your Google Cloud Console's "Authorized JavaScript origins" list. Common when Next.js auto-increments the dev port (3001, 3002).

**Fix:**
- Pin the dev port: `"dev": "next dev -p 3000"`
- Add `http://localhost:3000` AND `http://127.0.0.1:3000` to authorized origins in GCP.
- For production, add both `https://example.com` and `https://www.example.com`.

### 6. Google redirect URI mismatch

**Symptom:** Social sign-in redirects to Google, then Google shows "redirect_uri_mismatch" error.

**Cause:** The callback URL BetterAuth generates doesn't match what's registered in GCP.

**Fix:** Add these to "Authorized redirect URIs" in GCP:
```
http://localhost:3000/api/auth/callback/google
https://www.tranquilityhub.co.ke/api/auth/callback/google
https://tranquilityhub.co.ke/api/auth/callback/google
```

### 7. Stale Prisma client on Vercel (build cache)

**Symptom:** Build fails with `Property 'article' does not exist on type 'PrismaClient'` even though the model exists in schema.prisma.

**Cause:** Vercel caches `node_modules` including the generated Prisma client. If you add new models, the cached client doesn't know about them.

**Fix:** Prepend `prisma generate` to your build script:
```json
"build": "prisma generate && next build"
```

### 8. `createdAt` / `updatedAt` missing on Account and Session

**Symptom:** Silent database insert failures. Sign-in appears to work but no session is created.

**Cause:** BetterAuth requires `createdAt` and `updatedAt` on Account, Session, and Verification tables. NextAuth didn't have these.

**Fix:** Add both fields with defaults:
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### 9. Prisma migration blocked by existing data

**Symptom:** `prisma migrate dev` refuses to run because adding a required column to a table with existing rows fails.

**Cause:** You can't add a `NOT NULL` column without a default to a table that already has data.

**Fix:** Write a manual SQL migration:
1. Add columns as nullable
2. Backfill data from old columns
3. Alter to `NOT NULL`
4. Drop old columns
5. Run via `npx prisma db execute --file migration.sql --schema prisma/schema.prisma`
6. Sync with `npx prisma db push`

### 10. One Tap auto-prompting after dismiss

**Symptom:** User dismisses One Tap, navigates to another page, One Tap appears again.

**Cause:** Each mount of `<GoogleOneTap>` re-calls `authClient.oneTap()`.

**Fix:** Use a `useRef` guard:
```tsx
const promptedRef = useRef(false);
useEffect(() => {
  if (status !== "unauthenticated" || promptedRef.current) return;
  promptedRef.current = true;
  void authClient.oneTap({ ... });
}, [status]);
```

Note: this only prevents re-prompts within the same page lifecycle. For cross-page persistence, Google's own cooldown applies (it stops showing One Tap for ~2 hours after dismissal).

---

## Server-Side Session Access

```ts
// In any server component, server action, or API route:
import { getServerSession } from "@/lib/auth";

const session = await getServerSession();
if (!session?.user) {
  // Not authenticated
}

// session.user.id, session.user.email, session.user.name, session.user.image
```

---

## Testing Auth in Integration Tests

Mock `getServerSession` from `@/lib/auth`:

```ts
const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}));

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return { ...actual, getServerSession: getServerSessionMock };
});

// In test:
getServerSessionMock.mockResolvedValue({
  user: { id: "test-id", email: "test@example.com", name: "Test" },
});
```

You do NOT need to mock `google-auth-library` anymore — BetterAuth's `oneTap` plugin handles token verification internally.

---

## Quick Checklist for New Deployments

- [ ] `BETTER_AUTH_URL` matches your canonical production domain
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` matches `GOOGLE_CLIENT_ID`
- [ ] GCP authorized origins include your production domain (apex + www)
- [ ] GCP redirect URIs include `https://yourdomain.com/api/auth/callback/google`
- [ ] Prisma schema uses BetterAuth field names (`accountId`, `providerId`, `token`, etc.)
- [ ] Build script includes `prisma generate` before `next build`
- [ ] `nextCookies()` plugin is in the server auth config
- [ ] API route is at `app/api/auth/[...auth]/route.ts` (not `[...nextauth]`)
