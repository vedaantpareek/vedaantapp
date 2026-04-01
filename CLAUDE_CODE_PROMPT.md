# Claude Code Build Prompt — ConnectFBLA Mobile App
## FBLA Mobile Application Development | Cherry Creek High School | District 12 | Vedaant Pareek

---

## MANDATORY FIRST STEP — READ BEFORE WRITING A SINGLE LINE OF CODE

You are the world's best mobile application developer with 20+ years of experience building production React Native apps. Before doing ANYTHING else, you MUST:

1. **Read the full design document:** `ConnectFBLA_Design_Document.docx` in the NEWFBLAAPP folder. Read every section thoroughly. This is your authoritative specification.
2. **Read the competition rubric:** `Mobile Application Development.pdf` in the NEWFBLAAPP folder. Pay special attention to the **Presentation Rating Sheet** (pages 7–8). Every scored item must be explicitly addressed.
3. **Only after reading both documents in full**, begin planning your build. Do not write a single file until you have read both documents completely.

---

## Project Context

You are building **ConnectFBLA** — the official FBLA member app — for an FBLA Mobile Application Development competition. The app will be presented on **April 3, 2026** at the Colorado FBLA State Conference. The presentation is 7 minutes + 3 minutes Q&A. The app must run **completely standalone** with no live network dependencies during the demo (use mock/seeded data).

**Competitor:** Vedaant Pareek  
**School:** Cherry Creek High School  
**Chapter:** District 12  
**Platform:** React Native (Expo SDK) — iOS + Android  
**App Base Date:** April 3, 2026 (hardcode this as the "current" date for all calendar/feed/demo purposes)

---

## Multi-Agent Build Strategy

Use **multiple parallel subagents** to build this app faster and with higher quality. Assign agents as follows:

### Agent 1 — Foundation & Navigation
- Initialize Expo React Native project in the NEWFBLAAPP folder
- Install ALL dependencies (see Section 1.2 of design doc)
- Create full folder structure (src/components, src/screens, src/stores, src/data, src/utils, src/navigation, src/theme, src/hooks, assets)
- Build theme files: colors.js, typography.js, spacing.js, shadows.js
- Build ALL base reusable components: AppButton, AppCard, AppAvatar, AppBadge, AppInputField, SectionHeader, ResourceCard, MessageBubble, EventDot
- Set up TabNavigator (5 tabs) and all stack navigators
- Build Login/Onboarding screens with dual-level input validation

### Agent 2 — Mock Data Layer & Stores
- Seed ALL mock JSON data files with rich, realistic content:
  - users.json: 15+ mock users including Vedaant Pareek as primary account
  - posts.json: All 15 news feed posts from the design doc, fully written out
  - events.json: All calendar events from the design doc, with April 2–4 State Conference block
  - resources.json: All 12 global resources + 8 Mobile App Dev resources + 6 Website Design resources (full descriptions)
  - channels.json: All 8 group channels with metadata
  - messages.json: 10–20 seed messages per channel, written to feel authentic
  - directMessages.json: 3–4 pre-seeded DM conversations
- Build ALL Zustand stores: authStore, chatStore, calendarStore, resourceStore, feedStore
- Build AsyncStorage persistence layer
- Build all custom hooks: useAuth, useChat, useCalendar, useResources

### Agent 3 — Core Feature Screens
- Home Feed screen: post cards with author avatar, title, body, category badge, reaction buttons (like, comment, share), pull-to-refresh
- Announcement Detail screen: full post view with share action
- Calendar screen: full monthly view using react-native-calendars, color-coded event dots, April 3 gold highlight, TODAY badge
- Event Detail modal: event name, date/time, location, description, RSVP button, Share button, Add to Device Calendar button
- Resources screen: global library list + event selector dropdown + filtered event-specific resources
- Resource Detail screen: full description, metadata, share to chat button, bookmark toggle, open/view button

### Agent 4 — Chat & Social Features (The Wow Factor)
- Connect tab: chat list with unread badge counts, last message preview, timestamp
- Group Channel screen: scrollable message history, message input bar, attachment icon, emoji reaction on long-press
- Direct Message screen: 1-on-1 conversation view, identical message UI
- New Message screen: search for users, start new DM
- Image picker integration: react-native-image-picker for photo attachment in messages
- Resource sharing in chat: share any resource card directly into a channel or DM
- Simulated read receipts and typing indicator (timer-based)
- All 5 social media deep links: Instagram, LinkedIn, YouTube, X (Twitter), Facebook — using Linking API and react-native-share
- Native share sheet integration for news posts, resources, events, and profile cards

