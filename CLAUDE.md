# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JAC Conecta** - A React Native mobile app for "Juego, Aprendo y Crezco" preschool built with Expo. Supports both **Guardian** (parent) and **Staff** (teacher) roles with distinct features for classroom management, parent-teacher communication, and social sharing.

**Tech Stack:** React Native 0.81.4, Expo SDK ~54, TypeScript (strict), NativeWind v4, SWR for data fetching, Auth0 OAuth 2.0

## Development Commands

```bash
# Development
npm start              # Start Expo with tunnel
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run android:debug  # Debug on physical Android device
npm run ios:debug      # Debug on physical iOS device

# Building
npm run android:build  # Build Android AAB locally (EAS)
npm run android:assets # Prebuild Android assets

# Maintenance
npm run expo:update    # Check/update Expo dependencies
```

## High-Level Architecture

### Multi-Role System
The app serves two distinct user roles with different UI and features:
- **Guardian Role**: Parent dashboard with student attendance, messaging teachers, viewing photos/announcements
- **Staff Role**: Teacher dashboard with classroom management, student tracking, bulk attendance updates

Role detection happens via `roles` array in user profile. UI switches based on role using conditional rendering throughout the app.

### Navigation Pattern
Custom swipeable tab navigation (`navigation/bottomNav.tsx`) using `react-native-pager-view`:
- 5 tabs: Home, Social, Messaging, Announcements, Options
- Gesture-controlled page transitions
- Performance optimization: only renders current + adjacent screens
- Tab bar controlled via `TabContext` (hides when modals/viewers active)

### Data Flow & State Management

**Server State (SWR):**
- Global fetcher configured in `components/Layout.tsx`
- 60s deduplication interval
- Auto-revalidation on focus
- Endpoints: `/mobile/*` for most app data
- Auth token automatically injected via `services/api.ts` fetcher

**Client State (React Context):**
- `AuthContext`: Auth tokens, user profile, login/logout
- `AppContext`: Students, classrooms, attendance, selected date/student
- `ChatContext`: Guardian-teacher messaging
- `TeacherChatContext`: Teacher-side chat window
- `TabContext`: Tab navigation state, modal visibility

### Authentication Flow
Auth0 OAuth 2.0 with Password Grant:
1. Email entry → verification code sent
2. Code verification → token exchange
3. Tokens stored in Expo Secure Store (access, ID, refresh)
4. Auto-refresh on 401 responses
5. Logout clears secure store and unregisters push notifications

API calls in `services/api.ts` automatically:
- Inject access token
- Refresh token on 401
- Trigger logout callback on auth failure

### Student-Centric Data Model
- Guardians can have multiple students
- Selected student (`AppContext.selectedStudent`) drives data fetching
- Student-specific: attendance records, chat threads, daily status tracking
- Student name formatting via `helpers/students.ts`: `displayName()`, `displayShortName()`

## Key Features & Patterns

### Daily Student Tracking (Teachers)
Teachers track per student, per date:
- **Attendance**: present/absent/late with optional reason
- **Meal Status**: none/little/ok
- **Mood Status**: happy/tired/sad/sick
- **Bathroom**: poop/pee (yes/no)

Data model: `attendance_records` array with `status_type` and `status_value` fields. Status options loaded from `/mobile/attendance_status` endpoint.

### Messaging System (Dual Architecture)
Two separate chat implementations:
1. **Guardian → Teacher** (`ChatContext`): Parents message their student's teachers
2. **Teacher → Guardian** (`TeacherChatContext`): Teachers initiate/reply in dedicated chat window

Both support:
- Optimistic UI updates (message appears instantly, syncs in background)
- Message read status tracking
- Auto-scrolling to latest message

### Social/Blog Posts
Classroom-scoped blog posts with:
- Markdown content rendering (`@ronradtke/react-native-markdown-display`)
- Photo galleries (grid view + full-screen viewer with swipe)
- Teacher publishing capabilities
- Types: `announcement`, `activity`, `general`

