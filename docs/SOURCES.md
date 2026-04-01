# ConnectFBLA — Content Sources and Attribution

**Competitor:** Vedaant Pareek | Cherry Creek High School | District 12
**Event:** FBLA Mobile Application Development | Colorado State Conference 2026

This document lists all external sources, references, and inspirations used in the development of ConnectFBLA. All content created for this app is either original work or properly attributed below.

---

## FBLA Content

| Source | URL | Used For |
|--------|-----|----------|
| FBLA-PBL Official Website | https://www.fbla.org | Organization information, competition event descriptions, FBLA mission and values referenced in app content |
| Colorado FBLA | https://www.coloradofbla.org | State conference details, Colorado chapter information, District 12 context |
| FBLA Mobile Application Development Competition Guidelines | Available via fbla.org | Competition requirements, rubric criteria, feature requirements |
| FBLA Model of Excellence | Available via fbla.org | Resource content descriptions and study guide topics referenced in `src/data/resources.json` |
| FBLA Colorado State Conference 2026 Schedule | coloradofbla.org | Basis for event dates in `src/data/events.json` (conference date: April 3, 2026; other events approximated based on typical Colorado State Conference schedule) |

---

## Design Inspiration and References

| Source | URL | Used For |
|--------|-----|----------|
| Apple Human Interface Guidelines (HIG) | https://developer.apple.com/design/human-interface-guidelines/ | iOS design principles — minimum touch target size (44pt, reflected in `SPACING.touchTarget = 44` in `spacing.js`), safe area handling, keyboard avoidance patterns |
| Material Design 3 | https://m3.material.io/ | Card component patterns, elevation and shadow system, spacing grid principles |
| Figma Community | https://www.figma.com/community | Color palette exploration — the primary blue (#1B3A6B) and gold (#C9A84C) were finalized based on FBLA's brand colors after review of design community resources |
| WCAG 2.1 Accessibility Guidelines | https://www.w3.org/TR/WCAG21/ | Color contrast ratios — all text/background color pairs in `src/theme/colors.js` were checked against WCAG 2.1 AA contrast requirements (minimum 4.5:1 for normal text) |

---

## Technical Documentation

| Source | URL | Used For |
|--------|-----|----------|
| React Native Documentation | https://reactnative.dev/docs/ | Component APIs (View, Text, ScrollView, FlatList, TouchableOpacity, Animated, StyleSheet, Linking, Share, Platform, KeyboardAvoidingView) |
| Expo Documentation | https://docs.expo.dev/ | Expo SDK APIs — expo-image-picker, expo-sharing, expo-haptics, expo-file-system, expo-linking usage patterns |
| React Navigation Documentation | https://reactnavigation.org/docs/ | Navigation patterns — native stack, bottom tabs, nested navigators, auth flow pattern (RootNavigator auth guard) |
| Zustand Documentation | https://docs.pmnd.rs/zustand/ | State management patterns — store creation, selector subscriptions, middleware |
| react-native-reanimated Documentation | https://docs.swmansion.com/react-native-reanimated/ | Animation APIs — `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withDelay`, `Easing` |
| react-native-calendars Documentation | https://github.com/wix/react-native-calendars | Calendar component props — `markedDates`, `dots`, `theme`, `onDayPress` |
| AsyncStorage Documentation | https://react-native-async-storage.github.io/async-storage/ | Key-value storage API — `getItem`, `setItem`, `removeItem` patterns |
| RFC 5322 (Email Syntax Standard) | https://www.rfc-editor.org/rfc/rfc5322 | Basis for the email validation regex in `src/utils/validation.js` |

---

## Images and Icons

