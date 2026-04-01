/**
 * Remote Control Configuration
 *
 * HOW TO SET UP:
 * 1. Run `node server.js` on your laptop.
 * 2. Copy the IP address printed in the terminal (e.g. "192.168.1.42").
 * 3. Paste it below as SERVER_IP, then save.
 * 4. Restart the Expo app on your phone.
 */

// ─── Update this before the presentation ──────────────────────────────────────
const SERVER_IP = '172.20.10.7'; // ← PC IP on phone hotspot
const SERVER_PORT = 3001;
// ─────────────────────────────────────────────────────────────────────────────

export const REMOTE_WS_URL = `ws://${SERVER_IP}:${SERVER_PORT}/phone`;

/**
 * Only activate the remote control listener in dev mode.
 * This ensures nothing runs in a production/store build.
 */
export const REMOTE_ENABLED = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

/**
 * How often (ms) to capture and send a screenshot to the browser.
 * 300ms = ~3 fps, smooth enough for a demo without saturating the WiFi.
 */
export const SCREENSHOT_INTERVAL_MS = 300;
