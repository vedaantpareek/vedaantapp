# ConnectFBLA — Libraries and Dependencies

**Competitor:** Vedaant Pareek | Cherry Creek High School | District 12
**Event:** FBLA Mobile Application Development | Colorado State Conference 2026

All libraries used in ConnectFBLA are listed below with their version, license, and justification for inclusion. All libraries are MIT licensed and free to use for educational purposes.

---

## Core Framework

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| react | 18.3.1 | MIT | Core React library — component model, hooks, state |
| react-native | 0.76.7 (via Expo) | MIT | Cross-platform mobile framework — renders native iOS and Android UI from a single JavaScript codebase |
| expo | ~52.0.36 | MIT | Development platform and toolchain — provides Expo SDK, Metro bundler, and streamlined access to native device APIs without writing native code |

---

## Navigation

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| @react-navigation/native | ^6.1.18 | MIT | Navigation container and core navigation primitives — the foundational layer for all navigation in the app |
| @react-navigation/bottom-tabs | ^6.6.1 | MIT | Bottom tab bar navigator — powers the 5-tab main navigation (Home, Calendar, Resources, Connect, Profile) |
| @react-navigation/native-stack | ^6.11.0 | MIT | Native stack navigator — pushes detail screens (EventDetail, AnnouncementDetail, ResourceDetail, etc.) onto each tab's stack |
| @react-navigation/stack | ^6.4.1 | MIT | JavaScript-based stack navigator — used for screens requiring custom transition animations |
| react-native-screens | ~4.4.0 | MIT | Required peer dependency for React Navigation — uses native screen components for improved performance |
| react-native-safe-area-context | 4.12.0 | MIT | Required peer dependency for React Navigation — provides SafeAreaView and insets for notch/island-aware layouts |
| react-native-gesture-handler | ~2.20.2 | MIT | Required peer dependency for React Navigation — enables swipe-back gestures and native touch handling |

---

## State Management

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| zustand | ^4.5.5 | MIT | Lightweight state management — powers the ViewModel layer of the MVVM architecture. `authStore.js` manages authentication state; `chatStore.js` manages chat and unread counts. Chosen over Redux for minimal boilerplate while maintaining a clean separation of concerns. |

---

## Data Persistence

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| @react-native-async-storage/async-storage | 2.1.0 | MIT | Asynchronous key-value storage — persists auth session across app restarts so users do not need to log in every time they open the app. Also used for bookmark persistence in the Resources tab. |

---

## UI and Calendar

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| react-native-calendars | ^1.1305.0 | MIT | Feature-rich calendar component for React Native — provides the interactive calendar in the Calendar tab with multi-dot event markers per date, custom theme support (primary color, gold accents), and month navigation. |
| @expo/vector-icons | ^14.0.4 | MIT | Icon library bundled with Expo — provides the Ionicons icon set used throughout the app for tab icons, action buttons, file type icons, read receipts, and decorative UI elements. Ionicons was chosen for its consistent filled/outline paired naming convention (e.g., `home` / `home-outline`). |

---

## Animations

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| react-native-reanimated | ~3.16.7 | MIT | High-performance animations using the native thread — powers the staggered entry animation on `OnboardingScreen.js` (9 elements animated in sequence using `withDelay`, `withTiming`, and `Easing.out(Easing.cubic)`). Uses the native driver for 60fps rendering on both iOS and Android. Requires the `react-native-reanimated/plugin` in `babel.config.js`. |

---

## Native Device APIs (Expo SDK)

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| expo-image-picker | ~16.0.6 | MIT | Native image library and camera access — allows members to select photos from their device gallery to attach to chat messages in `GroupChannelScreen` and `DirectMessageScreen`. |
| expo-sharing | ~13.0.1 | MIT | Native OS share sheet — invoked from `ResourceCard.js` (share button) and `ResourceDetailScreen` to share study resources to any app installed on the device (Messages, Mail, AirDrop, etc.). |
| expo-haptics | ~14.0.1 | MIT | Tactile haptic feedback — provides physical button press feedback on key interactions (primary buttons, bookmark toggle, emoji reaction selection) to elevate the perceived quality of the app on physical devices. |
| expo-file-system | ~18.0.9 | MIT | File system access — supports downloading resource files to the device for offline access from `ResourceDetailScreen`. |
| expo-linking | ~7.0.5 | MIT | URL and deep-link handling — used by `socialLinks.js` to open native app deep links (e.g., `instagram://user?username=fbla_colorado`) and fall back to browser URLs when the native app is not installed. Also used for any external URL opening throughout the app. |
| expo-status-bar | ~2.0.1 | MIT | Status bar control — manages the iOS/Android status bar appearance (light content on dark backgrounds). |

---

## Type Checking

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| prop-types | ^15.8.1 | MIT | Runtime type checking for React component props — all 11 shared components in `src/components/` declare `propTypes` and `defaultProps`. Provides developer-facing warnings when incorrect prop types are passed, serving as living API documentation for each component. |

---

## Development Dependencies

| Library | Version | License | Purpose |
|---------|---------|---------|---------|
| @babel/core | ^7.25.2 | MIT | JavaScript transpiler — required by Metro bundler (Expo's JavaScript bundler) to transform modern JavaScript and JSX syntax for the React Native runtime. |

---

## License Summary

All 20+ libraries listed in this document are released under the **MIT License**.

The MIT License permits:
- Free use for personal, educational, and commercial purposes
- Modification and distribution
- No requirement to release modifications as open source

ConnectFBLA is used for educational purposes as an FBLA competition entry. No proprietary or restrictively licensed libraries are used.

---

## Dependency Tree Notes

Several libraries listed above (`react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`) are peer dependencies required by React Navigation and are not directly imported in app code. They are listed here for completeness and transparency.

`expo` itself bundles a large number of sub-packages. The Expo SDK sub-packages used directly by ConnectFBLA are: `expo-image-picker`, `expo-sharing`, `expo-haptics`, `expo-file-system`, `expo-linking`, and `expo-status-bar`.

---

*Last updated: April 3, 2026 | ConnectFBLA v1.0.0*