| Asset | Source | License | Used For |
|-------|--------|---------|---------|
| Ionicons icon set | @expo/vector-icons (bundled with Expo) | MIT | All icons throughout the app — tab icons, action buttons, file type icons, logo icon (`people-circle`), read receipt indicators, social media icons |
| User avatars | Generated programmatically from user initials | Original | All user avatars in the app are generated from the first and last initial of the user's name with a deterministically chosen background color. No external avatar images are used. |
| App icon | Original design by Vedaant Pareek | Original | The ConnectFBLA app icon uses the `people-circle` Ionicons icon with the primary blue (#1B3A6B) and gold (#C9A84C) brand colors |
| Background images | None | N/A | ConnectFBLA uses no background images — all backgrounds are solid colors from the theme system |

---

## Mock Data

All mock data in `src/data/` is fictional and created solely for demonstration purposes:

- **User accounts** (`mockUsers.js`, `users.json`) — All names (Vedaant Pareek, Priya Sharma, Marcus Johnson, Sophie Chen, Jordan Williams, Ms. Rivera), email addresses, bios, and profile data are fictional and created for the demo. Vedaant Pareek is the competitor's actual name.

- **Announcements** (`posts.json`) — All announcement content is original, written to demonstrate realistic FBLA chapter communication. References to FBLA events and competitions are based on publicly available FBLA information.

- **Calendar events** (`events.json`) — Event dates are approximated based on the general structure of Colorado State Conference schedules. The April 3, 2026 conference date reflects the actual competition date. Other dates (chapter meetings, deadlines) are fictional.

- **Resources** (`resources.json`) — Resource titles and descriptions are inspired by actual FBLA competitive event categories and study materials. No copyrighted FBLA materials are reproduced — descriptions are original summaries.

- **Chat messages** (`messages.json`) — All message content is fictional, written to demonstrate the chat feature. No real communications are reproduced.

- **Channels** (`channels.json`) — Channel names (`#general`, `#competition-prep`, etc.) are original creations for the demo.

---

## Fonts

ConnectFBLA uses the system font for all typography:

- **iOS:** San Francisco (System font) — accessed via `fontFamily: 'System'`
- **Android:** Roboto — accessed via `fontFamily: 'Roboto'` and `fontFamily: 'Roboto-Medium'`

Both fonts are bundled with their respective operating systems. No third-party fonts are downloaded or embedded.

---

## Social Media Links

The social media profiles linked in the app are:

| Platform | Handle | Profile |
|----------|--------|---------|
| Instagram | `fbla_colorado` | Colorado FBLA chapter Instagram |
| LinkedIn | `fbla-pbl` | FBLA-PBL official LinkedIn |
| YouTube | `FBLAPBL` | FBLA-PBL official YouTube channel |
| Twitter/X | `FBLA_PBL` | FBLA-PBL official Twitter |
| Facebook | `FBLAnational` | FBLA national Facebook page |

These are public profiles of FBLA-PBL and Colorado FBLA. ConnectFBLA links to these profiles for informational purposes. All FBLA trademarks, logos, and brand assets are property of FBLA-PBL, Inc.

---

## Artificial Intelligence Tools

The following AI tools were used during development:

| Tool | Used For |
|------|----------|
| Claude (Anthropic) | Code architecture guidance, component design review, documentation drafting |

All code in ConnectFBLA was reviewed, understood, and approved by Vedaant Pareek. AI tools were used as a development aid, similar to consulting documentation or Stack Overflow.

---

## Copyright Notice

Copyright &copy; 2026 Vedaant Pareek / Cherry Creek High School FBLA

ConnectFBLA was built for the FBLA Mobile Application Development competition, Colorado State Conference 2026. All original code, design decisions, and creative content are the work of Vedaant Pareek.

All third-party libraries are used under their respective MIT licenses (see `docs/LIBRARIES.md`).

FBLA&reg;, FBLA-PBL&reg;, and related marks are registered trademarks of FBLA-PBL, Inc. ConnectFBLA is not officially affiliated with or endorsed by FBLA-PBL, Inc. The app is created as a student competition entry.

---

*Last updated: April 3, 2026 | ConnectFBLA v1.0.0*
