import { Linking, Share, Platform } from 'react-native';
import { SOCIAL_DEEP_LINKS, SOCIAL_URLS } from './constants';

/**
 * Opens a social media platform with the given handle.
 * Tries the native app deep link first, falls back to browser URL.
 * @param {string} platform - 'instagram' | 'linkedin' | 'youtube' | 'twitter' | 'facebook'
 * @param {string} handle - optional custom handle
 */
export async function openSocialMedia(platform, handle) {
  const deepLink = buildDeepLink(platform, handle);
  const webUrl = buildWebUrl(platform, handle);

  try {
    const canOpen = await Linking.canOpenURL(deepLink);
    if (canOpen) {
      await Linking.openURL(deepLink);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    // Final fallback — open web URL
    try {
      await Linking.openURL(webUrl);
    } catch (e) {
      // Silently fail — linking not available in this environment
    }
  }
}

function buildDeepLink(platform, handle) {
  const handles = {
    instagram: handle || 'fbla_colorado',
    linkedin: handle || 'fbla-pbl',
    youtube: handle || 'FBLAPBL',
    twitter: handle || 'FBLA_PBL',
    facebook: handle || 'FBLAnational',
  };

  const h = handles[platform] || '';

  switch (platform) {
    case 'instagram': return `instagram://user?username=${h}`;
    case 'linkedin': return `linkedin://in/${h}`;
    case 'youtube': return `youtube://www.youtube.com/@${h}`;
    case 'twitter': return `twitter://user?screen_name=${h}`;
    case 'facebook': return `fb://page/${h}`;
    default: return SOCIAL_URLS[platform] || 'https://fbla.org';
  }
}

function buildWebUrl(platform, handle) {
  const handles = {
    instagram: handle || 'fbla_colorado',
    linkedin: handle || 'fbla-pbl',
    youtube: handle || 'FBLAPBL',
    twitter: handle || 'FBLA_PBL',
    facebook: handle || 'FBLAnational',
  };
  const h = handles[platform] || '';

  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${h}/`;
    case 'linkedin': return `https://www.linkedin.com/in/${h}/`;
    case 'youtube': return `https://www.youtube.com/@${h}`;
    case 'twitter': return `https://twitter.com/${h}`;
    case 'facebook': return `https://www.facebook.com/${h}`;
    default: return 'https://fbla.org';
  }
}

/**
 * Opens the native share sheet with pre-filled content.
 * @param {string} title
 * @param {string} message
 * @param {string} url - optional URL to share
 */
export async function shareContent(title, message, url) {
  const shareOptions = {
    title,
    message: url ? `${message}\n\n${url}` : message,
  };

  try {
    await Share.share(shareOptions);
  } catch (error) {
    // Share not available or cancelled
  }
}

/**
 * Composes a tweet with pre-filled text.
 * @param {string} text
 */
export async function shareToTwitter(text) {
  const tweetText = encodeURIComponent(`${text} #FBLA2026 #CherryCreek`);
  const twitterUrl = `twitter://post?message=${tweetText}`;
  const webUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  try {
    const canOpen = await Linking.canOpenURL(twitterUrl);
    await Linking.openURL(canOpen ? twitterUrl : webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}
