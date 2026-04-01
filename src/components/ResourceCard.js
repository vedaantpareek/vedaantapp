import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import SHADOWS from '../theme/shadows';
import AppBadge from './AppBadge';

const FILE_TYPE_ICONS = {
  pdf: { name: 'document-text', color: '#E53E3E' },
  doc: { name: 'document', color: '#3182CE' },
  docx: { name: 'document', color: '#3182CE' },
  ppt: { name: 'easel', color: '#DD6B20' },
  pptx: { name: 'easel', color: '#DD6B20' },
  xls: { name: 'grid', color: '#38A169' },
  xlsx: { name: 'grid', color: '#38A169' },
  mp4: { name: 'videocam', color: '#805AD5' },
  link: { name: 'link', color: '#3182CE' },
  default: { name: 'document-outline', color: COLORS.secondaryText },
};

function getFileIcon(fileType) {
  return FILE_TYPE_ICONS[fileType?.toLowerCase()] || FILE_TYPE_ICONS.default;
}

/**
 * ResourceCard — Card for displaying a study resource.
 * Shows title, category badge, description preview, file type icon,
 * bookmark toggle, and share button.
 */
export default function ResourceCard({
  title,
  category,
  description,
  fileType,
  bookmarked,
  onPress,
  onBookmark,
  onShare,
  style,
}) {
  const fileIcon = getFileIcon(fileType);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Resource: ${title}`}
    >
      <View style={styles.header}>
        <View style={styles.fileIconWrapper}>
          <Ionicons name={fileIcon.name} size={28} color={fileIcon.color} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <AppBadge category={category} variant="filled" style={styles.badge} />
        </View>
      </View>

      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={bookmarked ? COLORS.primary : COLORS.secondaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Share resource"
        >
          <Ionicons name="share-social-outline" size={22} color={COLORS.secondaryText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

ResourceCard.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string,
  fileType: PropTypes.string,
  bookmarked: PropTypes.bool,
  onPress: PropTypes.func,
  onBookmark: PropTypes.func,
  onShare: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ResourceCard.defaultProps = {
  bookmarked: false,
  fileType: 'default',
  onPress: () => {},
  onBookmark: () => {},
  onShare: () => {},
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.itemGap,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  fileIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.bodyText,
    marginBottom: 4,
  },
  badge: {
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },
  actionBtn: {
    padding: 4,
  },
});
