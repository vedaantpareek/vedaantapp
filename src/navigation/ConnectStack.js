import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { SCREENS } from '../utils/constants';

const Stack = createNativeStackNavigator();

function CircleBtn({ onPress, iconName, iconSize = 18 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ marginRight: 12 }}
    >
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <Ionicons name={iconName} size={iconSize} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ConnectStack() {
  const ChatListScreen = require('../screens/Connect/ChatListScreen').default;
  const GroupChannelScreen = require('../screens/Connect/GroupChannelScreen').default;
  const DirectMessageScreen = require('../screens/Connect/DirectMessageScreen').default;
  const NewMessageScreen = require('../screens/Connect/NewMessageScreen').default;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      {/* ── Chat list — search button ────────────────────────────── */}
      <Stack.Screen
        name={SCREENS.CHAT_LIST}
        component={ChatListScreen}
        options={({ navigation }) => ({
          title: 'Connect',
          headerRight: () => (
            <CircleBtn
              onPress={() => navigation.navigate(SCREENS.NEW_MESSAGE)}
              iconName="search"
            />
          ),
        })}
      />

      {/* ── Group channel — name + member count in title; headerRight set by GroupChannelScreen ── */}
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

      {/* ── Direct message — name + online status in title, + circle on right ── */}
      <Stack.Screen
        name={SCREENS.DIRECT_MESSAGE}
        component={DirectMessageScreen}
        options={({ navigation, route }) => ({
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
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
            </View>
          ),
          headerRight: () => (
            <CircleBtn
              onPress={() => navigation.navigate(SCREENS.NEW_MESSAGE)}
              iconName="person-add"
            />
          ),
        })}
      />

      <Stack.Screen
        name={SCREENS.NEW_MESSAGE}
        component={NewMessageScreen}
        options={{ title: 'New Message' }}
      />
    </Stack.Navigator>
  );
}
