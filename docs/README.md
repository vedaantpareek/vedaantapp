# ConnectFBLA

**FBLA Mobile Application Development | Vedaant Pareek | Cherry Creek High School | District 12**

ConnectFBLA is the official FBLA member app built for the Colorado State Conference 2026 FBLA Mobile Application Development competition. It gives Cherry Creek High School FBLA members a single place to read chapter announcements, track events and deadlines, access competitive event resources, chat with fellow members, and manage their profile.

---

## Overview

ConnectFBLA has five core features, each accessible from a persistent bottom tab bar:

1. **Home (Feed)** — Scrollable announcement feed with 12 category types, color-coded badges, and a full article detail view. Content is dated to the April 3, 2026 conference for demo stability.

2. **Calendar** — Interactive calendar built with `react-native-calendars` showing dot markers per event type. Tapping any date reveals events. Event detail screens show type, location, description, and registration info.

3. **Resources** — Searchable and filterable library of study guides, practice tests, and competitive event tips. Each resource shows a file-type icon (PDF, DOC, PPT, video, link), supports bookmarking, and can be shared via the native OS share sheet.

4. **Connect (Chat)** — Full dual-mode chat system with group channels (e.g., `#general`, `#competition-prep`) and direct messages between any two members. Messages support image attachments, resource previews, emoji reactions, and three-state read receipts (sent, delivered, read).

5. **Profile** — Member profile showing competitive events, officer role, bio, and social media links. Fully editable. Social media buttons deep-link to the native app (with browser fallback) for all five platforms: Instagram, LinkedIn, YouTube, Twitter/X, and Facebook.

---

## Architecture

ConnectFBLA uses MVVM (Model-View-ViewModel), enforced at the folder level:

```
src/
├── data/          MODEL     — Pure data: JSON files and mock JS modules
├── stores/        VIEWMODEL — Zustand stores: state management and business logic
├── screens/       VIEW      — Screen components: reads from stores, calls actions
├── components/    VIEW      — Shared UI components: single-responsibility, reusable
├── navigation/              — Stack and tab navigators
├── theme/                   — Colors, typography, spacing, shadows (design tokens)
└── utils/                   — Validation, social links, constants, date utilities
```

**Model (`src/data/`):** Raw data with no UI dependencies. In a production app, this layer would be replaced by API calls.

**ViewModel (`src/stores/`):** Zustand stores own all state and business logic. `authStore.js` manages authentication state. `chatStore.js` manages chat and unread counts. Components subscribe to store slices and re-render only when their slice changes.

**View (`src/screens/` and `src/components/`):** Screen files contain zero business logic. They read from stores via hooks and delegate actions. The 11-component shared library (`src/components/`) is consumed across all screens.

---

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator, OR the Expo Go app on a physical device

### Steps

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd NEWFBLAAPP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device or simulator**
   - Press `i` to open in iOS Simulator
   - Press `a` to open in Android Emulator
   - Scan the QR code with the Expo Go app (iOS or Android) for a physical device

### Notes

- No `.env` file or API keys are required — all data is local mock data
- The app targets Expo SDK ~52 and React Native 0.76.7
- `babel.config.js` includes the `react-native-reanimated/plugin` as required by the Reanimated library

---

## Demo Account

The following credentials work out of the box with the mock user database:

| Field | Value |
|-------|-------|
| Email | `vedaant@cherrycreek.edu` |
| Password | `FBLADemo2026!` |
| Role | Member |
| Chapter | Cherry Creek High School, District 12 |

On the Login screen, tap the blue **"Demo Account"** box to auto-fill these credentials with a single tap.

Additional accounts are available in `src/data/mockUsers.js` for testing other roles (officer, advisor).

---

## Features

### Home Tab — News Feed
- Announcement feed with category-filtered posts
- 12 categories: Conference, Chapter News, National News, Event Tips, NLC, Resources, FBLA Week, Professional Dev, Leadership, Colorado, Spotlight, Reminder
- Color-coded `AppBadge` components per category
- Tap any post to open `AnnouncementDetailScreen` with full content
- All dates calculated relative to `APP_DATE` (April 3, 2026) for demo stability

