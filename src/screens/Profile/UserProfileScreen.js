import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import { useFriendsStore } from '../../stores/friendsStore';
import { useChatStore } from '../../stores/chatStore';
import AppAvatar from '../../components/AppAvatar';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { SCREENS } from '../../utils/constants';
import USERS from '../../data/users.json';

// ─── Social platforms (display only — always shown grayed out / unlinked) ──────

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: 'logo-instagram' },
  { key: 'linkedin', icon: 'logo-linkedin' },
  { key: 'youtube', icon: 'logo-youtube' },
  { key: 'twitter', icon: 'logo-twitter' },
  { key: 'facebook', icon: 'logo-facebook' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

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

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const isFriend = useFriendsStore((state) => state.friendIds.includes(userId));
  const toggleFriend = useFriendsStore((state) => state.toggleFriend);

  const [reportVisible, setReportVisible] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const profileUser = USERS.find((u) => u.id === userId);
  const isSelf = currentUser?.id === userId;

  // Put the member's name in the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({ title: profileUser?.name || 'Profile' });
  }, [navigation, profileUser]);

  const handleToggleFriend = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFriend(userId);
  }, [toggleFriend, userId]);

  const handleMessage = useCallback(() => {
    if (!profileUser) return;
    const existingDm = useChatStore.getState().getDmByParticipant(userId);
    // Cross-tab navigation into the Connect stack's direct-message screen
    navigation.navigate('ConnectTab', {
      screen: SCREENS.DIRECT_MESSAGE,
      params: {
        dmId: existingDm?.id || null,
        otherUserId: userId,
        otherUserName: profileUser.name,
        otherUserOnline: profileUser.isOnline,
      },
    });
  }, [navigation, profileUser, userId]);

  const openReport = useCallback(() => {
    setReportText('');
    setReportSubmitted(false);
    setReportVisible(true);
  }, []);

  const submitReport = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReportSubmitted(true);
  }, []);

  const closeReport = useCallback(() => {
    setReportVisible(false);
    setReportText('');
    setReportSubmitted(false);
  }, []);

  if (!profileUser) {
    return (
      <View style={styles.missingContainer}>
        <Ionicons name="person-circle-outline" size={56} color={COLORS.border} />
        <Text style={styles.missingText}>This member could not be found.</Text>
      </View>
    );
  }

  const {
    name, username, school, chapter, grade, bio,
    events, achievements, stats, isOnline,
  } = profileUser;

  const EVENT_BADGE_COLORS = [COLORS.success, COLORS.info];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + identity ─────────────────────── */}
        <View style={styles.identityBlock}>
          <AppAvatar name={name} size="xl" online={isOnline} />
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

        {/* ── Action buttons (hidden when viewing yourself) ─── */}
        {!isSelf && (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.friendBtn, isFriend && styles.friendBtnActive]}
                onPress={handleToggleFriend}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isFriend ? `Remove ${name} as friend` : `Add ${name} as friend`}
              >
                <Ionicons
                  name={isFriend ? 'checkmark-circle' : 'person-add'}
                  size={18}
                  color={isFriend ? COLORS.success : COLORS.white}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.friendBtnText, isFriend && styles.friendBtnTextActive]}>
                  {isFriend ? 'Friends' : 'Add Friend'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageBtn}
                onPress={handleMessage}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Message ${name}`}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>

            {/* ── Report ─────────────────────────────── */}
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={openReport}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Report ${name}`}
            >
              <Ionicons name="flag-outline" size={16} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={styles.reportBtnText}>Report this member</Text>
            </TouchableOpacity>
          </>
        )}

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

        {/* ── Stats row ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITY</Text>
          <View style={[styles.card, styles.statsCard]}>
            <StatItem label="Posts" value={stats?.posts ?? 0} />
            <View style={styles.statDivider} />
            <StatItem label="Events" value={stats?.eventsAttended ?? 0} />
            <View style={styles.statDivider} />
            <StatItem label="Bookmarks" value={stats?.resourcesBookmarked ?? 0} />
          </View>
        </View>

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

        {/* ── Social Links — always grayed out (member hasn't linked any) ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOCIAL MEDIA</Text>
          <View style={[styles.card, styles.socialCard]}>
            {SOCIAL_PLATFORMS.map((platform) => (
              <View key={platform.key} style={styles.socialBtn}>
                <Ionicons name={platform.icon} size={22} color={COLORS.placeholderText} />
              </View>
            ))}
          </View>
          <Text style={styles.socialHint}>
            {name.split(' ')[0]} hasn't linked any social media yet
          </Text>
        </View>

        {/* ── Member since ─────────────────────────── */}
        {profileUser.memberSince && (
          <Text style={styles.memberSince}>
            FBLA Member since {new Date(profileUser.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* ── Report modal ─────────────────────────────── */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeReport}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeReport} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalAnchor}
          pointerEvents="box-none"
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {reportSubmitted ? (
              // ── Confirmation state ──
              <View style={styles.reportSuccess}>
                <View style={styles.reportSuccessIcon}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                </View>
                <Text style={styles.reportSuccessTitle}>Reported to an administrator</Text>
                <Text style={styles.reportSuccessSub}>
                  Thanks for keeping ConnectFBLA safe. An administrator will review your report.
                </Text>
                <TouchableOpacity style={styles.reportDoneBtn} onPress={closeReport} activeOpacity={0.85}>
                  <Text style={styles.reportDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Report form ──
              <>
                <Text style={styles.modalTitle}>Report {name}</Text>
                <Text style={styles.modalSubtitle}>
                  Briefly describe what this member did. Your report goes to an administrator.
                </Text>
                <TextInput
                  style={styles.reportInput}
                  value={reportText}
                  onChangeText={setReportText}
                  placeholder="What happened?"
                  placeholderTextColor={COLORS.placeholderText}
                  multiline
                  maxLength={280}
                  autoFocus
                  accessibilityLabel="Report details"
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={closeReport} activeOpacity={0.8}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, !reportText.trim() && styles.modalSubmitBtnDisabled]}
                    onPress={submitReport}
                    disabled={!reportText.trim()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalSubmitText}>Submit Report</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  missingText: { fontSize: 15, color: COLORS.secondaryText },

  identityBlock: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
  gradeText: { fontSize: 13, color: COLORS.secondaryText, marginTop: 4 },
  infoBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  infoBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3 },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  friendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.buttonHeight,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  friendBtnActive: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.success,
  },
  friendBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  friendBtnTextActive: { color: COLORS.success },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.buttonHeight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  messageBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  reportBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.error },

  // Sections
  section: { marginTop: SPACING.lg },
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
  bioText: { fontSize: 15, color: COLORS.bodyText, lineHeight: 22 },

  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  eventRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold, marginRight: SPACING.sm },
  eventText: { fontSize: 15, color: COLORS.bodyText, fontWeight: '500' },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  achievementScroll: { gap: SPACING.sm, paddingVertical: 4 },
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

  // Social (grayed out)
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

  // Report modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalAnchor: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.bodyText },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 4,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  reportInput: {
    minHeight: 90,
    maxHeight: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.bodyText,
    textAlignVertical: 'top',
  },
  modalButtonRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  modalCancelBtn: {
    flex: 1,
    height: SPACING.buttonHeight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.secondaryText },
  modalSubmitBtn: {
    flex: 1,
    height: SPACING.buttonHeight,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnDisabled: { backgroundColor: COLORS.border },
  modalSubmitText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  // Report confirmation
  reportSuccess: { alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  reportSuccessIcon: { marginBottom: SPACING.sm },
  reportSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.bodyText,
    textAlign: 'center',
  },
  reportSuccessSub: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 19,
    paddingHorizontal: SPACING.sm,
  },
  reportDoneBtn: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
    height: SPACING.buttonHeight,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportDoneText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
