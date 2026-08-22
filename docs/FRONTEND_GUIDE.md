# GlobeTrotter Frontend — Architecture & Code Style Guide

> Single source of truth for frontend code on this project. Plain JavaScript (React + Vite), no
> TypeScript — same rule as the backend (`BACKEND_GUIDE.md` §2). `ref/FRONTEND_GUIDE.md` is a prior
> project's Next.js/TanStack/Context guide — useful for the *shape* of good ideas (feature
> folders, Zod-first types, service/hook layering, atomic component rules) but **not** followed
> literally: that project used Next.js App Router, TanStack Query, and React Context for auth.
> GlobeTrotter uses **Vite + React Router**, **Redux Toolkit (RTK Query)** for all state
> (server *and* UI), and no separate auth context — see §1.2 for why.

---

## 0. Where the design system comes from

`ui-design/` (a separate, already-built static prototype covering all 12 screens) is not thrown
away — it **is** the design system. `frontend/` reuses it directly:

- `ui-design/src/index.css` → the Tailwind v4 `@theme` tokens (colors, fonts, dark mode) — copied
  in as-is.
- `ui-design/src/components/{ui,icons,cards,charts}.jsx` → become `frontend/src/components/ui/`
  atoms. Same components, same props — `frontend/` just wires real data and real handlers into
  them instead of mock arrays and `onNavigate` callbacks.
- `ui-design/src/screens/*.jsx` → become the starting point for `frontend/src/pages/*.jsx`, one
  per route. Layout and visual structure carry over; what changes is *where the data comes from*
  (RTK Query hooks instead of `data/mock.js`) and *how navigation works* (React Router `<Link>`/
  `useNavigate()` instead of the `onNavigate(screenId)` prop used to fake routing in the
  no-router prototype).
- `motion` (already a dependency in `ui-design/`) carries over unchanged.

**Do not redesign while wiring.** If a screen's data shape forces a layout change (e.g. a field
the mock didn't have), make the smallest change that fits — don't use "building the real
frontend" as an excuse to restyle screens that are already signed off.

---

## 1. Core Principles (NON-NEGOTIABLE)

### 1.1 Architecture Flow

```
UI (pages/components)  →  RTK Query hooks  →  api slice  →  REST API
                        ↘  Redux slices (pure client UI state)
```

- **UI never calls `fetch`/`axios` directly** — always through a generated RTK Query hook.
- **RTK Query endpoints are the only place that know API URLs and response shapes.**
- **Zod schemas validate form input before submit, and can optionally validate API responses in
  `transformResponse`** — see §5.
- **Plain Redux slices hold only client-only UI state** (active tab, sidebar, a wizard step) —
  never a copy of server data. RTK Query's own cache is the "server state store"; don't duplicate
  a trip list into a slice just because it's convenient.

### 1.2 Why Redux Toolkit (RTK Query) instead of TanStack Query + Context

Three things the reference project split across three tools — TanStack Query (server data),
React Context (auth), Redux (UI state) — collapse to **one** here:

| State type | Tool | Why |
|---|---|---|
| Server data (trips, cities, activities, budget, admin stats) | **RTK Query** | Same caching/loading/error/invalidation model as TanStack Query, but it's a reducer in the same store — no second library, no second mental model |
| Current user / auth status | **RTK Query** (`useGetMeQuery()`) | The backend's auth is an **httpOnly cookie** (`BACKEND_GUIDE.md` §11, `backend-architecture.md` §4) — there is no token for the frontend to read, store, or refresh. "Am I logged in" is just "did `GET /api/users/me` succeed", which is exactly what a query hook already tracks (`isLoading`/`isError`/`data`). A separate `AuthProvider` context would just be re-implementing that. |
| Global UI state (sidebar, active modal, wizard step) | **Redux slice** | Genuinely client-only, no server round-trip |
| Local component state | `useState` | Input value, dropdown open |
| Form state + validation | **react-hook-form + Zod** | See §8 |

**Never put server data in a plain slice. Never introduce TanStack Query alongside RTK Query** —
picking both means two caches that can disagree; pick one, and it's RTK Query, because Redux was
already the answer for UI state.

---

## 2. Folder Structure

