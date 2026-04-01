import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { SCREENS, CATEGORY_COLORS, CATEGORY_EMOJI, APP_DATE, COMPETITOR_NAME } from '../../utils/constants';
import POSTS from '../../data/posts.json';
import USERS from '../../data/users.json';
import { useTapRegistration } from '../../hooks/useTapRegistration';

const LIKES_STORAGE_KEY = '@connectfbla_liked_posts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(isoTimestamp) {
  const postDate = new Date(isoTimestamp);
  const diffMs = APP_DATE.getTime() - postDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

function getSortedPosts() {
  return [...POSTS].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}

// ---------------------------------------------------------------------------
// Quick action data
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', tab: 'CalendarTab' },
  { id: 'resources', label: 'Resources', icon: 'library', tab: 'ResourcesTab' },
  { id: 'chat', label: 'Connect', icon: 'chatbubbles', tab: 'ConnectTab' },
  { id: 'profile', label: 'My Profile', icon: 'person', tab: 'ProfileTab' },
  { id: 'conference', label: 'State Conf.', icon: 'trophy', tab: 'CalendarTab', isConference: true },
];

// ---------------------------------------------------------------------------
// Social media data — real FBLA national handles
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E1306C',
    url: 'https://www.instagram.com/fbla_national/',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#0077B5',
    url: 'https://www.linkedin.com/company/future-business-leaders-america/',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'logo-youtube',
    color: '#FF0000',
    url: 'https://www.youtube.com/@fbla_national',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    url: 'https://twitter.com/fbla_national',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    url: 'https://www.facebook.com/FutureBusinessLeaders',
  },
];

// ---------------------------------------------------------------------------
// PostCard sub-component
// ---------------------------------------------------------------------------

