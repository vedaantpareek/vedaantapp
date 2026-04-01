import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function FeedStack() {
  const NewsFeedScreen = require('../screens/Feed/NewsFeedScreen').default;
  const AnnouncementDetailScreen = require('../screens/Feed/AnnouncementDetailScreen').default;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerRightContainerStyle: { paddingRight: 4, backgroundColor: 'transparent' },
        headerLeftContainerStyle: { paddingLeft: 4, backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name={SCREENS.NEWS_FEED}
        component={NewsFeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREENS.ANNOUNCEMENT_DETAIL}
        component={AnnouncementDetailScreen}
        options={{ title: 'Announcement' }}
      />
    </Stack.Navigator>
  );
}
