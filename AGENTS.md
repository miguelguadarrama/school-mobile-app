# AGENTS.md

This file provides guidance to Claude/Codex and other AI agents when working with code in this repository.

## Overview

"JAC Conecta" is an Expo / React Native app for a school (Juego, Aprendo y Crezco) that connects guardians, teaching staff, and admins. UI strings are in Spanish. A single user account can hold multiple roles (`admin`, `guardian`, `staff`); the active role changes which screens and data are shown.

## Commands

```bash
npm start                 # expo start --tunnel (Metro dev server)
npm run ios               # build & run on the "iPhone 17 Pro" simulator/device
npm run android           # expo run:android
npm run android:debug     # expo run:android --device
npm run web               # expo start --web
npm run expo:update       # npx expo install --check (align deps to the Expo SDK)
npm run android:assets    # prebuild Android native project (clean)
npm run android:build     # eas build -p android --profile production --local
```

There is **no test runner, linter, or formatter configured**. Formatting is enforced by VS Code on save (`editor.formatOnSave`, `source.organizeImports`) using tabs. TypeScript runs in `strict` mode (`tsconfig.json` extends `expo/tsconfig.base`); use `npx tsc --noEmit` to type-check.

## Configuration & Environment

- Runtime config comes from `EXPO_PUBLIC_*` env vars, read directly via `process.env.EXPO_PUBLIC_*`. There is no `.env` checked in; the canonical values live in `eas.json` under the `preview` / `production` build profiles. Key vars: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_AUTH0_*`, `EXPO_PUBLIC_STORAGE_URL`, `EXPO_PUBLIC_FEATURE_FLAGS`.
- `types/env.d.ts` declares a `@env` module — legacy/unused; prefer `process.env.EXPO_PUBLIC_*`.
- `patches/react-native-compressor+1.13.0.patch` is applied to a dependency — don't expect upstream behavior there.
- `app.json` enables the New Architecture (`newArchEnabled: true`). Native dirs `android/` and `ios/` are committed (prebuild output).

## Architecture

### Provider/container chain

The app boots through a fixed nesting (see `App.tsx` → `components/Layout.tsx`):

```
SafeAreaProvider → AuthProvider → AppLayout
  SWRConfig (global fetcher, 60s dedupe, revalidateOnFocus)
    AuthContainer  → renders login stack when logged out, children when logged in
      AppContainer → fetches /mobile/profile, provides AppContext, wraps ChatProvider
        NavigationContainer → BottomTabNavigator (wraps TeacherChatProvider)
```

- **`AuthProvider`** (`contexts/AuthContext.tsx`): owns `loggedIn`/`user`/`loading`. Registers an auth-failure callback into the API layer so a failed token refresh forces logout.
- **`AppContainer`** (`components/AppContainer.tsx`): the data hub. One SWR call to `/mobile/profile` returns `user`, `students`, `attendance`, `roles`, and `classrooms`, which populate `AppContext`. Also derives `academic_year`/`academic_year_id`, resolves the active role from SecureStore, and sets up notification channels/listeners.
- **`AppContext`** (`contexts/AppContext.tsx`): app-wide state — students, selectedStudent, attendance, roles, selectedRole, classrooms, selectedDate, user. Read it via `useContext(AppContext)`.

### Auth (Auth0 + SecureStore)

- `services/auth.ts` does Auth0 Resource-Owner-Password-Grant login and refresh; tokens (`access_token`, `id_token`, `refresh_token`, `expires_at`) are stored in `expo-secure-store`.
- `services/api.ts` exposes `fetcher(endpoint, options)` — the global SWR fetcher. It attaches the bearer token, and on a `401` transparently refreshes the token and retries once; if refresh fails it invokes the registered auth-failure callback (→ logout). All data fetching goes through SWR keyed by API path string.

### Navigation (custom, not stack-based tabs)

`navigation/bottomNav.tsx` is the heart of in-app navigation and is intentionally unconventional:

- Tabs are rendered as a horizontal **`PagerView`** (swipeable) with a **custom tab bar**, not React Navigation's tab bar (the default tab bar is hidden).
- There are three tab sets — `tabScreens` (guardian), `teacherTabScreens` (staff), `adminTabScreens` — selected by `effectiveRole`. Tab order is fixed: Anuncios, Social, Inicio (index 2 = home/default), Mensajería (index 3), Opciones.
- `RoleAwareTabContent` shows `RoleSelector` first when a user has multiple roles and none is chosen.
- **`TabContext`** carries `currentIndex`, `navigateToTab`, the `pagerRef`, and a set of `is...Active` flags for full-screen overlays (PhotoViewer, ChatWindow, StudentProfile, modals). When any overlay is active, swiping/tab-press/the tab bar are disabled and the Android hardware back button is intercepted. **When adding a new full-screen modal/overlay, add a matching `is...Active` flag to `TabContext` and include it in these guards**, or navigation will misbehave.
- Notification deep-linking uses a global escape hatch: `window.__tabNavigationCallback` (set in `bottomNav.tsx`, called from `AppContainer`) to jump tabs bypassing the overlay guards.

### Chat — two separate systems

Chat is split by role and **must not be merged**:

- **`ChatContext`** (`contexts/ChatContext.tsx`, provided in `AppContainer`): guardian-side chat, scoped to `selectedStudent`. Handles optimistic message insert/remove and attachment upload via `helpers/fileCompression.ts` (`uploadFileToSas`).
- **`TeacherChatContext`** (`contexts/TeacherChatContext.tsx`, provided inside `BottomTabNavigator`): staff/admin-side chat with its own `isChatWindowOpen` state.
  Both expose `isChatWindowOpen`, which the navigation layer reads to hide the tab bar / disable swiping.

### Notifications

`services/notifications.ts` handles Expo push registration (`registerPushToken`/`unregisterPushToken`), Android notification channels (`NotificationChannels`), and tap handling. A tap produces a `NotificationData` ({ type, targetRole, studentId }); `AppContainer` switches role/student and then deep-links to the Mensajería tab.

### Screens & components

- `screens/` holds top-level screens, grouped by area: `login/` (the logged-out Auth0 flow stack in `AuthContainer`), `teacher/`, `admin/`, `social/` (Grid/Stack/Viewer photo feed).
- `components/` holds shared UI, grouped by feature (`messaging/`, `home/`, `blog/`, `teacher/`, `ui/`, `common/`).
- `helpers/` holds pure utilities: `students.ts` / `staff.ts` build display names and photo URIs from `EXPO_PUBLIC_STORAGE_URL` (Azure Blob); `theme.ts` exports the `theme` object (colors/spacing/shadow) used by StyleSheet code; `date.ts` + `lib/dayjs.ts` for dates; `fileCompression.ts` for image compression + SAS upload.
- `types/` holds the shared domain types (`student`, `chats`/`chat_message`, `post`, `teacher`/`ClassroomData`, `SessionUser`).

### Styling

Two styling systems coexist: **NativeWind** (Tailwind classes via `className`, configured in `tailwind.config.js` + `global.css` + `babel.config.js`) and **StyleSheet** objects driven by `helpers/theme.ts`. Match whichever the surrounding file already uses. Fonts are Nunito (`Nunito_400Regular`, `Nunito_700Bold`) loaded in `App.tsx`.

## Conventions

- Indentation is **tabs**. Imports are auto-organized on save.
- Guard verbose/debug logging behind `if (__DEV__) { ... }` (existing pattern throughout services).
- New API data should be fetched with `useSWR("/path")` relying on the global fetcher rather than calling `fetch` directly.
