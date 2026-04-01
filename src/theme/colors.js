/**
 * ConnectFBLA Color System
 * All colors must come from this file — no hardcoded hex values in screen files.
 * Meets WCAG 2.1 AA contrast requirements throughout.
 */
const COLORS = {
  // Brand
  primary: '#1d81dc',        // Blue — headers, buttons, active tab
  gold: '#C9A84C',           // Gold accent — conference highlights, achievements

  // Backgrounds
  background: '#FFFFFF',     // Screen backgrounds
  surface: '#F5F7FA',        // Cards, input fields, alt rows

  // Borders & dividers
  border: '#E2E8F0',

  // Text
  bodyText: '#1A202C',
  secondaryText: '#4A5568',
  placeholderText: '#A0AEC0',
  white: '#FFFFFF',

  // Semantic
  success: '#38A169',
  error: '#E53E3E',
  warning: '#D69E2E',
  info: '#3182CE',

  // Tab bar
  tabActive: '#1d81dc',
  tabInactive: '#4A5568',
  tabBarBg: '#FFFFFF',

  // Chat bubbles
  bubbleOutgoing: '#1d81dc',
  bubbleIncoming: '#F5F7FA',
  bubbleOutgoingText: '#FFFFFF',
  bubbleIncomingText: '#1A202C',

  // Category badge colors
  badgeConference: '#C9A84C',
  badgeChapterNews: '#38A169',
  badgeNational: '#1d81dc',
  badgeResources: '#805AD5',
  badgeEventTips: '#DD6B20',
  badgeNLC: '#3182CE',
  badgeSpotlight: '#D53F8C',
  badgeReminder: '#E53E3E',

  // Shadow (used in StyleSheet shadowColor — iOS only)
  shadow: '#000000',

  // Calendar event type colors
  calendarConference: '#C9A84C',
  calendarChapter: '#38A169',
  calendarDeadline: '#E53E3E',
  calendarNLC: '#3182CE',
};

export default COLORS;
