import { useRef, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { TapRegistry } from '../utils/TapRegistry';

/**
 * useTapRegistration
 *
 * Registers a touchable element with TapRegistry so the remote-control
 * browser can activate it by tapping at its screen coordinates.
 *
 * Only registers while the containing screen is focused — prevents background
 * tab screens from polluting the registry with off-screen elements that share
 * the same coordinates as on-screen elements.
 *
 * @param {string} id        Unique, stable identifier (e.g. `post-${post.id}`)
 * @param {Function} onPress The handler to call when this element is tapped remotely
 * @returns {React.RefObject} Attach this ref to your TouchableOpacity / View
 */
export function useTapRegistration(id, onPress) {
  const ref = useRef(null);
  const isFocused = useIsFocused();

  // Keep the handler current without re-registering on every render
  const handlerRef = useRef(onPress);
  useEffect(() => {
    handlerRef.current = onPress;
  });

  useEffect(() => {
    if (!id || !isFocused) {
      TapRegistry.unregister(id);
      return;
    }
    TapRegistry.register(id, ref, () => handlerRef.current?.());
    return () => TapRegistry.unregister(id);
  }, [id, isFocused]);

  return ref;
}
