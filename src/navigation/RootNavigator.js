import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { SCREENS } from '../utils/constants';

import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name={SCREENS.ONBOARDING} component={OnboardingScreen} />
          <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