function PostCard({ post, liked, commentCount, onPress, onLike }) {
  const authorName = USERS.find((u) => u.id === post.authorId)?.name || 'FBLA Member';
  const timeAgo = formatTimeAgo(post.timestamp);
  const badgeColor = CATEGORY_COLORS[post.category] || COLORS.primary;
  const baseLikes = Array.isArray(post.likes) ? post.likes.length : post.likes ?? 0;
  const displayLikes = liked ? baseLikes + 1 : baseLikes;
  const tapRef = useTapRegistration(`post-${post.id}`, onPress);

  return (
    <TouchableOpacity
      ref={tapRef}
      style={[styles.card, post.isPinned && styles.cardPinned]}
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`Post: ${post.title}`}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {CATEGORY_EMOJI[post.category] ? `${CATEGORY_EMOJI[post.category]} ` : ''}{post.category.toUpperCase()}
          </Text>
        </View>
        {post.isPinned && (
          <View style={styles.pinnedChip}>
            <Ionicons name="pin" size={12} color={COLORS.gold} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
      <Text style={styles.cardBody} numberOfLines={2}>{post.body}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {authorName}
          <Text style={styles.cardMetaDot}> · </Text>
          {timeAgo}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={onLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={15}
              color={liked ? COLORS.error : COLORS.secondaryText}
            />
            <Text style={[styles.actionCount, liked && { color: COLORS.error }]}>
              {displayLikes}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={15} color={COLORS.secondaryText} />
            <Text style={styles.actionCount}>{commentCount ?? post.commentCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickActionBtn({ action, onPress }) {
  const tapRef = useTapRegistration(`quick-${action.id}`, onPress);
  return (
    <TouchableOpacity
      ref={tapRef}
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={action.icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={1}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const SORTED_POSTS = getSortedPosts();
// First name only: "Vedaant Pareek" → "Vedaant"
const FIRST_NAME = COMPETITOR_NAME.split(' ')[0];

export default function NewsFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});

  // Load persisted likes on mount
  useEffect(() => {
    AsyncStorage.getItem(LIKES_STORAGE_KEY)
      .then((stored) => {
        if (stored) setLikedPosts(JSON.parse(stored));
      })
      .catch(() => {});
  }, []);

  // Re-read likes and comment counts every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(LIKES_STORAGE_KEY)
        .then((stored) => {
          if (stored) setLikedPosts(JSON.parse(stored));
        })
        .catch(() => {});

      // Load live comment counts (updated whenever a detail screen is opened)
      Promise.all(
        SORTED_POSTS.map(async (post) => {
          const stored = await AsyncStorage.getItem(`@connectfbla_comment_count_${post.id}`);
          return [post.id, stored ? parseInt(stored, 10) : post.commentCount];
        })
      )
        .then((entries) => setCommentCounts(Object.fromEntries(entries)))
        .catch(() => {});
    }, []),
  );

  const handleLike = useCallback((postId) => {
    setLikedPosts((prev) => {
      const next = { ...prev, [postId]: !prev[postId] };
      AsyncStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleCardPress = useCallback(
    (post) => navigation.navigate(SCREENS.ANNOUNCEMENT_DETAIL, { post }),
    [navigation],
  );

  const handleQuickAction = useCallback(
    (action) => {
      if (action.isConference) {
        navigation.navigate('CalendarTab', {
          screen: SCREENS.CALENDAR,
          params: { jumpToDate: '2026-04-03' },
        });
      } else {
        navigation.navigate(action.tab);
      }
    },
    [navigation],
  );

  const handleSocialPress = useCallback((url) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  // ---- List header: welcome + quick actions + social section header ----
  const ListHeader = (
    <View>
      {/* Welcome banner — paddingTop clears status bar notch */}
      <View style={[styles.welcomeBanner, { paddingTop: insets.top + SPACING.lg }]}>
        <View>
          <Text style={styles.welcomeGreeting}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{FIRST_NAME}! 👋</Text>
        </View>
        <Image
          source={require('../../../fblaemblem.png')}
          style={styles.welcomeEmblem}
          resizeMode="contain"
        />
      </View>

      {/* Quick actions */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionBtn
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action)}
            />
          ))}
        </View>
      </View>

      {/* Social media */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>FBLA NATIONAL — FOLLOW US</Text>
        <View style={styles.socialRow}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.socialButton}
              onPress={() => handleSocialPress(platform.url)}
              activeOpacity={0.75}
              accessibilityRole="link"
              accessibilityLabel={`Open FBLA on ${platform.label}`}
            >
              <View style={[styles.socialIconCircle, { backgroundColor: platform.color }]}>
                <Ionicons name={platform.icon} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.socialLabel} numberOfLines={1}>
                {platform.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* News feed header */}
      <View style={styles.feedHeaderRow}>
        <Text style={styles.feedLabel}>ANNOUNCEMENTS</Text>
        <View style={styles.feedCount}>
          <Text style={styles.feedCountText}>{SORTED_POSTS.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        liked={!!likedPosts[item.id]}
        commentCount={commentCounts[item.id] ?? item.commentCount}
        onPress={() => handleCardPress(item)}
        onLike={() => handleLike(item.id)}
      />
    ),
    [likedPosts, handleCardPress, handleLike],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.screen}>
      <FlatList
        data={SORTED_POSTS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={56} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Announcements Yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for the latest FBLA news.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  listContent: {
    paddingBottom: SPACING.xl + 8,
  },

  // Welcome banner
  welcomeBanner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 2,
  },
  welcomeEmblem: {
    width: 44,
    height: 44,
  },

  // Section blocks
  sectionBlock: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '18%',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.bodyText,
    textAlign: 'center',
  },

  // Social media
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    alignItems: 'center',
    width: '18%',
  },
  socialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  socialLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.secondaryText,
    textAlign: 'center',
  },

  // Feed header
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  feedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
  },
  feedCount: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
    alignSelf: 'center',
  },
  feedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Post card
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.screenPadding,
    borderRadius: 12,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardPinned: {
    borderColor: COLORS.gold,
    borderWidth: 1.5,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  pinnedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pinnedText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bodyText,
    lineHeight: 22,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
    marginBottom: SPACING.sm + 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.secondaryText,
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardMetaDot: {
    color: COLORS.placeholderText,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: SPACING.touchTarget,
  },
  actionCount: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
  separator: {
    height: SPACING.sm + 4,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.bodyText,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
