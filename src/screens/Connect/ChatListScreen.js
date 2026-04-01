import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import AppAvatar from '../../components/AppAvatar';
import AppBadge from '../../components/AppBadge';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import SHADOWS from '../../theme/shadows';
import USERS from '../../data/users.json';
import { SCREENS } from '../../utils/constants';
import { useTapRegistration } from '../../hooks/useTapRegistration';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserById(id) {
  return USERS.find((u) => u.id === id) || { name: 'Unknown', isOnline: false };
}

// ─── Row Components ──────────────────────────────────────────────────────────

function ChannelRow({ channel, onPress }) {
  const hasUnread = channel.unreadCount > 0;
  const tapRef = useTapRegistration(`channel-${channel.id}`, onPress);
  return (
    <TouchableOpacity
      ref={tapRef}
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${channel.name} channel`}
    >
      {/* Icon badge */}
      <View style={[styles.channelIcon, { backgroundColor: channel.color + '22' }]}>
        <Ionicons name={channel.icon} size={22} color={channel.color} />
      </View>

      {/* Text content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <View style={styles.rowTitleRow}>
            {channel.isPinned && (
              <Ionicons name="pin" size={12} color={COLORS.gold} style={styles.pinIcon} />
            )}
            <Text style={[styles.rowTitle, hasUnread && styles.rowTitleBold]} numberOfLines={1}>
              {channel.name}
            </Text>
          </View>
          <Text style={styles.rowTime}>{channel.lastMessage?.timestamp || ''}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowPreview, hasUnread && styles.rowPreviewBold]} numberOfLines={1}>
            {channel.lastMessage?.text || 'No messages yet'}
          </Text>
          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{channel.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DmRow({ dm, currentUserId, onPress }) {
  const otherId = dm.participants.find((id) => id !== currentUserId);
  const other = getUserById(otherId);
  const hasUnread = dm.unreadCount > 0;
  const tapRef = useTapRegistration(`dm-${dm.id}`, onPress);

  return (
    <TouchableOpacity
      ref={tapRef}
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Direct message with ${other.name}`}
    >
      <AppAvatar name={other.name} size="md" online={other.isOnline} />

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, hasUnread && styles.rowTitleBold]} numberOfLines={1}>
            {other.name}
          </Text>
          <Text style={styles.rowTime}>{dm.lastMessage?.timestamp || ''}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowPreview, hasUnread && styles.rowPreviewBold]} numberOfLines={1}>
            {dm.lastMessage?.text || 'Start a conversation'}
          </Text>
          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{dm.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChatListScreen({ navigation }) {
  const { channels, directMessages, getTotalUnread } = useChatStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Sorted channels: pinned first
  const sortedChannels = [...channels].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // Update tab badge with total unread
  useEffect(() => {
    const total = getTotalUnread();
    navigation.getParent()?.setOptions({
      tabBarBadge: total > 0 ? total : undefined,
    });
  }, [channels, directMessages, navigation, getTotalUnread]);

  // headerRight is set in ConnectStack.js options — no setOptions needed here

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const sections = [
    {
      title: 'CHANNELS',
      data: sortedChannels,
      renderItem: ({ item }) => (
        <ChannelRow
          channel={item}
          onPress={() =>
            navigation.navigate(SCREENS.GROUP_CHANNEL, {
              channelId: item.id,
              channelName: item.name,
              memberCount: item.memberIds?.length || 0,
            })
          }
        />
      ),
    },
    {
      title: 'DIRECT MESSAGES',
      data: directMessages,
      renderItem: ({ item }) => (
        <DmRow
          dm={item}
          currentUserId={user?.id || 'user_1'}
          onPress={() => {
            const otherId = item.participants.find((id) => id !== (user?.id || 'user_1'));
            const other = getUserById(otherId);
            navigation.navigate(SCREENS.DIRECT_MESSAGE, {
              dmId: item.id,
              otherUserId: otherId,
              otherUserName: other.name,
              otherUserOnline: other.isOnline,
            });
          }}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => section.renderItem({ item })}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    minHeight: SPACING.touchTarget,
    backgroundColor: COLORS.background,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: SPACING.sm,
  },
  pinIcon: {
    marginRight: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.bodyText,
    flex: 1,
  },
  rowTitleBold: {
    fontWeight: '700',
    color: COLORS.bodyText,
  },
  rowTime: {
    fontSize: 12,
    color: COLORS.placeholderText,
    flexShrink: 0,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPreview: {
    fontSize: 14,
    color: COLORS.secondaryText,
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowPreviewBold: {
    color: COLORS.bodyText,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.screenPadding + 44 + SPACING.md,
  },
  headerBtn: {
    marginRight: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
