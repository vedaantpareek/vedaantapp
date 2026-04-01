import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';
import AppAvatar from '../../components/AppAvatar';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import SHADOWS from '../../theme/shadows';
import { openSocialMedia, shareContent } from '../../utils/socialLinks';
import { SCREENS, APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { useTapRegistration } from '../../hooks/useTapRegistration';

// ─── Social platform config ──────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', color: '#0077B5' },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
  { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatItem({ label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AchievementBadge({ achievement }) {
  return (
    <View style={[styles.achievementBadge, { borderColor: achievement.color + '44' }]}>
      <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '18' }]}>
        <Ionicons name={achievement.icon} size={20} color={achievement.color} />
      </View>
      <Text style={styles.achievementTitle}>{achievement.title}</Text>
    </View>
  );
}

function SocialLinkButton({ platform, onPress }) {
  return (
    <TouchableOpacity
      style={styles.socialBtn}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Link ${platform.label} account`}
    >
      <Ionicons
        name={platform.icon}
        size={22}
        color={COLORS.placeholderText}
      />
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const { user } = useAuthStore();
  const [avatarUri, setAvatarUri] = useState(null);

  // Load saved avatar on mount
  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`@connectfbla_avatar_${user.id}`)
      .then((uri) => {
        if (uri) setAvatarUri(uri);
      })
      .catch(() => {});
  }, [user]);

  // Navigate to settings
  const handleSettings = useCallback(() => {
    navigation.navigate(SCREENS.SETTINGS);
  }, [navigation]);

  // Navigate to edit profile
  const handleEdit = useCallback(() => {
    navigation.navigate(SCREENS.EDIT_PROFILE);
  }, [navigation]);

  const settingsTapRef = useTapRegistration('profile-settings', handleSettings);
  const editTapRef = useTapRegistration('profile-edit', handleEdit);

  // Share profile card
  const handleShare = useCallback(async () => {
    if (!user) return;
    await shareContent(
      `${user.name} — ConnectFBLA`,
      `Check out ${user.name}'s profile on ConnectFBLA! ${user.school} · ${user.chapter} · ${APP_TAGLINE}`,
      null
    );
  }, [user]);

  if (!user) return null;

  const { name, username, school, chapter, grade, bio, events, achievements, socialLinks, stats } = user;

  // Competitive event role badges derived from events array
  const EVENT_BADGE_COLORS = [COLORS.success, COLORS.info];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header: settings + share ─────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          ref={settingsTapRef}
          style={styles.iconBtn}
          onPress={handleSettings}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleShare}
          accessibilityLabel="Share profile"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Avatar + identity ─────────────────────── */}
      <View style={styles.identityBlock}>
        <View style={styles.avatarWrapper}>
          <AppAvatar name={name} size="xl" online={user.isOnline} imageUri={avatarUri} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.username}>@{username}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.infoBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.infoBadgeText}>{school}</Text>
          </View>
          <View style={[styles.infoBadge, { backgroundColor: COLORS.gold }]}>
            <Text style={[styles.infoBadgeText, { color: COLORS.primary }]}>{chapter}</Text>
          </View>
        </View>
        {events && events.slice(0, 2).length > 0 && (
          <View style={styles.badgeRow}>
            {events.slice(0, 2).map((evt, idx) => (
              <View key={evt} style={[styles.infoBadge, { backgroundColor: EVENT_BADGE_COLORS[idx % EVENT_BADGE_COLORS.length] }]}>
                <Text style={styles.infoBadgeText}>{evt}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.gradeText}>{grade}</Text>
      </View>

      {/* ── Stats row ─────────────────────────────── */}
      <View style={[styles.card, styles.statsCard]}>
        <StatItem label="Posts" value={stats?.posts ?? 0} />
        <View style={styles.statDivider} />
        <StatItem label="Events" value={stats?.eventsAttended ?? 0} />
        <View style={styles.statDivider} />
        <StatItem label="Bookmarks" value={stats?.resourcesBookmarked ?? 0} />
      </View>

      {/* ── Edit Profile button ───────────────────── */}
      <TouchableOpacity
        ref={editTapRef}
        style={styles.editBtn}
        onPress={handleEdit}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <Ionicons name="create-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* ── Bio ───────────────────────────────────── */}
      {!!bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        </View>
      )}

      {/* ── Competing Events ─────────────────────── */}
      {events?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPETING IN</Text>
          <View style={styles.card}>
            {events.map((evt, idx) => (
              <View key={evt} style={[styles.eventRow, idx > 0 && styles.eventRowBorder]}>
                <View style={styles.eventDot} />
                <Text style={styles.eventText}>{evt}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Achievements ─────────────────────────── */}
      {achievements?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementScroll}
          >
            {achievements.map((ach) => (
              <AchievementBadge key={ach.id} achievement={ach} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Social Links ─────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOCIAL MEDIA</Text>
        <Text style={styles.socialSubtitle}>Connect your social accounts</Text>
        <View style={[styles.card, styles.socialCard]}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <SocialLinkButton
              key={platform.key}
              platform={platform}
              onPress={() =>
                Alert.alert(
                  'Link Account',
                  `To link your ${platform.label} account, go to Edit Profile → Social Links`,
                  [{ text: 'OK' }]
                )
              }
            />
          ))}
        </View>
        <Text style={styles.socialHint}>Tap to link your social media accounts</Text>
      </View>

      {/* ── Member since ─────────────────────────── */}
      {user.memberSince && (
        <Text style={styles.memberSince}>
          FBLA Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      )}

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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  iconBtn: {
    width: SPACING.touchTarget,
    height: SPACING.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  identityBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.bodyText,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  infoBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: SPACING.buttonHeight,
    backgroundColor: COLORS.background,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioText: {
    fontSize: 15,
    color: COLORS.bodyText,
    lineHeight: 22,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  eventRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginRight: SPACING.sm,
  },
  eventText: {
    fontSize: 15,
    color: COLORS.bodyText,
    fontWeight: '500',
  },
  achievementScroll: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1.5,
    minWidth: 96,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.bodyText,
    textAlign: 'center',
    lineHeight: 15,
  },
  socialSubtitle: {
    fontSize: 12,
    color: COLORS.placeholderText,
    marginBottom: SPACING.sm,
  },
  socialCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    opacity: 0.5,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  socialHint: {
    fontSize: 11,
    color: COLORS.placeholderText,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  memberSince: {
    marginTop: SPACING.xl,
    fontSize: 12,
    color: COLORS.placeholderText,
    textAlign: 'center',
  },
});