```
src/
├── main.jsx                       # createRoot + <Provider store> + <RouterProvider>
├── router.jsx                     # createBrowserRouter — the full route tree (see architecture doc §2)
├── app/
│   ├── store.js                   # configureStore — combines api.reducerPath + slice reducers
│   ├── hooks.js                   # useAppDispatch / useAppSelector — always import these, never bare react-redux hooks
│   └── api.js                     # the ONE createApi() base — credentials:'include', tagTypes, empty endpoints (injected per-feature)
│
├── components/
│   ├── ui/                        # Atoms — ported 1:1 from ui-design/src/components/{ui,icons,cards,charts}.jsx
│   └── layout/
│       ├── AppLayout.jsx          # TopBar + <Outlet/> — traveler-facing routes
│       ├── AdminLayout.jsx        # AdminTopBar + <Outlet/> — admin routes
│       └── AuthLayout.jsx         # AuthShell (the split panel) + <Outlet/> — login/register/reset
│
├── features/                      # one folder per backend module (mirrors backend-architecture.md §3)
│   ├── auth/
│   │   ├── authApi.js             # injectEndpoints: signup, login, logout, forgotPassword, resetPassword, getMe
│   │   └── schemas.js             # zod: loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema
│   ├── users/
│   │   ├── usersApi.js            # getMe (re-exported from auth), updateMe, uploadPhoto, deleteMe
│   │   └── schemas.js             # updateProfileSchema
│   ├── trips/
│   │   ├── tripsApi.js            # listTrips, getTrip, createTrip, updateTrip, deleteTrip
│   │   └── schemas.js             # createTripSchema, updateTripSchema
│   ├── itinerary/                 # stops + trip_activities
│   │   ├── itineraryApi.js        # addStop, updateStop, deleteStop, reorderStops, addActivity, updateActivity, removeActivity
│   │   └── schemas.js
│   ├── cities/
│   │   └── citiesApi.js           # searchCities
│   ├── activities/
│   │   └── activitiesApi.js       # listActivitiesForCity
│   ├── budget/
│   │   └── budgetApi.js           # getTripBudget
│   ├── publicShare/
│   │   └── publicShareApi.js      # getPublicTrip(shareToken) — see architecture doc's Known Gaps for the "list" endpoint this still needs
│   └── admin/
│       ├── adminApi.js            # getStats, listUsers, setUserRole
│       └── schemas.js
│
├── pages/                         # one file per route — composes feature components, no reusable UI lives here
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── LandingPage.jsx
│   ├── CreateTripPage.jsx
│   ├── BuildItineraryPage.jsx
│   ├── TripListingPage.jsx
│   ├── TripDetailPage.jsx         # itinerary + budget view (ui-design's ItineraryBudgetScreen)
│   ├── ProfilePage.jsx
│   ├── SearchPage.jsx             # city + activity search (ui-design's ActivitySearchScreen)
│   ├── CommunityPage.jsx
│   ├── CalendarPage.jsx
│   ├── PublicTripPage.jsx         # public, unauthenticated — /t/:shareToken
│   └── admin/
│       ├── AdminLoginPage.jsx
│       ├── AdminUsersPage.jsx
│       └── AdminStatsPage.jsx     # cities + activities + totals — one page, see architecture doc §3
│
├── routing/
│   ├── ProtectedRoute.jsx         # renders <Outlet/> if useGetMeQuery() succeeds, else <Navigate to="/login"/>
│   └── AdminRoute.jsx             # same, plus role === 'admin' check
│
├── lib/
│   └── utils.js                   # cn() — clsx + tailwind-merge, same as ref
│
└── index.css                      # Tailwind v4 tokens, copied from ui-design/
```

**Feature folder rule (same as `ref/`):** a feature's `schemas.js` and `*Api.js` are only imported
by that feature's pages/components, or by another feature that legitimately depends on it (e.g.
`itinerary` importing a type shape from `trips`). Never reach into another feature's internals to
avoid duplicating a schema — if two features need the same shape, it graduates to a shared
`lib/schemas.js`, mirroring how the backend promotes shared shapes to `models/`.

---

## 3. API Client — `app/api.js`

One `createApi()` call for the whole app. Every feature injects its endpoints into it — this is
RTK Query's built-in code-splitting, so "one api slice" doesn't mean "one giant file".

