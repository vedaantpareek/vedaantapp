import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function ResourceStack() {
  const ResourcesScreen = require('../screens/Resources/ResourcesScreen').default;
  const ResourceDetailScreen = require('../screens/Resources/ResourceDetailScreen').default;

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
        name={SCREENS.RESOURCES}
        component={ResourcesScreen}
        options={{ title: 'Resources' }}
      />
      <Stack.Screen
        name={SCREENS.RESOURCE_DETAIL}
        component={ResourceDetailScreen}
        options={{ title: 'Resource' }}
      />
    </Stack.Navigator>
  );
}
