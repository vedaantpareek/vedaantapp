import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useFriendsStore } from './src/stores/friendsStore';
import { navigationRef } from './src/navigation/navigationRef';
import RemoteControlListener from './src/components/RemoteControlListener';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeFriends = useFriendsStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
    initializeFriends();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="light" backgroundColor="#1B3A6B" />
        <RootNavigator />
      </NavigationContainer>

      {/* Invisible remote-control bridge — no-op in production builds */}
      <RemoteControlListener />
    </SafeAreaProvider>
  );
}
