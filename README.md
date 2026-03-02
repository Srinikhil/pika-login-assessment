# Pika Login — Take-Home Assessment

A login experience inspired by [pika.me/login](https://pika.me/login), built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion. This project is for a take home assessment for Pika.art.
---

## How to Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/login`.

> **Note:** Use npm run dev for local development. If you previously ran npm run build and see errors like Cannot find module './XXX.js', delete the .next folder and restart the dev server: run `rm -rf .next` and restart `npm run dev`.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Clean routing, built-in middleware, good balance of client and server logic |
| Language | TypeScript | Safer state handling and clearer error modelling |
| Styling | Tailwind CSS + CSS custom properties | Fast iteration with consistent design tokens |
| Animations | Framer Motion | Smooth transitions and subtle interaction feedback |
| State | React Context + `useReducer` | Right scope for auth |
| Session | `localStorage` + cookie | localStorage for client persistence, cookie for middleware protection |

---

## Project Structure

```
src/
├── api/
│   └── auth.ts              # Mock API — all simulated network logic lives here
├── app/
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Redirects / → /login
│   ├── login/page.tsx        # Login screen (redirects to /app if already authed)
│   └── app/page.tsx          # Protected welcome screen
├── components/
│   ├── login/
│   │   ├── LoginScreen.tsx   # Orchestrator: animated headline + method picker
│   │   ├── PhoneFlow.tsx     # Phone → OTP two-step flow
│   │   ├── EmailFlow.tsx     # Email → OTP two-step flow
│   │   ├── GoogleButton.tsx  # Google mock login
│   │   └── DevHints.tsx      # Dev-only floating panel for error simulation
│   └── ui/
│       ├── Input.tsx         # Labeled input with inline validation
│       ├── Button.tsx        # Primary/ghost/icon variants with loading state
│       ├── OtpInput.tsx      # 6-digit OTP with paste, backspace, arrow nav
│       └── ErrorBanner.tsx   # Animated aria-live error region
├── context/
│   └── AuthContext.tsx       # Auth state, localStorage persistence, session restore
├── middleware.ts             # Next.js edge middleware for route protection
└── types/
    └── auth.ts               # All shared TypeScript types
```

---

## Error Cases & How to Reproduce

All errors are triggered by specific input values. The mock API lives in `src/api/auth.ts`.

A **DEV panel** is available - look for the pulsing `DEV` button fixed to the bottom-right corner of the login page. It shows all trigger values with one-click copy.

### Error trigger reference

| Error | Step | Trigger | Expected result |
|---|---|---|---|
| **401 - Invalid Code** | OTP | Enter OTP `000000` (any flow) | "Invalid verification code" shown inline |
| **403 - Email Not Verified** | Contact | Email: `unverified@test.com` | Send code succeeds → enter OTP `111111` → "Email not verified" |
| **500 - Server Error (email)** | Contact | Email: `error@test.com` | Error shown before OTP step |
| **500 - Server Error (phone)** | Contact | Phone: `0000000000` | Error shown before OTP step |
| **Network Timeout** | Contact | Email: `timeout@test.com` | Simulates ~5s timeout, returns timeout error |
| **Validation - empty field** | Contact | Submit without entering phone/email | Required field error shown inline |
| **Validation - bad email format** | Contact | Enter `notanemail` as email | Email format error shown inline |
| **Validation - short phone** | Contact | Enter fewer than 10 digits | "Enter a valid 10-digit phone number" shown inline |

### OTP reference

| OTP value | Result |
|---|---|
| `123456` | **Success** for any normal email/phone |
| `123456` with `unverified@test.com` | **403** - Email not verified (email check runs before success) |
| `111111` with `unverified@test.com` | **403** - Email not verified |
| `000000` | **401** - Invalid code (this check runs before all others) |
| Any other value | **401** - Invalid code |

> **Note on 403 ordering:** The 401 OTP check (`000000`) runs before the email identity check. So using `000000` with `unverified@test.com` will return 401, not 403. Use any other OTP (e.g. `111111`) to reach the 403 branch.

---

## Design Decisions

### Mock API as a real module boundary
`src/api/auth.ts` exports typed async functions that return `AuthResult<T>` - a discriminated union of `{ success: true, data }` or `{ success: false, error }`. This mirrors what a real API client would look like and makes error handling at the call site exhaustive and explicit with no need for `try/catch` at every usage site.

### CSS custom properties for design tokens
Instead of hardcoding colors throughout Tailwind utilities, all palette values are declared as CSS variables in `globals.css`. This decouples the theme from the utility layer and makes a future dark/light mode toggle a single `data-theme` attribute swap.

### React Context over Zustand
The auth state surface is narrow: one user object, one token, login, and logout. React Context with `useReducer` is the right tool here. Zustand would add a dependency and abstraction layer where none is needed.

### Dual-layer session persistence
On login, the session is written to both `localStorage` and a client-set cookie (`SameSite=Strict`, 24h `max-age`). `localStorage` is the primary store for client-side hydration on mount - the `AuthContext` reads it, checks `expiresAt`, and rehydrates state without a round-trip. The cookie exists solely so the Next.js edge middleware can read the session server-side and issue a redirect before the page renders, preventing the flash of an unauthenticated state on direct `/app` navigation. Both stores are cleared on logout.

### Framer Motion for step transitions
Each step in the Phone/Email flow animates in from the right and exits to the left - a standard "wizard step" affordance that communicates forward progression without disorienting the user. Entry animations on the welcome screen use staggered `opacity + y` transitions for a polished feel.

### OTP auto-submit on complete
When all 6 OTP digits are filled, verification fires automatically. This removes the need for an extra button press, matching the pattern used by most production OTP flows.

### OTP input state correctness
Each digit slot is derived with `Array.from({ length }, (_, i) => value[i] ?? "")` rather than `String.padEnd`. `"".padEnd(6, "")` returns `""` in JavaScript (cannot pad with an empty string), which would produce an empty `digits` array and silently break all typed input. Using `Array.from` ensures each slot always maps to the correct character regardless of value length.

### Accessibility
- All inputs have `id` + `label` associations
- Error states use `aria-invalid`, `aria-describedby`, and `role="alert"` / `aria-live="assertive"` for screen reader announcements
- OTP inputs have individual `aria-label="Digit N"` and a `role="group"` wrapper
- All interactive elements have visible `:focus-visible` rings
- Full keyboard navigation: Tab order is logical, Enter submits forms, Backspace/Arrow keys navigate OTP digits