```javascript
// app/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:4000/api
        credentials: 'include', // sends the httpOnly access_token cookie — NEVER read/attach a token manually
    }),
    tagTypes: ['Me', 'Trip', 'Stop', 'Budget', 'AdminUser', 'AdminStats'],
    endpoints: () => ({}),
});
```

**Rules:**
- `credentials: 'include'` is the whole auth story on the frontend. There is no
  `Authorization: Bearer ...` header, no `localStorage.getItem('auth_token')` — the backend never
  puts a token in a JSON body to store (`backend-architecture.md` §4). Do not add token-reading
  code "to be safe" — it has nothing to read.
- Backend responses are always the `{ success, message, data, timestamp }` /
  `{ success: false, error: { code, message }, timestamp }` shape from `BACKEND_GUIDE.md` §5.
  Every injected endpoint uses `transformResponse: (res) => res.data` so hooks return the
  unwrapped payload, and relies on RTK Query's default error shape (`error.data.error.message`,
  `error.data.error.code`) for failures — never re-parse this per endpoint.
- One feature's endpoints, one file: `api.injectEndpoints({ endpoints: (build) => ({ ... }) })`.
  Never call `createApi()` a second time.

```javascript
// features/trips/tripsApi.js
import { api } from '../../app/api';

export const tripsApi = api.injectEndpoints({
    endpoints: (build) => ({
        listTrips: build.query({
            query: () => '/trips',
            transformResponse: (res) => res.data,
            providesTags: (result = []) => [
                ...result.map((t) => ({ type: 'Trip', id: t.id })),
                { type: 'Trip', id: 'LIST' },
            ],
        }),
        getTrip: build.query({
            query: (id) => `/trips/${id}`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, id) => [{ type: 'Trip', id }],
        }),
        createTrip: build.mutation({
            query: (body) => ({ url: '/trips', method: 'POST', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
        }),
        updateTrip: build.mutation({
            query: ({ id, ...body }) => ({ url: `/trips/${id}`, method: 'PUT', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { id }) => [{ type: 'Trip', id }],
        }),
        deleteTrip: build.mutation({
            query: (id) => ({ url: `/trips/${id}`, method: 'DELETE' }),
            invalidatesTags: (result, error, id) => [{ type: 'Trip', id }, { type: 'Trip', id: 'LIST' }],
        }),
    }),
});

export const {
    useListTripsQuery,
    useGetTripQuery,
    useCreateTripMutation,
    useUpdateTripMutation,
    useDeleteTripMutation,
} = tripsApi;
```

**Prefer `invalidatesTags`/`providesTags` over manual cache writes.** The reference guide's
`setQueryData` pattern (its §7.3) is a legitimate optimization, but it's premature for a
hackathon — tag invalidation is one line, correct by default, and only worth upgrading to manual
cache patches if a specific screen's refetch is visibly slow. Don't add that complexity
speculatively (`AGENT.md` §2).

---

## 4. Redux Store — `app/store.js`

```javascript
// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        ui: uiReducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
});
```

```javascript
// app/hooks.js
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
```

Plain JS, so there's no `TypedUseSelectorHook` generic to reach for — `useAppDispatch`/
`useAppSelector` still exist as the single import path so a future TS migration only touches this
one file.

**UI-only slice example** (a wizard step, a sidebar toggle — genuinely nothing the server needs
to know):

```javascript
// features/ui/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: { sidebarOpen: true },
    reducers: {
        toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    },
});

export const { toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
```

**Rule:** if you're tempted to write a slice that mirrors an API response shape (`tripsSlice`
holding a `trips` array), stop — that's `tripsApi.js`'s job. A slice only exists for state that
has no corresponding backend endpoint.

---

## 5. Zod — schemas live with the feature that owns them

Same placement rule as the reference guide (its §5.1): feature-specific schemas live in that
feature's `schemas.js`; a shape used by 2+ features moves to `lib/schemas.js`.

