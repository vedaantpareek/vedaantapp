import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const ProfileScreen = require('../screens/Profile/ProfileScreen').default;
  const EditProfileScreen = require('../screens/Profile/EditProfileScreen').default;
  const SettingsScreen = require('../screens/Profile/SettingsScreen').default;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name={SCREENS.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name={SCREENS.SETTINGS}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
