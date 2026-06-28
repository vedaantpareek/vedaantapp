import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function ConnectStack() {
  const ChatListScreen = require('../screens/Connect/ChatListScreen').default;
  const GroupChannelScreen = require('../screens/Connect/GroupChannelScreen').default;
  const DirectMessageScreen = require('../screens/Connect/DirectMessageScreen').default;
  const NewMessageScreen = require('../screens/Connect/NewMessageScreen').default;
  const UserProfileScreen = require('../screens/Profile/UserProfileScreen').default;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerLeftContainerStyle: { paddingLeft: 4 },
        headerRightContainerStyle: { paddingRight: 4 },
      }}
    >
      {/* ── Chat list — back to home + search ──────────────────────── */}
      <Stack.Screen
        name={SCREENS.CHAT_LIST}
        component={ChatListScreen}
        options={({ navigation }) => ({
          title: 'Connect',
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
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.NEW_MESSAGE)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
          ),
        })}
      />

      {/* ── Group channel — name + member count in title; headerLeft/Right set by GroupChannelScreen ── */}
      <Stack.Screen
        name={SCREENS.GROUP_CHANNEL}
        component={GroupChannelScreen}
        options={({ route }) => ({
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 17 }}>
                {route.params?.channelName || 'Channel'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.70)', fontSize: 12, marginTop: 1 }}>
                {route.params?.memberCount || 0} members
              </Text>
            </View>
          ),
        })}
      />

      {/* ── Direct message — name + online status in title + person-add ── */}
      <Stack.Screen
        name={SCREENS.DIRECT_MESSAGE}
        component={DirectMessageScreen}
        options={({ navigation, route }) => ({
          headerTitle: () => (
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              activeOpacity={0.7}
              onPress={() =>
                route.params?.otherUserId &&
                navigation.navigate(SCREENS.USER_PROFILE, { userId: route.params.otherUserId })
              }
              accessibilityRole="button"
              accessibilityLabel={`View ${route.params?.otherUserName || 'member'}'s profile`}
            >
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 17 }}>
                {route.params?.otherUserName || 'Message'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                {route.params?.otherUserOnline && (
                  <View style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: COLORS.success, marginRight: 4,
                  }} />
                )}
                <Text style={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                  {route.params?.otherUserOnline ? 'Active now' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.NEW_MESSAGE)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="person-add" size={24} color="#000" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name={SCREENS.NEW_MESSAGE}
        component={NewMessageScreen}
        options={{ title: 'New Message' }}
      />
      <Stack.Screen
        name={SCREENS.USER_PROFILE}
        component={UserProfileScreen}
        options={{ title: 'Profile', headerTitleAlign: 'center' }}
      />
    </Stack.Navigator>
  );
}
