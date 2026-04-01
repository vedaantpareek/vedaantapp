import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import AppAvatar from '../../components/AppAvatar';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import USERS from '../../data/users.json';
import { SCREENS } from '../../utils/constants';

export default function NewMessageScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const { user } = useAuthStore();
  const { getDmByParticipant } = useChatStore();
  const currentUserId = user?.id || 'user_1';

  // All users except self
  const otherUsers = useMemo(
    () => USERS.filter((u) => u.id !== currentUserId),
    [currentUserId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return otherUsers;
    return otherUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.chapter.toLowerCase().includes(q)
    );
  }, [query, otherUsers]);

  const handleSelectUser = (selectedUser) => {
    const existingDm = getDmByParticipant(selectedUser.id);
    if (existingDm) {
      navigation.replace(SCREENS.DIRECT_MESSAGE, {
        dmId: existingDm.id,
        otherUserId: selectedUser.id,
        otherUserName: selectedUser.name,
        otherUserOnline: selectedUser.isOnline,
      });
    } else {
      // New conversation — navigate with user info, no existing dmId
      navigation.replace(SCREENS.DIRECT_MESSAGE, {
        dmId: null,
        otherUserId: selectedUser.id,
        otherUserName: selectedUser.name,
        otherUserOnline: selectedUser.isOnline,
      });
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => handleSelectUser(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Start conversation with ${item.name}`}
    >
      <AppAvatar name={item.name} size="md" online={item.isOnline} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userMeta}>
          {item.chapter} · {item.grade}
        </Text>
      </View>
      {item.isOnline && <View style={styles.onlineDot} />}
      <Ionicons name="chevron-forward" size={18} color={COLORS.placeholderText} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.placeholderText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor={COLORS.placeholderText}
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
          returnKeyType="search"
          accessibilityLabel="Search members"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No members found"
            subtitle="Try a different name or chapter"
          />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.screenPadding,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.bodyText,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    minHeight: SPACING.touchTarget,
    backgroundColor: COLORS.background,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    minWidth: 0,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.bodyText,
  },
  userMeta: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.screenPadding + 40 + SPACING.md,
  },
});
