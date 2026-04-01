/**
 * RemoteControlListener
 *
 * Mounts invisibly inside App.js (dev-mode only).
 * Responsibilities:
 *   1. Opens a WebSocket to the local server (/phone path).
 *   2. Captures a screenshot every SCREENSHOT_INTERVAL_MS and sends it to
 *      the server, which forwards it to the browser mirror.
 *   3. Receives tap / swipe / scroll / navigate commands from the browser
 *      and executes them on the real device:
 *        - navigate → uses the global navigationRef
 *        - back      → navigationRef.goBack()
 *        - tap       → zone-based: tab bar taps navigate between tabs;
 *                       back-button zone triggers goBack(); content taps logged
 *        - swipe     → horizontal swipe right = go back
 *        - scroll    → forwarded to whichever ScrollView is registered as active
 */

import { useEffect, useRef, useCallback } from 'react';
import { Dimensions, Platform } from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import { navigationRef } from '../navigation/navigationRef';
import { TapRegistry } from '../utils/TapRegistry';
import {
  REMOTE_WS_URL,
  REMOTE_ENABLED,
  SCREENSHOT_INTERVAL_MS,
} from '../utils/remoteConfig';

// ── Tab route names (must match TabNavigator.js) ───────────────────────────────
const TABS = ['HomeTab', 'CalendarTab', 'ResourcesTab', 'ConnectTab', 'ProfileTab'];

// ── Tab bar metrics ────────────────────────────────────────────────────────────
// Standard React Navigation bottom tab bar height:
//   iOS: ~83px (60px bar + ~23px safe area)
//   Android: ~60px
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 83 : 60;

// Back button hitbox: top-left 60×60 pt area (covers any header back button)
const BACK_ZONE = { x: 60, y: 100 };

export default function RemoteControlListener() {
  const wsRef = useRef(null);
  const captureTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const isConnectedRef = useRef(false);

  // ── WebSocket lifecycle ──────────────────────────────────────────────────────
  const stopCapture = useCallback(() => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
  }, []);

  const startCapture = useCallback(() => {
    stopCapture();
    let frameCount = 0;
    captureTimerRef.current = setInterval(async () => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      try {
        // captureScreen() grabs the entire device screen — no view ref needed.
        const base64 = await captureScreen({
          format: 'jpg',
          quality: 0.5,
          result: 'base64',
        });

        const { width, height } = Dimensions.get('window');
        wsRef.current.send(
          JSON.stringify({
            type: 'screenshot',
            data: `data:image/jpeg;base64,${base64}`,
            width,
            height,
          })
        );

        frameCount++;
        if (frameCount === 1 || frameCount % 20 === 0) {
          console.log(`[RemoteControl] screenshot sent (frame ${frameCount}, ${base64.length} chars)`);
        }
      } catch (err) {
        console.log('[RemoteControl] captureScreen error:', err?.message ?? err);
      }
    }, SCREENSHOT_INTERVAL_MS);
  }, [stopCapture]);

  const connect = useCallback(() => {
    if (!REMOTE_ENABLED) return;

    try {
      const ws = new WebSocket(REMOTE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectedRef.current = true;
        console.log('[RemoteControl] Connected to server');
        startCapture();
      };

      ws.onmessage = (event) => {
        try {
          const cmd = JSON.parse(event.data);
          handleCommand(cmd);
        } catch (_) {}
      };

      ws.onclose = () => {
        isConnectedRef.current = false;
        stopCapture();
        console.log('[RemoteControl] Disconnected — retrying in 2s');
        retryTimerRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        // onclose fires after onerror; let that handle retry
      };
    } catch (err) {
      console.log('[RemoteControl] Connect error:', err.message);
      retryTimerRef.current = setTimeout(connect, 3000);
    }
  }, [startCapture, stopCapture]);

  useEffect(() => {
    if (!REMOTE_ENABLED) return;
    connect();

    return () => {
      stopCapture();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent retry on intentional close
        wsRef.current.close();
      }
    };
  }, [connect, stopCapture]);

  // ── Command handler ──────────────────────────────────────────────────────────
  function handleCommand(cmd) {
    console.log('[RemoteControl] cmd received:', JSON.stringify(cmd));
    if (!navigationRef.isReady()) {
      console.log('[RemoteControl] navigationRef not ready — ignoring cmd');
      return;
    }

    switch (cmd.type) {

      case 'navigate': {
        // Direct named navigation — works for any registered route
        try {
          navigationRef.navigate(cmd.screen);
          console.log('[RemoteControl] navigated to', cmd.screen);
        } catch (e) {
          console.log('[RemoteControl] navigate error:', e.message);
        }
        break;
      }

      case 'back': {
        if (navigationRef.canGoBack()) navigationRef.goBack();
        break;
      }

      case 'tap': {
        handleTap(cmd.xPct, cmd.yPct);
        break;
      }

      case 'swipe': {
        if (cmd.direction === 'right' && navigationRef.canGoBack()) {
          navigationRef.goBack();
        } else if (cmd.direction === 'left') {
          handleTabSwipeLeft();
        }
        break;
      }

      case 'scroll': {
        // Scroll injection requires native support; emit to registered handler if any
        RemoteScrollManager.emit(cmd.deltaY);
        break;
      }

      case 'keyInput': {
        RemoteKeyboardManager.emit({ key: cmd.key, char: cmd.char || '' });
        break;
      }

      default:
        break;
    }
  }

  // ── Tap zone detection ────────────────────────────────────────────────────────
  function handleTap(xPct, yPct) {
    const { width, height } = Dimensions.get('window');
    const x = xPct * width;
    const y = yPct * height;

    // Zone 1: Tab bar (bottom of screen)
    if (y >= height - TAB_BAR_HEIGHT) {
      const tabIndex = Math.min(Math.floor(xPct * TABS.length), TABS.length - 1);
      const tab = TABS[tabIndex];
      try { navigationRef.navigate(tab); } catch (_) {}
      return;
    }

    // Zone 2: Back button area (top-left)
    if (x < BACK_ZONE.x && y < BACK_ZONE.y) {
      if (navigationRef.canGoBack()) navigationRef.goBack();
      return;
    }

    // Zone 3: General content area — look up TapRegistry for a registered element
    TapRegistry.handleTap(x, y).then((handled) => {
      if (!handled) {
        console.log(`[RemoteControl] No tap target at (${(xPct * 100).toFixed(1)}%, ${(yPct * 100).toFixed(1)}%) — ${TapRegistry.size()} elements registered`);
      }
    });
  }

  // Horizontal left swipe advances to the next tab
  function handleTabSwipeLeft() {
    const state = navigationRef.getState();
    if (!state) return;
    // Walk the nav state tree to find the active tab index
    const mainRoute = state.routes?.find((r) => r.name === 'Main');
    if (!mainRoute?.state) return;
    const tabState = mainRoute.state;
    const currentIndex = tabState.index ?? 0;
    const nextIndex = Math.min(currentIndex + 1, TABS.length - 1);
    if (nextIndex !== currentIndex) {
      try { navigationRef.navigate(TABS[nextIndex]); } catch (_) {}
    }
  }

  // No UI — this component is purely a side-effect mount
  return null;
}

