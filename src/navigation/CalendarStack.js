import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function CalendarStack() {
  const CalendarScreen = require('../screens/Calendar/CalendarScreen').default;
  const EventDetailScreen = require('../screens/Calendar/EventDetailScreen').default;

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
        name={SCREENS.CALENDAR}
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Stack.Screen
        name={SCREENS.EVENT_DETAIL}
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
    </Stack.Navigator>
  );
}
