# Google One Tap Auth Flow Fix (Better Auth)

This document captures the exact fix for:
- One Tap dismissal headaches
- fallback Google button failures
- One Tap modal loops
- `invalid_code` callback errors
- DB-related Better Auth callback 500s

## Symptoms We Fixed

1. After dismissing Google One Tap, clicking `Sign in with Google` could fail with 500.
2. One Tap could re-open repeatedly in a loop.
3. OAuth callback could return `error=invalid_code`.
4. Better Auth callback could fail with Prisma errors around `User.emailVerified`.

## Root Causes

1. UI race conditions:
- One Tap and manual Google sign-in could overlap.
- Overlapping flows can invalidate OAuth state/code and trigger `invalid_code`.

2. Data integrity issue:
- Some DB rows had `User.emailVerified = NULL` while runtime expected non-null boolean.

3. Post-migration DB connection plan cache:
- After type changes, stale prepared plans can throw:
- `cached plan must not change result type`.

## What We Changed

### 1) Clean manual fallback flow in AuthControls

File: `app/components/AuthControls.tsx`

- Manual button now always runs sign-out first, then Google sign-in.
- Added in-flight guard to prevent duplicate clicks.
- Kept button visible across screen sizes.

Key logic:

```tsx
const handleContinueWithGoogle = async () => {
  if (isSigningIn) return;

  setIsSigningIn(true);
  sessionStorage.setItem("oneTapSuppressed", "1");

  try {
    await authClient.signOut();
  } catch {
    // Continue even if sign-out fails
  }

  try {
    await authClient.signIn.social({ provider: "google", callbackURL: "/voices" });
  } finally {
    setIsSigningIn(false);
  }
};
```

### 2) One Tap guard rails in GoogleOneTap

File: `app/components/GoogleOneTap.tsx`

- Added `enabled` prop so parent can pause One Tap during manual flow.
- If disabled, actively cancel open One Tap prompt.
- Added session suppression key (`oneTapSuppressed`) to avoid retry loops after failures.
- On prompt dismissal/skips/errors, fallback immediately to button.

Key logic:

```tsx
if (!enabled) {
  window.google?.accounts.id.cancel?.();
  return;
}

if (sessionStorage.getItem("oneTapSuppressed") === "1") {
  dismissToFallback();
  return;
}
```

And on callback outcomes:

```tsx
fetchOptions: {
  onSuccess: () => {
    sessionStorage.removeItem("oneTapSuppressed");
    window.location.reload();
  },
  onError: () => {
    dismissToFallback(true);
  },
}
```

### 3) DB repair script for `emailVerified`

File: `scripts/fix-email-verified.js`

- Replaced no-op script with an idempotent SQL repair.
- Handles both old timestamp type and null booleans.
- Enforces:
- `DEFAULT false`
- `NOT NULL`

Run:

```bash
node scripts/fix-email-verified.js
```

Expected output:

```text
Fixed User.emailVerified: nulls normalized, default set to false, NOT NULL enforced.
```

## If You Still See Callback 500 After Type Fix

Restart app and DB connections to clear stale prepared plans:

1. Stop Next.js dev server.
2. Restart Postgres (or recycle active DB sessions/connections).
3. Start Next.js again.

This resolves:

```text
cached plan must not change result type
```

## Validation Checklist

1. Dismiss One Tap.
2. Confirm `Sign in with Google` button is visible (desktop + mobile).
3. Click button.
4. Ensure no `/api/auth/error?error=invalid_code` redirect.
5. Ensure `/api/auth/one-tap/callback` no longer returns 500.

## Files Involved

- `app/components/AuthControls.tsx`
- `app/components/GoogleOneTap.tsx`
- `scripts/fix-email-verified.js`

This setup gives a predictable auth flow:
- One Tap when available
- button fallback always available
- no overlapping auth flows
- safer behavior after One Tap errors/dismissals
