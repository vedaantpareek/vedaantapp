/**
 * TapRegistry
 *
 * Global singleton that maps interactive elements to handlers.
 * Used by RemoteControlListener to translate browser tap coordinates
 * into real onPress calls without needing native touch injection.
 *
 * Usage (via the useTapRegistration hook — see src/hooks/useTapRegistration.js):
 *
 *   const tapRef = useTapRegistration('my-button', () => doSomething());
 *   <TouchableOpacity ref={tapRef} onPress={...}>
 *
 * When a tap arrives from the browser at (xPct, yPct):
 *   1. Each registered element's ref is measured (pageX, pageY, width, height)
 *   2. The smallest element whose bounds contain the tap point is chosen
 *   3. Its handler is called directly from JS — no native touch injection needed
 */

const registry = new Map(); // id → { ref, handler }

export const TapRegistry = {
  register(id, ref, handler) {
    registry.set(id, { ref, handler });
  },

  unregister(id) {
    registry.delete(id);
  },

  /**
   * Find and activate the tightest element that contains (xAbs, yAbs).
   * Coordinates are absolute screen pixels (already converted from percentages
   * by RemoteControlListener before calling this).
   *
   * Returns true if a handler was found and called, false otherwise.
   */
  async handleTap(xAbs, yAbs) {
    const candidates = [];

    const measurements = Array.from(registry.entries()).map(([, { ref, handler }]) =>
      new Promise((resolve) => {
        if (!ref?.current) { resolve(); return; }
        try {
          ref.current.measure((fx, fy, width, height, pageX, pageY) => {
            if (
              width > 0 && height > 0 &&
              xAbs >= pageX && xAbs <= pageX + width &&
              yAbs >= pageY && yAbs <= pageY + height
            ) {
              candidates.push({ area: width * height, handler });
            }
            resolve();
          });
        } catch {
          resolve();
        }
      })
    );

    await Promise.all(measurements);

    if (candidates.length === 0) return false;

    // Smallest area = most specific / innermost element
    candidates.sort((a, b) => a.area - b.area);
    candidates[0].handler();
    return true;
  },

  size() {
    return registry.size;
  },
};
