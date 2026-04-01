import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Global navigation ref — allows navigation from outside React components.
 * Attached to <NavigationContainer ref={navigationRef}> in App.js.
 * Used by RemoteControlListener to execute navigation commands from the server.
 */
export const navigationRef = createNavigationContainerRef();
