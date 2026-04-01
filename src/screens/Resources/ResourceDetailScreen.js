import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOKMARKS_KEY = '@connectfbla_bookmarks';

const FILE_TYPE_CONFIG = {
  pdf:      { icon: 'document-text', color: COLORS.error },
  document: { icon: 'document',      color: COLORS.info },
  link:     { icon: 'link',          color: COLORS.success },
  video:    { icon: 'play-circle',   color: COLORS.badgeResources },
};

// Category display labels matching the full strings used in resources.json
const CATEGORY_DISPLAY = {
  global:                        'Global',
  'Mobile Application Development': 'Mobile App Dev',
  'Website Design':              'Website Design',
};

const CATEGORY_BADGE_COLORS = {
  global:                        { bg: COLORS.badgeNational,  text: COLORS.white },
  'Mobile Application Development': { bg: COLORS.badgeResources, text: COLORS.white },
  'Website Design':              { bg: COLORS.badgeNLC,       text: COLORS.white },
};

const TYPE_DISPLAY = {
  pdf:      'PDF',
  document: 'Document',
  link:     'Link',
  video:    'Video',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFileTypeConfig(type) {
  return FILE_TYPE_CONFIG[type] ?? { icon: 'document-outline', color: COLORS.secondaryText };
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetaItem({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function TagPill({ tag }) {
  return (
    <View style={styles.tagPill}>
      <Text style={styles.tagPillText}>{tag}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Full Article inline viewer
// ---------------------------------------------------------------------------

function FullArticleSection({ fullContent, url }) {
  const [expanded, setExpanded] = useState(false);

  if (!fullContent) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Full Article</Text>
        <Text style={styles.articleUnavailable}>
          Content available at:{'\n'}
          <Text style={styles.articleUrl}>{url ?? 'No URL available'}</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header row with toggle */}
      <TouchableOpacity
        style={styles.articleToggleRow}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse full article' : 'Expand full article'}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.cardTitle}>Full Article</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.secondaryText}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.articleBody}>
          {/* Split on double newlines for paragraph rendering */}
          {fullContent.split('\n\n').map((paragraph, idx) => (
            <Text key={idx} style={styles.articleParagraph}>
              {paragraph.trim()}
            </Text>
          ))}
        </View>
      )}

      {!expanded && (
        <Text style={styles.articlePreview} numberOfLines={2}>
          {fullContent}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ResourceDetailScreen({ route, navigation }) {
  const { resource } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked ?? false);

  const { icon, color } = getFileTypeConfig(resource.type);
  const categoryLabel = CATEGORY_DISPLAY[resource.category] ?? resource.category;
  const typeLabel     = TYPE_DISPLAY[resource.type] ?? resource.type;
  const badgeColors   = CATEGORY_BADGE_COLORS[resource.category] ?? {
    bg: COLORS.surface, text: COLORS.secondaryText,
  };

  // ---- Load bookmark state from AsyncStorage on mount ----
  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const stored = JSON.parse(raw);
            if (typeof stored[resource.id] === 'boolean') {
              setIsBookmarked(stored[resource.id]);
            }
          } catch {
            // Use default from route params
          }
        }
      })
      .catch(() => {
        // Use default from route params
      });
  }, [resource.id]);

  // ---- Bookmark toggle: update state and persist ----
  const handleBookmarkToggle = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !isBookmarked;
    setIsBookmarked(newValue);
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      stored[resource.id] = newValue;
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(stored));
    } catch {
      // Ignore storage errors
    }
  }, [isBookmarked, resource.id]);

  // ---- Share ----
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: resource.title,
        message: `${resource.title}\n${resource.url ?? ''}`,
        url: resource.url,
      });
    } catch {
      // User dismissed the share sheet — no action needed
    }
  }, [resource.title, resource.url]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Large header ---- */}
      <View style={styles.headerSection}>
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: color + '1F' }]}>
          <Ionicons name={icon} size={36} color={color} />
        </View>

        {/* Title */}
        <Text style={styles.resourceTitle}>{resource.title}</Text>

        {/* Category badge */}
        <View style={[styles.headerBadge, { backgroundColor: badgeColors.bg }]}>
          <Text style={[styles.headerBadgeText, { color: badgeColors.text }]}>
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* ---- Metadata card ---- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <View style={styles.metaGrid}>
          <MetaItem label="Author"     value={resource.author ?? '—'} />
          <MetaItem label="Date Added" value={formatDate(resource.dateAdded)} />
          <MetaItem label="Category"   value={categoryLabel} />
          <MetaItem label="Type"       value={typeLabel} />
        </View>
      </View>

      {/* ---- Description card ---- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.descriptionText}>{resource.description}</Text>
      </View>

      {/* ---- Tags ---- */}
      {resource.tags && resource.tags.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tags</Text>
          <View style={styles.tagsRow}>
            {resource.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </View>
        </View>
      )}

      {/* ---- Full Article inline viewer ---- */}
      <FullArticleSection fullContent={resource.fullContent} url={resource.url} />

      {/* ---- Bookmark toggle ---- */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={handleBookmarkToggle}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        accessibilityState={{ selected: isBookmarked }}
      >
        <Ionicons
          name={isBookmarked ? 'star' : 'star-outline'}
          size={20}
          color={isBookmarked ? COLORS.gold : COLORS.secondaryText}
          style={styles.bookmarkIcon}
        />
        <Text style={[styles.bookmarkText, isBookmarked && styles.bookmarkTextActive]}>
          {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
        </Text>
      </TouchableOpacity>

      {/* ---- Share to Chat ---- */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleShare}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Share this resource"
      >
        <Ionicons
          name="share-social-outline"
          size={18}
          color={COLORS.primary}
          style={styles.buttonIcon}
        />
        <Text style={styles.secondaryButtonText}>Share to Chat</Text>
      </TouchableOpacity>

      {/* Bottom padding for tab bar */}
      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  // Header section
  headerSection: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.bodyText,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  headerBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginTop: SPACING.xs,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Cards
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: 14,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  // Metadata grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaItem: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.placeholderText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: COLORS.bodyText,
    fontWeight: '500',
  },

  // Description
  descriptionText: {
    fontSize: 14,
    color: COLORS.bodyText,
    lineHeight: 22,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tagPill: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },

  // Full Article section
  articleToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  articleBody: {
    marginTop: SPACING.xs,
  },
  articleParagraph: {
    fontSize: 14,
    color: COLORS.bodyText,
    lineHeight: 23,
    marginBottom: SPACING.md,
  },
  articlePreview: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  articleUnavailable: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 22,
  },
  articleUrl: {
    fontSize: 13,
    color: COLORS.info,
  },

  // Bookmark toggle
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: SPACING.buttonHeight,
  },
  bookmarkIcon: {
    marginRight: SPACING.xs,
  },
  bookmarkText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  bookmarkTextActive: {
    color: COLORS.gold,
  },

  // Buttons
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.sm,
    borderRadius: 14,
    height: SPACING.buttonHeight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  bottomPad: {
    height: SPACING.lg,
  },
});
