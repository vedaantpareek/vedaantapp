import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { APP_NAME, APP_VERSION, SCHOOL_NAME, CHAPTER_NAME } from '../../utils/constants';

// ─── Row components ──────────────────────────────────────────────────────────

function SettingsRow({ icon, label, value, onPress, destructive }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? COLORS.error : COLORS.primary}
        />
      </View>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={COLORS.placeholderText} />
      )}
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onToggle }) {
  return (
    <View style={styles.row} accessibilityRole="switch" accessibilityLabel={label}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '88' }}
        thumbColor={value ? COLORS.primary : COLORS.placeholderText}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Separator() {
  return <View style={styles.separator} />;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  // Notification preferences (persisted in local state for demo)
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifResources, setNotifResources] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of ConnectFBLA?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const handleToggle = useCallback((setter) => (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Account Info ─────────────────────────── */}
      <View style={styles.accountCard}>
        <View style={styles.accountAvatar}>
          <Text style={styles.accountInitials}>
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'VP'}
          </Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{user?.name || 'Vedaant Pareek'}</Text>
          <Text style={styles.accountEmail}>{user?.email || ''}</Text>
          <View style={styles.accountBadge}>
            <Text style={styles.accountBadgeText}>{CHAPTER_NAME}</Text>
          </View>
        </View>
      </View>

      {/* ── Notifications ────────────────────────── */}
      <SectionHeader title="NOTIFICATIONS" />
      <View style={styles.card}>
        <ToggleRow
          icon="megaphone-outline"
          label="Announcements"
          value={notifAnnouncements}
          onToggle={handleToggle(setNotifAnnouncements)}
        />
        <Separator />
        <ToggleRow
          icon="calendar-outline"
          label="Event Reminders"
          value={notifEvents}
          onToggle={handleToggle(setNotifEvents)}
        />
        <Separator />
        <ToggleRow
          icon="chatbubble-outline"
          label="New Messages"
          value={notifMessages}
          onToggle={handleToggle(setNotifMessages)}
        />
        <Separator />
        <ToggleRow
          icon="document-outline"
          label="New Resources"
          value={notifResources}
          onToggle={handleToggle(setNotifResources)}
        />
      </View>

      {/* ── Account ──────────────────────────────── */}
      <SectionHeader title="ACCOUNT" />
      <View style={styles.card}>
        <SettingsRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Separator />
        <SettingsRow
          icon="school-outline"
          label="School"
          value={SCHOOL_NAME}
        />
        <Separator />
        <SettingsRow
          icon="people-outline"
          label="Chapter"
          value={CHAPTER_NAME}
        />
        <Separator />
        <SettingsRow
          icon="id-card-outline"
          label="Member Since"
          value={user?.memberSince
            ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : '—'}
        />
      </View>

      {/* ── App Info ─────────────────────────────── */}
      <SectionHeader title="APP INFO" />
      <View style={styles.card}>
        <SettingsRow
          icon="information-circle-outline"
          label="App Name"
          value={APP_NAME}
        />
        <Separator />
        <SettingsRow
          icon="code-slash-outline"
          label="Version"
          value={`v${APP_VERSION}`}
        />
        <Separator />
        <SettingsRow
          icon="business-outline"
          label="Organization"
          value="FBLA-PBL"
        />
        <Separator />
        <SettingsRow
          icon="trophy-outline"
          label="Competition"
          value="Mobile App Dev"
        />
      </View>

      {/* ── Sign Out ─────────────────────────────── */}
      <SectionHeader title="" />
      <View style={styles.card}>
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleLogout}
          destructive
        />
      </View>

      {/* ── App tagline ──────────────────────────── */}
      <Text style={styles.tagline}>ConnectFBLA · Your FBLA Journey, Connected.</Text>
      <Text style={styles.copyright}>
        Built for FBLA Mobile Application Development{'\n'}Cherry Creek High School · District 12 · 2026
      </Text>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  accountAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  accountInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  accountInfo: { flex: 1 },
  accountName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  accountEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  accountBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    minHeight: SPACING.touchTarget,
    backgroundColor: COLORS.surface,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rowIconDestructive: {
    backgroundColor: COLORS.error + '12',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.bodyText,
    fontWeight: '400',
  },
  rowLabelDestructive: {
    color: COLORS.error,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.secondaryText,
    maxWidth: 160,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md + 36 + SPACING.sm,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xl,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.placeholderText,
    marginTop: SPACING.sm,
    lineHeight: 17,
  },
});
