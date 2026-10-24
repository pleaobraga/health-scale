# HealthSchedule (`health-scale`) — Comprehensive AI Project Context

> **Purpose of this document**: Provide an AI coding assistant or engineer with complete architectural, domain, data-model, state-management, persistence, and coding-standard context for the **HealthSchedule** (`health-scale`) codebase.

---

## 1. Project Overview & Domain

**HealthSchedule** is an offline-first, bilingual (`pt-BR` / `en-US`) **Monthly Shift & On-Call Schedule Manager** built for healthcare teams, clinics, home-care caregivers, and emergency departments.

### Core Capabilities
1. **Interactive Monthly Schedule Calendar**:
   - View Mode (read-only) and Edit Mode (draft editing with unsaved-changes guard, commit on Save, or revert on Discard).
   - Multi-shift daily allocation (`dayShiftAssignments` mapping each date + shift to a person, plus `assignments` array per date).
   - Visual highlights on the calendar for a selected person's **reported availability** (amber highlight + `Disp.` / `Avail.` badge) or **scheduled working days** (emerald highlight + `Escalado` / `Scheduled` badge).
   - Special events per day (`CalendarEvent`) with time, description, linked registered `Address`, and responsible staff member.
   - Fullscreen & print-optimized panoramic view (`FullScreenCalendarModal`).
2. **Customizable Shifts & Daily Shift Configuration**:
   - Global shift registry (`ShiftDefinition`: code, name, start time, duration in hours, color, `enabledByDefault`).
   - Per-month daily shift configuration (`monthDailyShifts`: defines which shifts occur on which days `1..31` of a given month `YYYY-MM`).
3. **Staff Registry & Monthly Participation**:
   - Global staff registry (`persons`: `id`, `name`, `color`, `active`).
   - Referential integrity protection (`PersonService.canDeletePerson`): staff with historical schedule assignments cannot be permanently deleted and are soft-deactivated (`active: false`) instead.
   - Per-month linked participants (`monthParticipants`: `YYYY-MM -> personId[]`).
   - Per-month & per-shift availability (`MonthlyAvailability`: `availableDays`, `shiftAvailability`, and per-day `shiftRates`).
   - Removing a previously saved availability day in `MonthAvailabilityModal` displays a fixed warning banner and automatically unlinks the person from that day/shift on the calendar.
4. **Dynamic Rule Engine & Compliance Auditing**:
   - Configurable labor and scheduling rules (`ShiftRule`):
     - `MAX_SHIFTS_PER_PERIOD` (`DAY` | `WEEK` | `MONTH`)
     - `MAX_HOURS_PER_PERIOD` (`DAY` | `WEEK` | `MONTH`)
     - `MIN_REST_HOURS` (minimum rest window between shifts)
     - `CONSECUTIVE_DAYS_LIMIT` (maximum consecutive working days)
     - `MAX_PEOPLE_PER_SHIFT`
     - `DAILY_SHIFT_HOURS` (`EXACT` | `MAX` | `MIN` hours per day on `ALL` | `WEEKDAYS` | `WEEKENDS` | `SPECIFIC_DAYS`)
   - Real-time validation errors (`ERROR` / `WARNING`) displayed per day cell and in `ScheduleAuditModal`.
5. **Financial Calculation & Shift Rates**:
   - Per-person, per-shift, per-day rates (`shiftRates[shiftId][dayNumber] = rateInBRL`).
   - Monthly financial closing modal (`MonthPaymentsModal`) and dedicated financial sheet in Excel exports.
6. **Offline-First Storage, Multi-Profile Guest Mode & Firebase Cloud Sync**:
   - 100% functional offline via `StorageService` (`localStorage`) with dataset isolation per authenticated user (`scale_manager_user_data_v1_<uid>`) and per guest profile (`scale_manager_guest_data_v1_<guestId>`).
   - Dynamic demo seed loader (`guestSeedLoader.ts`) for new guest sessions.
   - Optional real-time / on-demand **Firebase Firestore** synchronization (`CloudSyncService`) for `admin` users, supporting automatic sync on store mutations, manual Force Push, and Cloud Pull across browsers (including unscheduled future months).
7. **Data Portability & Export**:
   - Multi-sheet Excel export (`.xlsx` via SheetJS) and Print / Save as PDF with localized filenames:
     - Portuguese: `escala-<month 1..12>-<year>.xlsx` (e.g., `escala-10-2026.xlsx`)
     - English: `schedule-<month 1..12>-<year>.xlsx` (e.g., `schedule-10-2026.xlsx`)
   - Full JSON Backup export, overwrite restore, and non-destructive merge restore (`BackupService`).

