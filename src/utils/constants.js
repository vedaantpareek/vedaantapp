/**
 * ConnectFBLA Global Constants
 * APP_DATE is the hardcoded "current" date for all demo/calendar/feed purposes.
 * Using April 3, 2026 — the day of the State Conference presentation.
 */

// App base date — hardcoded for demo stability
export const APP_DATE = new Date('2026-04-03T09:00:00');
export const APP_DATE_STRING = '2026-04-03';

// App metadata
export const APP_NAME = 'ConnectFBLA';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Your FBLA Journey, Connected.';

// School info
export const SCHOOL_NAME = 'Cherry Creek High School';
export const CHAPTER_NAME = 'District 12';
export const COMPETITOR_NAME = 'Vedaant Pareek';

// Social media handles — FBLA National (fbla_national on all platforms)
export const SOCIAL_HANDLES = {
  instagram: 'fbla_national',
  linkedin: 'future-business-leaders-america',
  youtube: 'fbla_national',
  twitter: 'fbla_national',
  facebook: 'FutureBusinessLeaders',
};

// Social media URLs — verified FBLA National accounts
export const SOCIAL_URLS = {
  instagram: 'https://www.instagram.com/fbla_national/',
  linkedin: 'https://www.linkedin.com/company/future-business-leaders-america/',
  youtube: 'https://www.youtube.com/@fbla_national',
  twitter: 'https://twitter.com/fbla_national',
  facebook: 'https://www.facebook.com/FutureBusinessLeaders',
};

// Social media deep links (platform-specific, falls back to SOCIAL_URLS)
export const SOCIAL_DEEP_LINKS = {
  instagram: 'instagram://user?username=fbla_national',
  linkedin: 'linkedin://company/future-business-leaders-america',
  youtube: 'youtube://www.youtube.com/@fbla_national',
  twitter: 'twitter://user?screen_name=fbla_national',
  facebook: 'fb://page/FutureBusinessLeaders',
};

// Validation rules
export const VALIDATION = {
  passwordMinLength: 8,
  bioMaxLength: 280,
  messageMaxLength: 2000,
  searchMinLength: 2,
  maxImageSizeMB: 10,
};

// Category colors for news feed badges
export const CATEGORY_COLORS = {
  Conference: '#C9A84C',
  'Chapter News': '#38A169',
  'National News': '#1B3A6B',
  'Event Tips': '#DD6B20',
  NLC: '#3182CE',
  Resources: '#805AD5',
  'FBLA Week': '#48BB78',
  'Professional Dev': '#4299E1',
  Leadership: '#9F7AEA',
  Colorado: '#2C5282',
  Spotlight: '#D53F8C',
  Reminder: '#E53E3E',
};

// Event type colors for calendar
export const EVENT_TYPE_COLORS = {
  conference: '#C9A84C',
  chapter: '#38A169',
  deadline: '#E53E3E',
  nlc: '#3182CE',
  personal: '#805AD5',
};

// Empty state messages
export const EMPTY_STATES = {
  feed: 'No announcements yet.\nCheck back soon!',
  events: 'No events this month.',
  resources: 'No resources found.\nTry a different filter.',
  messages: 'No messages yet.\nSay hello!',
  search: 'No results found.\nTry different keywords.',
};

// Screen names (for navigation)
export const SCREENS = {
  // Auth
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  // Feed
  NEWS_FEED: 'NewsFeed',
  ANNOUNCEMENT_DETAIL: 'AnnouncementDetail',
  // Calendar
  CALENDAR: 'CalendarMain',
  EVENT_DETAIL: 'EventDetail',
  // Resources
  RESOURCES: 'ResourcesMain',
  RESOURCE_DETAIL: 'ResourceDetail',
  // Connect
  CHAT_LIST: 'ChatList',
  GROUP_CHANNEL: 'GroupChannel',
  DIRECT_MESSAGE: 'DirectMessage',
  NEW_MESSAGE: 'NewMessage',
  // Profile
  PROFILE: 'ProfileMain',
  EDIT_PROFILE: 'EditProfile',
  SETTINGS: 'Settings',
};