### Notifications
Expo push notifications with:
- Permission-based opt-in flow
- Device registration with metadata (platform, brand, model)
- Preference tracking per user
- Auto-unregister on logout

## Important Conventions

### Language & Formatting
- **Spanish language** throughout (Venezuela-based school)
- Date formatting: Day.js with Spanish locale
- Student names: Always use `displayName()` or `displayShortName()` helpers (handles middle names, second last names)

### Component Organization
```
components/
├── blog/          # Post cards, photo grids, viewers
├── common/        # Shared UI (dialogs, buttons)
├── home/          # Dashboard cards (attendance, day info, communication)
├── messaging/     # Chat UI (message bubbles, input, chat cards)
├── teacher/       # Teacher-specific (classroom lists, status selectors)
└── ui/            # Base primitives (rarely modified)
```

### Styling
Theme system in `helpers/theme.ts`:
- **Colors**: Playful pink primary (#FF6B9D), warm orange secondary
- **Typography**: Nunito font, size tokens (sm: 14px → xl: 24px)
- **Spacing**: 8px base scale (xs: 4px → xl: 32px)
- **Border Radius**: 12-32px for rounded, friendly feel

Use theme tokens consistently: `theme.colors.primary`, `theme.spacing.md`, etc.

### TypeScript Patterns
- Strict mode enabled
- Define interfaces in `types/` directory
- Use `StudentData`, `ClassroomData`, `PostData`, etc. from types
- Proper null handling (use optional chaining: `student?.name`)

## Performance Considerations

### SWR Optimization
- Deduplication interval: 60s (avoid redundant fetches)
- Revalidate on focus (mobile users switch apps frequently)
- Conditional fetching: `const { data } = useSWR(condition ? endpoint : null)`

### Navigation Performance
Custom tab navigator only renders:
- Current screen
- Adjacent screens (left/right)
- Other screens unmounted until navigated to

### Optimistic Updates
Chat messages and attendance updates use optimistic UI:
```typescript
// Update local cache immediately
mutate(optimisticData, false)
// Then sync with server
await apiCall()
// Revalidate to ensure consistency
mutate()
```

## Environment & Configuration

**Environment Files:**
- `.env.development` - Local dev (ngrok or localhost)
- `.env.preview` - Preview builds
- `.env.production` - Production builds

**Critical Env Vars:**
- `EXPO_PUBLIC_AUTH0_*` - Auth0 config
- `EXPO_PUBLIC_API_BASE_URL` - API endpoint
- `EXPO_PUBLIC_STORAGE_URL` - Media CDN
- `EXPO_PUBLIC_SCHOOL_*` - School branding

**EAS Build:**
- Project: `dba14ca4-379c-4bb8-898f-e5c93de74067`
- Android: `com.leeliai.school_mobile_app`
- iOS: `com.leeliai.school-mobile-app`

## Common Development Tasks

### Adding a New Screen
1. Create component in `screens/`
2. Add route to navigation params in `types/navigation.ts`
3. Update tab navigator in `navigation/bottomNav.tsx` (if new tab)
4. Add SWR fetch if data-driven

### Adding Student Status Tracking
1. Add status type to backend
2. Update `types/students.ts` interfaces
3. Fetch options from `/mobile/attendance_status`
4. Add UI selector in teacher screens (see `StudentProfile.tsx`)

### Modifying Attendance Records
Attendance uses a single `attendance_records` array with different `status_type` values:
```typescript
{
  status_type: "attendance_status" | "meal_status" | "mood_status" | "poop_status" | "pee_status"
  status_value: string  // e.g., "attendance_status_present"
}
```

### Testing Auth Flow
1. Set up `.env.development` with Auth0 test credentials
2. Use ngrok to expose local API
3. Test email → code → token flow
4. Verify token refresh on 401
5. Check logout clears Expo Secure Store

## Security Notes
- Never commit `.env*` files (already gitignored)
- Tokens stored in Expo Secure Store (encrypted)
- All API calls require authentication via `services/api.ts` wrapper
- Push notification tokens are user-specific and cleared on logout
