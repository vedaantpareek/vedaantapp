import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
        headerBackTitleVisible: false,
        headerLeftContainerStyle: { paddingLeft: 4 },
        headerRightContainerStyle: { paddingRight: 4 },
      }}
    >
      <Stack.Screen
        name={SCREENS.CALENDAR}
        component={CalendarScreen}
        options={({ navigation }) => ({
          title: 'Calendar',
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name={SCREENS.EVENT_DETAIL}
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
    </Stack.Navigator>
  );
}