// ── RemoteKeyboardManager ──────────────────────────────────────────────────────
/**
 * Streams keystrokes from the browser remote control to any subscribed TextInput.
 *
 * Usage in a chat screen:
 *
 *   import { RemoteKeyboardManager } from '../components/RemoteControlListener';
 *
 *   const handleSendRef = useRef(null);
 *   useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);
 *
 *   useEffect(() => {
 *     const unsub = RemoteKeyboardManager.subscribe(({ key, char }) => {
 *       if (key === 'Backspace') setInputText(prev => prev.slice(0, -1));
 *       else if (key === 'Enter')  handleSendRef.current?.();
 *       else if (char)             setInputText(prev => (prev + char).slice(0, MAX));
 *     });
 *     return unsub;
 *   }, []);
 */
export const RemoteKeyboardManager = (() => {
  const listeners = new Set();
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    emit(cmd) {
      listeners.forEach((fn) => fn(cmd));
    },
  };
})();

// ── RemoteScrollManager ────────────────────────────────────────────────────────
/**
 * Simple pub/sub for scroll events.
 *
 * Usage in a screen:
 *
 *   import { RemoteScrollManager } from '../components/RemoteControlListener';
 *   import { useRef, useEffect } from 'react';
 *
 *   const scrollRef = useRef(null);
 *
 *   useEffect(() => {
 *     const unsub = RemoteScrollManager.subscribe((delta) => {
 *       scrollRef.current?.scrollTo({ y: currentOffset + delta, animated: true });
 *     });
 *     return unsub;
 *   }, []);
 *
 *   <ScrollView ref={scrollRef} ...>
 */
export const RemoteScrollManager = (() => {
  const listeners = new Set();
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    emit(deltaY) {
      listeners.forEach((fn) => fn(deltaY));
    },
  };
})();