---

## 2. Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime & Package Manager** | Node.js `>= 24.22.0`, `pnpm >= 12.14.0` |
| **Framework & Language** | React 19, TypeScript 5.8 (strict mode), Vite 8 |
| **Styling & Icons** | Tailwind CSS 4 (`dark` class strategy), `lucide-react` |
| **State Management** | Zustand 5 (`useScheduleStore`) |
| **Routing** | React Router DOM 7 (`createHashRouter` for GitHub Pages compatibility) |
| **Backend / Cloud** | Firebase 13 (Firebase Auth + Cloud Firestore) |
| **Internationalization** | `i18next`, `react-i18next` (`pt-BR` default, `en-US` secondary) |
| **Date & Spreadsheet** | `date-fns` 4, `xlsx` (SheetJS) |
| **Testing & Quality** | Vitest 5, React Testing Library, JSDOM, ESLint 9 (Flat Config), Storybook 10 |

---

## 3. Directory Structure

```text
src/
├── components/
│   ├── auth/                  # Route guards (PrivateRoute, AdminRoute)
│   ├── calendar/              # CalendarGrid, CalendarHeader, DayCell, CandidatePicker, AuditValidationBar
│   ├── common/                # LanguageSelector, shared UI controls
│   ├── import/                # ImportView, ConfirmOverwriteModal (backup restore/merge & cloud pull)
│   ├── layout/                # MainLayout, Header (top bar, save/cloud buttons, user menu)
│   ├── modals/                # FullScreenCalendarModal, MonthShiftConfigModal, MonthPaymentsModal,
│   │                          # DayEventsModal, AddDayShiftModal, DayViolationsModal, ScheduleAuditModal,
│   │                          # UnsavedChangesModal
│   ├── navigation/            # HoverSidebar (left navigation rail)
│   ├── people-management/     # PeopleManagementView, PersonFormModal, ConfirmDeactivate/DeleteModal
│   ├── settings/              # SettingsView, ShiftsManagementView, RulesManagementView, ConfirmClearLocalDataModal
│   └── sidebar/               # Sidebar (Month panel: Daily Shifts, Month People, Validation Rules),
│                              # PersonCard, MonthAvailabilityModal, AddMonthParticipantsModal, AddMonthRulesModal
├── context/
│   ├── auth-context-base.ts   # AuthContext definition & types
│   └── auth-context.tsx       # AuthProvider (Firebase Auth, Firestore role lookup, Guest mode, dataset switching)
├── i18n/
│   └── index.ts               # i18next initialization & language persistence ('app_language')
├── locales/
│   ├── pt-BR/                 # JSON namespaces: common, auth, calendar, people, settings, import, address, users
│   └── en-US/                 # JSON namespaces: common, auth, calendar, people, settings, import, address, users
├── pages/
│   ├── address-management-view.tsx # Global Address CRUD
│   ├── login-page.tsx              # Firebase Login + Guest Profile Login
│   └── user-management-view.tsx    # Admin user role management (Firestore 'users' collection)
├── router/
│   └── router.tsx             # HashRouter routes and redirects
├── services/
│   ├── seed/                  # guestSeedLoader.ts (demo data generator)
│   ├── validation/            # rule-engine.ts (DEFAULT_SHIFTS, DEFAULT_RULES, rule evaluation logic)
│   ├── backup-service.ts      # JSON export, validation, overwrite restore, and merge restore
│   ├── cloud-sync-service.ts  # Firestore read/write service (schedules, people, addresses, shifts, rules)
│   ├── firebase.ts            # Firebase app, auth, and Firestore initialization
│   ├── person-service.ts      # Referential integrity checks for staff deletion
│   └── storage-service.ts     # LocalStorage wrapper + Guest/User dataset snapshot isolation
├── store/
│   └── use-schedule-store.ts  # Single source of truth Zustand store
├── types/
│   ├── index.ts               # Core domain types (Person, MonthlyAvailability, CalendarEvent, Address, etc.)
│   └── scheduleConfig.ts      # ShiftDefinition, ShiftRule, RuleViolation, MonthScheduleDocument
└── utils/
    ├── address-utils.ts       # Address formatting helpers
    ├── date-utils.ts          # Month navigation, calendar 42-day grid generation, past-event checks
    ├── export-to-excel.ts     # Multi-sheet XLSX workbook generator & localized filename builder
    ├── popover-position.ts    # Viewport-clamped fixed popover positioning utility (for React portals)
    ├── shift-rate-utils.ts    # Shift rate lookup & monthly payment calculations
    └── validate-schedule.ts   # Bridge between store state and rule-engine validation
```