### Agent 5 — Profile, Polish & Compliance Document
- Profile screen: avatar, name, school/chapter badge, grade, events list, achievements row, bio, social links row (all 5 platforms), stats row (posts, events, resources bookmarked)
- Edit Profile screen: all fields editable with full validation (see Section 8 of design doc)
- Settings screen: notification preferences, account info, app version
- App icon: design a clean, professional ConnectFBLA icon (blue background, white "CF" monogram or a simple network/connect motif)
- Splash screen: ConnectFBLA logo, blue background, gold tagline
- Animations: react-native-reanimated for screen transitions, list item entrance animations, button press feedback (scale + haptic)
- Final QA: test every screen, every navigation flow, every validation path
- **Generate the Rubric Compliance Document** (see below)

---

## Critical Technical Requirements

### Must Implement (Direct Rubric Items)

1. **Planning Process** — The design document IS the planning document. Reference it explicitly in the presentation. Make sure the code structure mirrors the design doc sections exactly.

2. **Classes / Modules / Components** — Every reusable UI element must be a named component in src/components/. No inline component definitions inside screen files. Each screen file imports only from src/components/ and src/stores/.

3. **Architectural Pattern (MVVM)** — Strictly enforce Model (src/data/), ViewModel (src/stores/), View (src/screens/ + src/components/) separation. No data fetching inside components. No UI logic inside stores.

4. **Innovation & Creativity** — The chat system (Group channels + DMs + image/resource sharing) is the innovation. Make it visually striking and functionally impressive. Judges must feel surprised by the depth of this feature.

5. **UX Design** — Every screen must feel polished. Use consistent spacing (8pt grid), consistent typography scale, consistent color tokens. No hardcoded color values in screen files — always use from src/theme/colors.js.

6. **User Interface Intuitive** — No dead ends in navigation. Every screen has a back button or clear escape. Empty states are always illustrated (not blank). Loading states are always shown.

7. **Icons / Graphical Elements** — Custom app icon MUST be created. Use MaterialCommunityIcons or Ionicons consistently. Every tab has a distinct icon. Category badges use color coding. Event types have distinct icons.

8. **Input Validation (CRITICAL — Both Levels)**:
   - SYNTACTIC: email regex, password min 8 chars, bio max 280 chars with live counter, handle format checks, file type checks, date logic
   - SEMANTIC: credential match, duplicate username detection, channel membership check, event date conflict check
   - Show validation errors inline under the relevant field, not in an alert
   - Error messages must be specific (e.g., "Password must be at least 8 characters" not "Invalid password")

9. **Addresses All Parts of Prompt** — The app MUST include ALL five required features from the FBLA topic:
   - ✅ Member profiles (full, editable, with social links)
   - ✅ Calendar for events and competition reminders (react-native-calendars)
   - ✅ Access to key FBLA resources and documents (global + event-specific)
   - ✅ News feed with announcements and updates (15 seeded posts)
   - ✅ Integration with chapter social media channels (Instagram, LinkedIn, YouTube, X, Facebook)
   - PLUS the wow-factor: Chat (group + DM) and Sharing

10. **Social Media Integration (5 platforms)** — Must be DIRECT integration (opens the app, not just a link). Use platform-specific deep link formats:
    - Instagram: `instagram://user?username=HANDLE` / share intent
    - LinkedIn: `linkedin://in/HANDLE` / post compose intent
    - YouTube: `youtube://channel/CHANNEL_ID`
    - X: `twitter://post?message=TEXT%20%23FBLA2026`
    - Facebook: `fb://page/PAGE_ID`
    - Always fall back to https:// URL if app not installed

11. **Data Handling & Storage** — AsyncStorage for persistence. No sensitive data in plaintext (hash passwords). Handle storage errors gracefully. Show error states when data fails to load.

12. **Documentation & Copyright** — Add a `docs/` folder with:
    - README.md: Setup instructions, project overview, architecture explanation
    - LIBRARIES.md: Every library used, its license, and why it was chosen
    - SOURCES.md: All content sources (FBLA website, competition guidelines, etc.)

### Visual Design Requirements (Non-Negotiable)
- Primary Blue: `#1B3A6B` — used for headers, primary buttons, active tab, section borders
- Gold Accent: `#C9A84C` — used for State Conference highlights, achievement badges, featured items
- Background: `#FFFFFF` — all screen backgrounds
- Surface: `#F5F7FA` — cards, input backgrounds, alternate rows
- Body Text: `#1A202C`
- Secondary Text: `#4A5568`
- Success: `#38A169` | Error: `#E53E3E`
- Minimum touch target: 44x44 points on all interactive elements
- Consistent 8pt spacing grid (use multiples of 8 for all padding/margin values)
- All text must meet WCAG AA contrast ratios