```javascript
// features/trips/schemas.js
import { z } from 'zod';

export const createTripSchema = z
    .object({
        name: z.string().min(1, 'Trip name is required'),
        start_date: z.string().min(1, 'Start date is required'),
        end_date: z.string().min(1, 'End date is required'),
        description: z.string().optional(),
    })
    .refine((data) => data.end_date >= data.start_date, {
        message: 'End date must be on or after the start date',
        path: ['end_date'],
    });
```

**This schema is deliberately a near-duplicate of the backend's `SCHEMA.CREATE_TRIP` in
`trip.route.js` (`BACKEND_GUIDE.md` §12).** That's not drift to "fix" — the frontend schema exists
for *instant* validation feedback before a network round-trip; the backend schema is the
*authoritative* check that runs regardless of what the client sends. Never skip the backend
validation because the frontend already checked — never skip the frontend one because "the
backend will catch it," or every invalid trip name means a full request round-trip just to find
out.

**Response validation is optional, not mandatory.** The reference guide Zod-parses every service
response (its §5.2/§6). Here, only do that where a response shape is complex enough that a silent
backend contract change would be hard to notice (e.g. the budget breakdown). For a simple
`{ id, name, start_date, ... }` trip row, trust `transformResponse` — parsing every list response
for a hackathon-scoped app is validation for its own sake, not a real risk being mitigated
(`AGENT.md` §2, "no error handling for impossible scenarios").

---

## 6. Forms — react-hook-form + Zod

```javascript
// pages/CreateTripPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { createTripSchema } from '../features/trips/schemas';
import { useCreateTripMutation } from '../features/trips/tripsApi';

export default function CreateTripPage() {
    const navigate = useNavigate();
    const [createTrip, { isLoading }] = useCreateTripMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createTripSchema),
        defaultValues: { name: '', start_date: '', end_date: '', description: '' },
    });

    const onSubmit = async (values) => {
        try {
            const trip = await createTrip(values).unwrap();
            navigate(`/trips/${trip.id}`);
        } catch (err) {
            // err.data.error.message is the backend's message (BACKEND_GUIDE.md §5) — surface it,
            // don't swallow it. A field-level mismatch (e.g. EMAIL_ALREADY_EXISTS on a different
            // form) should still show as a form-level error, not just console.error.
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Field label="Trip name" error={errors.name?.message}>
                <Input {...register('name')} />
            </Field>
            {/* ... */}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating…' : 'Continue to itinerary'}
            </Button>
        </form>
    );
}
```

**Rules:**
- `resolver: zodResolver(schema)` on every non-trivial form — never hand-roll `if (!name) setError(...)`
  chains. A one-field search box (`SearchToolbar`) doesn't need this; a form with 2+ validated
  fields does.
- Mutation hooks always called with `.unwrap()` inside a `try/catch` when the UI needs to react to
  failure (navigate on success, show an error on failure) — an un-unwrapped mutation promise never
  rejects, so `.unwrap()` is not optional here.
- `Field`/`Input`/`Button` are the atoms from `components/ui/` (ported from `ui-design/`,
  §0) — forms compose them, they don't redefine input styling inline.

---

## 7. Routing — React Router