### Calendar Tab
- `react-native-calendars` Calendar with multi-dot markers per date
- Event types with distinct colors: conference (gold), chapter (green), deadline (red), NLC (blue), personal (purple)
- `EventDetailScreen` with title, date/time, location, description, event type badge
- `APP_DATE` sets the calendar's initial month to April 2026

### Resources Tab
- Full-text search across resource titles and descriptions
- Category filter (filter by competitive event or resource type)
- File-type icon matrix: PDF (red), DOC (blue), PPT (orange), XLS (green), video (purple), link (blue)
- Bookmark toggle (persisted via AsyncStorage)
- Native share sheet via `expo-sharing` — share any resource to any app
- `ResourceDetailScreen` with full description and direct link/download support

### Connect Tab — Chat
- Unified inbox showing group channels and direct messages with unread counts
- Unread badge on the Connect tab icon (driven by `chatStore.totalUnread`)
- `GroupChannelScreen` — multi-author group chat with typing indicators
- `DirectMessageScreen` — 1:1 chat between members
- `NewMessageScreen` — search member list to start a new DM
- `MessageBubble` component supporting:
  - Text messages
  - Image attachments (via `expo-image-picker`)
  - Inline resource preview cards (shared from Resources tab)
  - Emoji reactions with count display (triggered by long-press)
  - Read receipts: sent (single check), delivered (double check, gray), read (double check, blue)

### Profile Tab
- Member profile: name, role badge (member/officer/advisor), grade, chapter, bio, competitive events list
- Social media links — five platforms, deep-link to native app with browser fallback
- `EditProfileScreen` — edit display name, bio (280-char limit with counter), social handles
  - Per-platform handle validation (Instagram, Twitter, LinkedIn, YouTube, Facebook)
- `SettingsScreen` — app preferences, logout

---

## Project Structure

```
NEWFBLAAPP/
├── App.js                         Entry point — NavigationContainer + stores
├── app.json                       Expo app config
├── babel.config.js                Babel config with Reanimated plugin
├── package.json                   Dependencies
├── ConnectFBLA_Design_Document.docx  Planning artifact
├── docs/
│   ├── README.md                  This file
│   ├── RUBRIC_COMPLIANCE.md       Criterion-by-criterion compliance evidence
│   ├── LIBRARIES.md               All dependencies with license and purpose
│   └── SOURCES.md                 Content and design sources
└── src/
    ├── components/                Shared component library (11 components)
    │   ├── AppButton.js           Primary button: 3 variants, animated press
    │   ├── AppCard.js             Card container: default and elevated variants
    │   ├── AppAvatar.js           Circular avatar: image or initials, online dot
    │   ├── AppBadge.js            Category chip: filled or outline, 12 colors
    │   ├── AppInputField.js       Text input: focus/error states, char counter
    │   ├── SectionHeader.js       Section title with optional "See All"
    │   ├── ResourceCard.js        Resource item: file icon, bookmark, share
    │   ├── MessageBubble.js       Chat bubble: attachments, reactions, receipts
    │   ├── EventDot.js            Calendar event dot marker
    │   ├── EmptyState.js          Empty list state with icon and action
    │   ├── LoadingState.js        Skeleton loading placeholder
    │   └── index.js               Barrel export
    ├── data/                      Mock data (Model layer)
    │   ├── mockUsers.js           6 user accounts (member, officer, advisor)
    │   ├── users.json             Extended user profile data
    │   ├── posts.json             Announcement feed content
    │   ├── events.json            Calendar events
    │   ├── resources.json         Study resources
    │   ├── channels.json          Chat channel definitions
    │   └── messages.json          Mock message history
    ├── navigation/                Navigation configuration
    │   ├── RootNavigator.js       Auth guard, top-level stack
    │   ├── TabNavigator.js        5-tab bottom navigator
    │   ├── FeedStack.js           Home tab stack
    │   ├── CalendarStack.js       Calendar tab stack
    │   ├── ResourceStack.js       Resources tab stack
    │   ├── ConnectStack.js        Connect tab stack
    │   └── ProfileStack.js        Profile tab stack
    ├── screens/                   Screen components (View layer)
    │   ├── Auth/
    │   │   ├── OnboardingScreen.js   Welcome screen with staggered animations
    │   │   └── LoginScreen.js        Two-layer validation login form
    │   ├── Feed/
    │   │   ├── NewsFeedScreen.js     Announcement list with category filter
    │   │   └── AnnouncementDetailScreen.js  Full article view
    │   ├── Calendar/
    │   │   ├── CalendarScreen.js     Calendar with dot markers
    │   │   └── EventDetailScreen.js  Event detail view
    │   ├── Resources/
    │   │   ├── ResourcesScreen.js    Searchable resource library
    │   │   └── ResourceDetailScreen.js  Resource detail with share
    │   ├── Connect/
    │   │   ├── ChatListScreen.js     Unified inbox
    │   │   ├── GroupChannelScreen.js Group chat
    │   │   ├── DirectMessageScreen.js  1:1 DM
    │   │   └── NewMessageScreen.js   Start new DM
    │   └── Profile/
    │       ├── ProfileScreen.js      Member profile view
    │       ├── EditProfileScreen.js  Edit profile form
    │       └── SettingsScreen.js     Settings and logout
    ├── stores/                    State management (ViewModel layer)
    │   ├── authStore.js           Authentication state: login, logout, session restore
    │   └── chatStore.js           Chat state: unread counts, channel management
    ├── theme/                     Design tokens
    │   ├── colors.js              8-token color system (primary, gold, semantic colors)
    │   ├── typography.js          11-role type scale
    │   ├── spacing.js             8pt spacing grid
    │   ├── shadows.js             Elevation shadow presets
    │   └── index.js               Barrel export
    └── utils/                     Utility modules
        ├── constants.js           APP_DATE, SCREENS enum, VALIDATION, SOCIAL_LINKS
        ├── validation.js          7 syntactic + 4 semantic validators
        ├── socialLinks.js         5-platform deep links with fallback
        └── dateUtils.js           Date formatting utilities relative to APP_DATE
```