---

## 4. Core Data Models & Store State (`useScheduleStore`)

All application state lives in `src/store/use-schedule-store.ts`:

### Primary Entities
- `persons: Person[]`
  - `{ id: string, name: string, color: string, active?: boolean }`
- `monthParticipants: Record<string, string[]>`
  - Maps `'YYYY-MM'` -> `personId[]` (staff linked to that specific month).
- `availabilities: MonthlyAvailability[]`
  - `{ personId: string, month: 'YYYY-MM', availableDays: number[], shiftAvailability?: Record<shiftId, number[]>, shiftRates?: Record<shiftId, Record<dayNum, number>> }`
- `assignments: Record<string, string[]>` & `savedAssignments: Record<string, string[]>`
  - Maps `'YYYY-MM-DD'` -> `personId[]` assigned on that date.
- `dayShiftAssignments: Record<string, Record<string, string>>` & `savedDayShiftAssignments`
  - Maps `'YYYY-MM-DD'` -> `{ [shiftId]: personId }`.
- `shiftDefinitions: ShiftDefinition[]`
  - `{ id, name, code, startTime: 'HH:mm', durationHours: number, color, enabledByDefault, createdAt, updatedAt }`
- `shiftRules: ShiftRule[]`
  - `{ id, name, description, type: RuleType, enabledByDefault, severity: 'ERROR' | 'WARNING', parameters: {...}, createdAt, updatedAt }`
- `monthDailyShifts: Record<string, Record<string, number[]>>`
  - Maps `'YYYY-MM'` -> `{ [shiftId]: dayNumbers[] }`. Defines which shifts are active on each day of a month.
  - **Important**: `getDayActiveShifts(dateStr)` returns `[]` if no daily shift is configured for that month in `monthDailyShifts[month]`.
- `monthActiveShifts: Record<string, string[]>` & `monthActiveRules: Record<string, string[]>`
  - Per-month active shift IDs and rule IDs.
- `events: CalendarEvent[]`
  - `{ id, date: 'YYYY-MM-DD', title, time?: 'HH:mm', description?, address?, addressId?, personId? }`
- `addresses: Address[]`
  - `{ id, name, street, number, complement?, neighborhood?, city? }`

### UI & Highlight State
- `currentMonth: string` (`'YYYY-MM'`, defaults to `getCurrentMonth()`)
- `isEditMode: boolean` & `hasUnsavedChanges: boolean`
- `highlightedPersonId: string | null` — Highlights a person's **available days** in yellow/amber on the calendar.
- `highlightedScheduledPersonId: string | null` — Highlights a person's **scheduled working days** in green/emerald on the calendar (mutually exclusive with `highlightedPersonId`).

---

## 5. Key Business Rules & Domain Invariants

1. **Availability Modification & Calendar Unlinking**:
   - When `setPersonAvailability(personId, month, availableDays, shiftAvailability, shiftRates)` is called, if the person was already assigned to any day or shift in `month` whose availability was removed, they are automatically removed from `assignments[dateStr]` and `dayShiftAssignments[dateStr]`.
   - In `MonthAvailabilityModal`, a fixed warning banner right below the modal header is displayed **only** if the user removes at least one previously saved availability day; if the user adds that day back before saving, the warning disappears.
2. **Address Update/Delete Cascade**:
   - Updating or deleting an `Address` cascades to **future** `CalendarEvent` records (`!isEventInPast(ev.date, ev.time)`), while **past** events preserve their historical address text untouched.
3. **Staff Deletion vs. Deactivation**:
   - `deletePerson(id)` checks `canDeletePerson(id)`. If the person has any assignments in `assignments`, deletion is blocked and the UI prompts to deactivate (`deactivatePerson(id)`) instead.
4. **Clear All Local Data**:
   - `clearAllLocalData()` in `useScheduleStore` and `StorageService.clearAllLocalData()` wipes **all** local data—including `persons`, `monthParticipants`, `availabilities`, `assignments`, `dayShiftAssignments`, `events`, `addresses`, `shiftDefinitions` (set to `[]`), `shiftRules` (set to `[]`), `monthActiveShifts`, `monthActiveRules`, and `monthDailyShifts`—as well as the active user/guest snapshot.
5. **Export & Print Filenames**:
   - `getScheduleFileBaseName(month, language)` in `src/utils/export-to-excel.ts` formats the filename as:
     - `escala-<1..12>-<YYYY>` when language is Portuguese (`pt*`)
     - `schedule-<1..12>-<YYYY>` when language is English (`en*`)
   - Used both for `.xlsx` downloads and for setting `document.title` during `window.print()`.