### Calendar Specifics
- App base date = April 3, 2026 (hardcode `const APP_DATE = new Date('2026-04-03')` in constants.js and use it everywhere instead of `new Date()`)
- April 2: State Conference Day 1 — dot color gold, marked as conference type
- April 3: State Conference Day 2 — dot color gold + STAR icon + "TODAY" badge — this is the demo day
- April 4: State Conference Day 3 — dot color gold, marked as conference type
- April 3 should be visually prominent — selected by default when calendar opens

---

## Rubric Compliance Document — MANDATORY OUTPUT

After building the app, Agent 5 MUST generate a file called `docs/RUBRIC_COMPLIANCE.md`. This document is critical — it will be turned into a presentation slide deck.

The document must have this exact structure:

```markdown
# ConnectFBLA — Rubric Compliance Document
## FBLA Mobile Application Development | Vedaant Pareek | Cherry Creek High School

---

## DESIGN AND CODE QUALITY

### Planning Process (Target: 9–10/10)
**Exceeds Expectations Criteria:** Explains process using industry terminology and displays tangible planning documents.

**How ConnectFBLA Achieves This:**
[Describe the MVVM architecture, the design document as planning artifact, the folder structure as evidence of planning, and the specific industry terms used (MVVM, Zustand, React Navigation, AsyncStorage)]

**Demo Evidence:** [Which screen or file to show the judge]

---

### Appropriate Use of Classes, Modules, and Components (Target: 5/5)
...

[Continue for EVERY rubric item. Each entry must have:]
- The rubric criterion name and point value
- The "Exceeds Expectations" description quoted from the rubric
- A detailed explanation of exactly how ConnectFBLA achieves this
- The specific file(s) or screen(s) that demonstrate it
- What to show/say during the presentation for this criterion
```

Every single rubric item must be covered. The target total is 107–110/110.

---

## Code Quality Standards

- **No TypeScript errors** — if using TypeScript, all types must be explicit
- **No console.warn or console.error** in production code — handle all errors properly
- **No hardcoded strings** in UI — use a constants file for all display text
- **No magic numbers** — all numeric constants named and in constants.js
- **Consistent naming** — camelCase for variables/functions, PascalCase for components, SCREAMING_SNAKE for constants
- **Every component has PropTypes** (or TypeScript types) defined
- **Every async operation has error handling** — no unhandled promise rejections
- **Comments on complex logic** — especially validation logic, store actions, and navigation flows

---

## File Delivery Checklist

When complete, verify the following exist and work:

- [ ] App runs on iOS Simulator or Android Emulator with `npx expo start`
- [ ] App runs on a physical device via Expo Go or standalone build
- [ ] Login screen validates both syntactic and semantic levels
- [ ] All 5 tabs navigate correctly with no crashes
- [ ] Calendar shows April 3 highlighted with gold, all seeded events present
- [ ] Resources tab shows global resources AND event-specific filter works
- [ ] Chat list shows all 8 channels with seed messages
- [ ] DM list shows pre-seeded conversations
- [ ] Image picker opens and attaches photo to a message
- [ ] All 5 social media deep links open the correct app or URL
- [ ] Share sheet opens when sharing a post, resource, or event
- [ ] Profile shows Vedaant Pareek's full profile with all fields
- [ ] Edit Profile validates all fields before saving
- [ ] App icon appears on the home screen (not default Expo icon)
- [ ] Splash screen shows ConnectFBLA branding
- [ ] `docs/RUBRIC_COMPLIANCE.md` exists and covers all 16 rubric items
- [ ] `docs/README.md` exists with setup and architecture documentation
- [ ] `docs/LIBRARIES.md` lists all dependencies with licenses
- [ ] `docs/SOURCES.md` lists all content sources

---

## Final Instruction

Build this app as if it is going to be judged by the most experienced panel of software engineers and business educators in the country — because it is. Every pixel, every interaction, every error message, and every line of code is a signal of quality. The goal is not just to build a working app. The goal is to build the best app any FBLA judge has ever seen in this event.

Use `ultrathink` on every complex architectural decision. Do not cut corners on validation, accessibility, or data seeding. The mock data must feel real — real names, real dates, real FBLA content, real conversations.

Good luck. Build something incredible.