---

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| React Native | 0.76.7 (via Expo) | Core mobile framework — cross-platform iOS/Android UI |
| Expo SDK | ~52.0.36 | Development platform, native module access, build toolchain |
| React Navigation | ^6.x | Screen navigation — native stack and bottom tabs |
| Zustand | ^4.5.5 | Lightweight state management — ViewModel layer |
| AsyncStorage | 2.1.0 | Local data persistence — auth session, bookmarks |
| react-native-calendars | ^1.1305.0 | Interactive calendar with multi-dot event markers |
| @expo/vector-icons | ^14.0.4 | Ionicons — consistent icon system throughout |
| expo-image-picker | ~16.0.6 | Native image library access for chat attachments |
| expo-sharing | ~13.0.1 | Native OS share sheet for resources |
| expo-haptics | ~14.0.1 | Tactile feedback on buttons and interactions |
| react-native-reanimated | ~3.16.7 | High-performance animations — onboarding, transitions |
| prop-types | ^15.8.1 | Runtime type checking for all shared components |
| expo-file-system | ~18.0.9 | File access for resource downloads |
| expo-linking | ~7.0.5 | URL/deep-link handling for social media integration |

---

## Competition Information

| Field | Details |
|-------|---------|
| Event | FBLA Mobile Application Development |
| Conference | Colorado State Conference 2026 |
| Date | April 3, 2026 |
| Location | Colorado |
| Competitor | Vedaant Pareek |
| School | Cherry Creek High School |
| Chapter | District 12 |
| Demo Account | vedaant@cherrycreek.edu / FBLADemo2026! |

The FBLA Mobile Application Development event requires competitors to design and develop a mobile application that addresses a business or organizational need. ConnectFBLA addresses the need for a centralized communication and resource platform for FBLA chapter members.

For a full breakdown of how ConnectFBLA meets each rubric criterion, see `docs/RUBRIC_COMPLIANCE.md`.