---

## 6. Cloud Synchronization Architecture (`CloudSyncService`)

Firestore documents are stored under the `schedules` collection:
- `schedules/_master_people` -> `{ persons: Person[], updatedAt }`
- `schedules/_master_addresses` -> `{ addresses: Address[], updatedAt }`
- `schedules/_master_shifts` -> `{ shifts: ShiftDefinition[], updatedAt }`
- `schedules/_master_rules` -> `{ rules: ShiftRule[], updatedAt }`
- `schedules/{YYYY-MM}` -> `{ month, assignments, monthParticipants, availabilities, events, dayShiftAssignments, monthDailyShifts, monthActiveShifts, monthActiveRules, updatedAt }`

### Sync Behavior
- **Toggle Control**: Controlled by `CloudSyncService.isSyncEnabled()` (`localStorage` key `scale_manager_cloud_sync_enabled`). Toggling it ON in `SettingsView` immediately triggers `forcePushCloudData`.
- **Automatic Sync on Edits**: When `CloudSyncService.isSyncEnabled()` is `true`, all store actions for people, addresses, shifts, rules, events, month participants, availabilities, and month daily shifts automatically sync to Firestore—even for future months that are not scheduled yet.
- **Multi-Month Push & Pull Fallback**:
  - `CloudSyncService.pushAllToCloud`, `saveSchedule`, and `forcePushCloudData` save `schedules/{month}` for all months present in `monthParticipants`, `availabilities`, `monthDailyShifts`, `monthActiveShifts`, `monthActiveRules`, `assignments`, `dayShiftAssignments`, `events`, as well as `currentMonth` and `getCurrentMonth()`.
  - `pullCloudData` fetches `targetMonth` first and falls back to `currentMonth` / `getCurrentMonth()` if the target unscheduled month document does not yet exist in Firestore.

---

## 7. Routing Structure (`src/router/router.tsx`)

Uses `createHashRouter` (`#/...`):
- `/login` — Public login & guest profile selection page.
- `/` — Protected by `PrivateRoute` -> redirects to `/calendario` (or `/configuracoes?tab=importar` on first onboarding when storage is empty).
  - `/calendario` — Main schedule view (`Sidebar` + `CalendarGrid`).
  - `/pessoas` — Global staff management (`PeopleManagementView`).
  - `/enderecos` — Global address registry (`AddressManagementView`).
  - `/configuracoes` — General settings, language, theme, cloud sync, local storage summary & clear, and Import tab (`?tab=importar`).
  - `/configuracoes/turnos` — Global shift definitions management (`ShiftsManagementView`).
  - `/configuracoes/regras` — Global validation rules management (`RulesManagementView`).
  - `/configuracoes/importar` — Redirects to `/configuracoes?tab=importar`.
  - `/usuarios` — Protected by `AdminRoute` (`UserManagementView`).

---

## 8. Coding Standards & UI Guidelines

1. **Zero Hardcoded UI Strings (Strict i18n)**:
   - ESLint enforces `i18next/no-literal-string` on JSX text and attributes (`title`, `placeholder`, `aria-label`, `alt`).
   - Every visible string in `.tsx` components must use `t('namespace:key')` and exist in both `src/locales/pt-BR/*.json` and `src/locales/en-US/*.json`.
2. **TypeScript Strictness**:
   - No implicit or explicit `any`. Run `pnpm lint` and `pnpm build` (`tsc -b && vite build`) to verify zero type or lint errors.
3. **Portal-Based Popovers & Menus**:
   - Floating menus/popovers inside scrollable or `overflow-hidden` containers (such as `CandidatePicker`, `PersonCard` shift balloon, `CalendarGrid` options menu, `Header` user menu, and `LanguageSelector`) must render via `createPortal(..., document.body)` with `position: fixed` and coordinates calculated via `computePopoverPosition` (`src/utils/popover-position.ts`) so they are never clipped by page or container boundaries.
4. **Dark Mode Parity**:
   - Every component must include `dark:*` Tailwind classes for backgrounds, borders, and text contrast, plus `print:*` overrides where applicable.

---

## 9. Useful Commands

```bash
pnpm dev          # Start Vite dev server
pnpm test:run     # Run all Vitest unit & integration tests once
pnpm lint         # Run ESLint validation (including i18n literal checks)
pnpm typecheck    # Run tsc --noEmit
pnpm build        # Run tsc -b && vite build
pnpm validate     # Run typecheck + lint + test:run
```

