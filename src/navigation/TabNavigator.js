import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import { useChatStore } from '../stores/chatStore';

import FeedStack from './FeedStack';
import CalendarStack from './CalendarStack';
import ResourceStack from './ResourceStack';
import ConnectStack from './ConnectStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const totalUnread = useChatStore((state) => state.totalUnread);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          height: SPACING.tabBarHeight + (Platform.OS === 'ios' ? 20 : 0),
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'CalendarTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'ResourcesTab':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'ConnectTab':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={FeedStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="ResourcesTab"
        component={ResourceStack}
        options={{ tabBarLabel: 'Resources' }}
      />
      <Tab.Screen
        name="ConnectTab"
        component={ConnectStack}
        options={{
          tabBarLabel: 'Connect',
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.error },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
