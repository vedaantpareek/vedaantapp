import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatStore } from '../../stores/chatStore';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { CATEGORY_COLORS, APP_DATE, SCREENS } from '../../utils/constants';
import USERS from '../../data/users.json';
import POST_COMMENTS from '../../data/postComments';

const LIKES_STORAGE_KEY = '@connectfbla_liked_posts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFullDate(isoTimestamp) {
  const date = new Date(isoTimestamp);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeAgo(isoTimestamp) {
  const postDate = new Date(isoTimestamp);
  const diffMs = APP_DATE.getTime() - postDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) return 'In 1 day';
    return `In ${futureDays} days`;
  }
  return `${diffDays} days ago`;
}

function getAuthorName(authorId) {
  return USERS.find((u) => u.id === authorId)?.name || 'FBLA Member';
}

function getAuthorInitial(authorId) {
  return getAuthorName(authorId).charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  '#5C6BC0', '#26A69A', '#EF5350', '#AB47BC',
  '#FF7043', '#29B6F6', '#66BB6A', '#FFA726',
];
function avatarColor(authorId) {
  let hash = 0;
  for (let i = 0; i < authorId.length; i++) {
    hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---------------------------------------------------------------------------
// Stats pill sub-component
// ---------------------------------------------------------------------------

function StatPill({ iconName, count, color }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={iconName} size={16} color={color || COLORS.secondaryText} />
      <Text style={[styles.statCount, color ? { color } : null]}>{count}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Comment row sub-component
// ---------------------------------------------------------------------------

function CommentRow({ comment }) {
  const authorId = comment.authorId;
  const name = getAuthorName(authorId);
  const initial = getAuthorInitial(authorId);
  const bg = avatarColor(authorId);
  const timeAgo = formatTimeAgo(comment.timestamp);

  return (
    <View style={styles.commentRow}>
      <View style={[styles.commentAvatar, { backgroundColor: bg }]}>
        <Text style={styles.commentAvatarInitial}>{initial}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentAuthor}>{name}</Text>
          <Text style={styles.commentTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Share-to-channel modal
// ---------------------------------------------------------------------------

function ShareChannelModal({ visible, onClose, channels, onSelectChannel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity style={styles.shareOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.shareSheet}>
        <View style={styles.shareSheetHandle} />
        <Text style={styles.shareSheetTitle}>Share to Channel</Text>
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          style={styles.shareChannelList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.shareChannelRow}
              onPress={() => onSelectChannel(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.shareChannelIcon, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.shareChannelInfo}>
                <Text style={styles.shareChannelName}>{item.name}</Text>
                <Text style={styles.shareChannelMeta}>{item.memberIds.length} members</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondaryText} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.shareChannelSep} />}
        />
        <TouchableOpacity style={styles.shareCancelBtn} onPress={onClose}>
          <Text style={styles.shareCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function AnnouncementDetailScreen({ route, navigation }) {
  const { post } = route.params;

  const channels = useChatStore((state) => state.channels);

  const authorName = USERS.find((u) => u.id === post.authorId)?.name || 'FBLA Member';
  const badgeColor = CATEGORY_COLORS[post.category] || COLORS.primary;
  const baseLikes = Array.isArray(post.likes) ? post.likes.length : post.likes ?? 0;

  const [liked, setLiked] = useState(false);
  const [displayLikes, setDisplayLikes] = useState(baseLikes);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [shareVisible, setShareVisible] = useState(false);
  const scrollRef = useRef(null);

  const commentsStorageKey = `@connectfbla_comments_${post.id}`;
  const countStorageKey = `@connectfbla_comment_count_${post.id}`;

  // Per-post fallback comments (no global seeds — each post has its own)
  const fallbackComments = POST_COMMENTS[post.id] || [];
  const fallbackIds = new Set(fallbackComments.map((c) => c.id));

  // Load liked state and comments on mount
  useEffect(() => {
    AsyncStorage.getItem(LIKES_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored);
          const isLiked = !!parsed[post.id];
          setLiked(isLiked);
          setDisplayLikes(isLiked ? baseLikes + 1 : baseLikes);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(commentsStorageKey)
      .then((stored) => {
        const persisted = stored ? JSON.parse(stored) : [];
        const userComments = persisted.filter((c) => !fallbackIds.has(c.id));
        const merged = [...fallbackComments, ...userComments];
        setComments(merged);
        // Persist the live count so the feed card stays accurate
        AsyncStorage.setItem(countStorageKey, String(merged.length)).catch(() => {});
      })
      .catch(() => {
        setComments([...fallbackComments]);
        AsyncStorage.setItem(countStorageKey, String(fallbackComments.length)).catch(() => {});
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  // Header share button → opens share modal
  useLayoutEffect(() => {
    navigation.setOptions({
      title: post.category,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShareVisible(true)}
          style={styles.headerButton}
          accessibilityLabel="Share this announcement"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, post]);

  const handleShareToChannel = useCallback((channel) => {
    setShareVisible(false);
    const snippet = post.body.length > 200 ? post.body.slice(0, 197) + '…' : post.body;
    navigation.navigate('ConnectTab', {
      screen: SCREENS.GROUP_CHANNEL,
      params: {
        channelId: channel.id,
        channelName: channel.name,
        memberCount: channel.memberIds.length,
        sharedPost: { id: post.id, title: post.title, body: snippet },
      },
    });
  }, [navigation, post]);

  const handleLike = useCallback(async () => {
    await Haptics.impactAsync(
      liked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    const nextLiked = !liked;
    setLiked(nextLiked);
    setDisplayLikes(nextLiked ? baseLikes + 1 : baseLikes);

    try {
      const stored = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify({ ...parsed, [post.id]: nextLiked }));
    } catch (_) {}
  }, [liked, baseLikes, post.id]);

  const handleSubmitComment = useCallback(async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newComment = {
      id: `user_comment_${Date.now()}`,
      authorId: 'user_1',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextComments = [...comments, newComment];
    setComments(nextComments);
    setCommentInput('');

    // Persist user-added comments only
    const toStore = nextComments.filter((c) => !fallbackIds.has(c.id));
    AsyncStorage.setItem(commentsStorageKey, JSON.stringify(toStore)).catch(() => {});
    // Persist total count for the feed card
    AsyncStorage.setItem(countStorageKey, String(nextComments.length)).catch(() => {});

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [commentInput, comments, commentsStorageKey, countStorageKey, fallbackIds]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{post.category}</Text>
          </View>
          {post.isPinned && (
            <View style={styles.pinnedChip}>
              <Ionicons name="pin" size={13} color={COLORS.gold} />
              <Text style={styles.pinnedText}>Pinned</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Author + date row */}
        <View style={styles.metaRow}>
          <View style={[styles.authorAvatar, { backgroundColor: avatarColor(post.authorId) }]}>
            <Text style={styles.authorInitial}>{authorName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.metaText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.metaDate}>
              {formatFullDate(post.timestamp)}
              {'  ·  '}
              {formatTimeAgo(post.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Full body */}
        <Text style={styles.body}>{post.body}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatPill
            iconName={liked ? 'heart' : 'heart-outline'}
            count={displayLikes}
            color={liked ? COLORS.error : null}
          />
          <StatPill iconName="chatbubble-outline" count={comments.length} />
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, liked && styles.actionButtonActive]}
            onPress={handleLike}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike this post' : 'Like this post'}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.actionButtonLabel, liked && styles.actionButtonLabelActive]}>
              {liked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShareVisible(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Share this announcement"
          >
            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Notes card */}
        {!!post.notes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesBody}>{post.notes}</Text>
          </View>
        )}

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
            <Text style={styles.commentsSectionTitle}>Comments</Text>
            <View style={styles.commentsCountBadge}>
              <Text style={styles.commentsCountText}>{comments.length}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {comments.length === 0 ? (
            <View style={styles.noCommentsContainer}>
              <Ionicons name="chatbubble-outline" size={32} color={COLORS.border} />
              <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))
          )}
        </View>

        <View style={styles.bottomBuffer} />
      </ScrollView>

      {/* Comment input bar */}
      <View style={styles.commentInputBar}>
        <TextInput
          style={styles.commentInput}
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder="Add a comment…"
          placeholderTextColor={COLORS.placeholderText}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={handleSubmitComment}
          accessibilityLabel="Add a comment"
        />
        <TouchableOpacity
          style={[styles.commentSendButton, !commentInput.trim() && styles.commentSendButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!commentInput.trim()}
          accessibilityRole="button"
          accessibilityLabel="Post comment"
        >
          <Ionicons
            name="send"
            size={18}
            color={commentInput.trim() ? COLORS.white : COLORS.placeholderText}
          />
        </TouchableOpacity>
      </View>

      {/* Share-to-channel modal */}
      <ShareChannelModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        channels={channels}
        onSelectChannel={handleShareToChannel}
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  pinnedChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinnedText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.bodyText,
    lineHeight: 30,
    marginBottom: SPACING.md,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  authorInitial: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  metaText: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: COLORS.bodyText, marginBottom: 2 },
  metaDate: { fontSize: 12, color: COLORS.secondaryText },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },

  body: {
    fontSize: 15,
    color: COLORS.bodyText,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statCount: { fontSize: 14, fontWeight: '600', color: COLORS.secondaryText },

  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs + 2,
    minHeight: SPACING.touchTarget + 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  actionButtonActive: { backgroundColor: COLORS.error, borderColor: COLORS.error },
  actionButtonLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  actionButtonLabelActive: { color: COLORS.white },

  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs + 2, marginBottom: SPACING.sm },
  notesTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  notesBody: { fontSize: 14, color: COLORS.bodyText, lineHeight: 22 },

  headerButton: {
    paddingRight: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentsSection: { marginBottom: SPACING.md },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  commentsSectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.bodyText },
  commentsCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 2,
  },
  commentsCountText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  noCommentsContainer: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  noCommentsText: { fontSize: 14, color: COLORS.secondaryText, textAlign: 'center' },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarInitial: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  commentBody: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.bodyText },
  commentTime: { fontSize: 11, color: COLORS.secondaryText },
  commentText: { fontSize: 14, color: COLORS.bodyText, lineHeight: 20 },

  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: COLORS.bodyText,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendButtonDisabled: { backgroundColor: COLORS.border },

  bottomBuffer: { height: SPACING.xl },

  // Share modal
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  shareSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '60%',
  },
  shareSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  shareSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bodyText,
    textAlign: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  shareChannelList: { flexGrow: 0 },
  shareChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  shareChannelIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareChannelInfo: { flex: 1 },
  shareChannelName: { fontSize: 15, fontWeight: '600', color: COLORS.bodyText },
  shareChannelMeta: { fontSize: 12, color: COLORS.secondaryText, marginTop: 1 },
  shareChannelSep: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.screenPadding + 42 + SPACING.sm },
  shareCancelBtn: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  shareCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.secondaryText },
});