`main.jsx` renders a single `<RouterProvider>` built from `createBrowserRouter` in `router.jsx`.
No file-based routing (that's a Next.js concept from the reference guide) — routes are declared
explicitly in one tree, grouped by layout.

```javascript
// router.jsx
import { createBrowserRouter } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './routing/ProtectedRoute';
import AdminRoute from './routing/AdminRoute';
// ...page imports

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/', element: <LandingPage /> },
                    { path: '/trips', element: <TripListingPage /> },
                    { path: '/trips/new', element: <CreateTripPage /> },
                    { path: '/trips/:tripId', element: <TripDetailPage /> },
                    { path: '/trips/:tripId/build', element: <BuildItineraryPage /> },
                    { path: '/profile', element: <ProfilePage /> },
                    { path: '/search', element: <SearchPage /> },
                    { path: '/community', element: <CommunityPage /> },
                    { path: '/calendar', element: <CalendarPage /> },
                ],
            },
        ],
    },
    { path: '/t/:shareToken', element: <PublicTripPage /> }, // public, no auth, no AppLayout chrome
    { path: '/admin/login', element: <AdminLoginPage /> },
    {
        element: <AdminRoute />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: '/admin/users', element: <AdminUsersPage /> },
                    { path: '/admin/stats', element: <AdminStatsPage /> },
                ],
            },
        ],
    },
]);
```

```javascript
// routing/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../features/auth/authApi';

export default function ProtectedRoute() {
    const { data: me, isLoading, isError } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (isError || !me) return <Navigate to="/login" replace />;
    return <Outlet />;
}
```

```javascript
// routing/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../features/auth/authApi';

export default function AdminRoute() {
    const { data: me, isLoading, isError } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (isError || !me || me.role !== 'admin') return <Navigate to="/admin/login" replace />;
    return <Outlet />;
}
```

**Rules:**
- `useGetMeQuery()` is called from both guards — RTK Query dedupes this into a single request no
  matter how many components call it, so there's no cost to calling it "again" in `AdminRoute`.
- Layouts render `<Outlet/>` for the matched child page — a layout is not a page and never
  imports a specific page component.
- `useNavigate()` / `<Link>` from `react-router` replace every `onNavigate(screenId)` prop from
  `ui-design/` — when porting a screen over, that prop disappears entirely in favor of real paths.

---

## 8. Styling Rules

Carried over unchanged from `ui-design/` — that project already established the system, this one
just keeps using it:

- Tailwind v4 with `@theme` tokens (`--color-bg`, `--color-ink`, `--color-coral`, etc.) — never a
  raw hex/oklch value inline except inside a decorative gradient (`cards.jsx`'s `gradients`
  object is the one deliberate exception, same as in `ui-design/`).
- Dark mode via the `[data-theme]` + `prefers-color-scheme` pattern already built in
  `ui-design/src/index.css` — copy it as-is, don't re-derive it.
- `cn()` (`clsx` + `tailwind-merge`) for conditional classes, same as the reference guide §10.4 —
  add this now even though `ui-design/` didn't need it (it had no prop-driven conditional
  variants beyond what template literals handled); real forms with error states will want it.

---

## 9. Loading & Error UI

```javascript
// components/ui/Loading.jsx
export function PageLoader() {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        </div>
    );
}
```

- Every query-driven page checks `isLoading` → `PageLoader` (or a skeleton matching that page's
  layout for anything above a single card), `isError` → an inline error state with the backend's
  `error.data.error.message`, then the happy path.
- Never render with `data` assumed present — RTK Query hooks return `undefined` until resolved,
  same discipline as the reference guide §12.3's "`?? []`" rule: default arrays/objects at the
  point of use (`const trips = data ?? []`), don't scatter `?.` everywhere downstream.

---

## 10. Decision Cheatsheet

| Question | Answer |
|---|---|
| Fetches or mutates data? | RTK Query hook (`features/*/​*Api.js`) |
| Pure client UI state (no server round-trip)? | Redux slice (`features/ui/uiSlice.js`) |
| Local component toggle/value? | `useState` |
| Am I logged in? | `useGetMeQuery()` — no token, no context, the cookie does the work |
| Types for API data or form input? | Zod schema (`features/*/schemas.js`) |
| Reusable, no domain meaning (Button, Input)? | `components/ui/` (ported from `ui-design/`) |
| One route's worth of composition? | `pages/*.jsx` |
| Shared chrome across a group of routes? | `components/layout/*Layout.jsx`, mounted via the router |

---

## 11. What NOT to Do

- **Don't add TanStack Query.** RTK Query already does this job (§1.2) — a second cache is a bug
  waiting to happen, not a feature.
- **Don't add a separate auth Context/Provider.** `useGetMeQuery()` already is the auth state.
- **Don't read/write `localStorage` for the token.** There is no token to store — it's an httpOnly
  cookie, invisible to JS by design (`backend-architecture.md` §4). `localStorage` is fine for
  genuinely client-only preferences (e.g. the dark-mode toggle, exactly as `ui-design/`'s
  `useTheme` hook already does it) — never for auth.
- **Don't write a plain `interface`-style shape for form/API data** — Zod schema +
  `.parse`/`zodResolver` is the only way types get defined here, same rule as the reference guide
  §12.1, just without the TS inference half.
- **Don't duplicate a slice for server data** that RTK Query already caches (§4's rule).
- **Don't restyle a `ui-design/` screen while wiring it up** — see §0.
