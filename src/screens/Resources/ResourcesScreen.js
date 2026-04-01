import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import RESOURCES from '../../data/resources.json';
import { SCREENS } from '../../utils/constants';
import { useTapRegistration } from '../../hooks/useTapRegistration';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOKMARKS_KEY = '@connectfbla_bookmarks';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'global', label: 'Global' },
  { key: 'mobile-app-dev', label: 'Mobile App Dev' },
  { key: 'website-design', label: 'Website Design' },
];

// Map each resource type to an Ionicons name and a color from COLORS
const FILE_TYPE_CONFIG = {
  pdf:      { icon: 'document-text', color: COLORS.error },
  document: { icon: 'document',      color: COLORS.info },
  link:     { icon: 'link',          color: COLORS.success },
  video:    { icon: 'play-circle',   color: COLORS.badgeResources },
};

// Category display labels (JSON uses full strings, not slugs)
const CATEGORY_DISPLAY = {
  global:                        'Global',
  'Mobile Application Development': 'Mobile App Dev',
  'Website Design':              'Website Design',
};

// Category badge background/text colours
const CATEGORY_BADGE_COLORS = {
  global:                        { bg: COLORS.badgeNational,  text: COLORS.white },
  'Mobile Application Development': { bg: COLORS.badgeResources, text: COLORS.white },
  'Website Design':              { bg: COLORS.badgeNLC,       text: COLORS.white },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the icon config for a given resource type */
function getFileTypeConfig(type) {
  return FILE_TYPE_CONFIG[type] ?? { icon: 'document-outline', color: COLORS.secondaryText };
}

/** Format ISO date string to human-readable short date */
function formatDate(isoString) {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

/** Returns true if a resource matches the active filter option */
function matchesFilter(resource, activeFilter) {
  if (activeFilter === 'all') return true;

  const cat = (resource.category ?? '').toLowerCase();
  const tags = (resource.tags ?? []).map((t) => t.toLowerCase());

  if (activeFilter === 'global') {
    return cat === 'global';
  }

  if (activeFilter === 'mobile-app-dev') {
    return (
      cat === 'mobile application development' ||
      cat === 'mobile-app-dev' ||
      tags.includes('mobile') ||
      tags.includes('app development')
    );
  }

  if (activeFilter === 'website-design') {
    return (
      cat === 'website design' ||
      cat === 'website-design' ||
      tags.includes('website') ||
      tags.includes('web design')
    );
  }

  return false;
}

/** Returns true if a resource matches the search query */
function matchesSearch(resource, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const inTitle  = (resource.title  ?? '').toLowerCase().includes(q);
  const inAuthor = (resource.author ?? '').toLowerCase().includes(q);
  const inTags   = (resource.tags ?? []).some((t) => t.toLowerCase().includes(q));
  return inTitle || inAuthor || inTags;
}

// ---------------------------------------------------------------------------
// ResourceRow (inline card component)
// ---------------------------------------------------------------------------

function ResourceRow({ resource, isBookmarked, onPress, onBookmarkToggle }) {
  const { icon, color } = getFileTypeConfig(resource.type);
  const badgeColors = CATEGORY_BADGE_COLORS[resource.category] ?? {
    bg: COLORS.surface,
    text: COLORS.secondaryText,
  };
  const categoryLabel = CATEGORY_DISPLAY[resource.category] ?? resource.category;
  const tapRef = useTapRegistration(`resource-${resource.id}`, () => onPress(resource));

  return (
    <TouchableOpacity
      ref={tapRef}
      style={styles.rowCard}
      onPress={() => onPress(resource)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open resource: ${resource.title}`}
    >
      {/* Left: file type icon */}
      <View style={[styles.rowIconWrap, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      {/* Centre: text content */}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {resource.title}
        </Text>

        <Text style={styles.rowMeta} numberOfLines={1}>
          {resource.author}
          {resource.dateAdded ? `  ·  ${formatDate(resource.dateAdded)}` : ''}
        </Text>

        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: badgeColors.bg }]}>
          <Text style={[styles.categoryBadgeText, { color: badgeColors.text }]}>
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Right: bookmark icon (tappable) */}
      <TouchableOpacity
        style={styles.rowBookmarkWrap}
        onPress={() => onBookmarkToggle(resource.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={isBookmarked ? COLORS.gold : COLORS.placeholderText}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Filter Modal (bottom sheet style)
// ---------------------------------------------------------------------------

function FilterModal({ visible, activeFilter, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close filter menu"
      />
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Filter Resources</Text>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = activeFilter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={styles.modalRow}
              onPress={() => {
                onSelect(option.key);
                onClose();
              }}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${option.label}`}
            >
              <Text style={[styles.modalRowLabel, isSelected && styles.modalRowLabelActive]}>
                {option.label}
              </Text>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={isSelected ? COLORS.primary : COLORS.placeholderText}
              />
            </TouchableOpacity>
          );
        })}
        <View style={styles.modalBottomPad} />
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={48} color={COLORS.placeholderText} />
      <Text style={styles.emptyTitle}>No resources found</Text>
      <Text style={styles.emptySubtitle}>Try a different filter or search term.</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ResourcesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState({});

  // Load bookmarks from AsyncStorage whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      AsyncStorage.getItem(BOOKMARKS_KEY)
        .then((raw) => {
          if (!isActive) return;
          if (raw) {
            try {
              setBookmarks(JSON.parse(raw));
            } catch {
              setBookmarks({});
            }
          } else {
            // Seed from JSON defaults
            const defaults = {};
            RESOURCES.forEach((r) => {
              if (r.isBookmarked) defaults[r.id] = true;
            });
            setBookmarks(defaults);
          }
        })
        .catch(() => {
          if (isActive) setBookmarks({});
        });
      return () => {
        isActive = false;
      };
    }, []),
  );

  // Toggle a single bookmark and persist
  const handleBookmarkToggle = useCallback(
    async (resourceId) => {
      const updated = { ...bookmarks, [resourceId]: !bookmarks[resourceId] };
      setBookmarks(updated);
      try {
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
    },
    [bookmarks],
  );

  const filteredResources = useMemo(() => {
    const matched = RESOURCES.filter(
      (r) => matchesFilter(r, activeFilter) && matchesSearch(r, searchQuery),
    );
    // Bookmarked items first, then by date descending
    return matched.sort((a, b) => {
      const aBm = bookmarks[a.id] ? 1 : 0;
      const bBm = bookmarks[b.id] ? 1 : 0;
      if (bBm !== aBm) return bBm - aBm;
      // Secondary sort: newer dateAdded first
      const aDate = a.dateAdded ?? '';
      const bDate = b.dateAdded ?? '';
      return bDate.localeCompare(aDate);
    });
  }, [activeFilter, searchQuery, bookmarks]);

  const handleRowPress = useCallback(
    (resource) => {
      navigation.navigate(SCREENS.RESOURCE_DETAIL, { resource });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ResourceRow
        resource={item}
        isBookmarked={!!bookmarks[item.id]}
        onPress={handleRowPress}
        onBookmarkToggle={handleBookmarkToggle}
      />
    ),
    [handleRowPress, handleBookmarkToggle, bookmarks],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // Label shown on filter button when a non-default filter is active
  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.key === activeFilter)?.label ?? 'All';
  const isFiltered = activeFilter !== 'all';

  return (
    <View style={styles.container}>
      {/* ---- Header ---- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>

        {/* Search bar row: filter icon + search input + clear button */}
        <View style={styles.searchRow}>
          {/* Filter icon button (left of search bar) */}
          <TouchableOpacity
            style={[styles.filterIconBtn, isFiltered && styles.filterIconBtnActive]}
            onPress={() => setFilterModalVisible(true)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel={`Filter resources. Current: ${activeFilterLabel}`}
          >
            <Ionicons
              name="filter"
              size={18}
              color={isFiltered ? COLORS.white : COLORS.primary}
            />
          </TouchableOpacity>

          {/* Search icon inside input area */}
          <View style={styles.searchInputWrap}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.placeholderText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, author or tag…"
              placeholderTextColor={COLORS.placeholderText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              accessibilityLabel="Search resources"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={18} color={COLORS.placeholderText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Active filter label pill (shown when not "All") */}
        {isFiltered && (
          <View style={styles.activeFilterPill}>
            <Text style={styles.activeFilterPillText}>{activeFilterLabel}</Text>
            <TouchableOpacity
              onPress={() => setActiveFilter('all')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Clear filter"
            >
              <Ionicons name="close-circle" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ---- Resource list ---- */}
      <FlatList
        data={filteredResources}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={
          filteredResources.length === 0
            ? styles.listEmptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      {/* ---- Filter Modal ---- */}
      <FilterModal
        visible={filterModalVisible}
        activeFilter={activeFilter}
        onSelect={setActiveFilter}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.screenPadding,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },

  // Search row (filter icon + input wrapper)
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Filter icon button
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  filterIconBtnActive: {
    backgroundColor: COLORS.primaryDark ?? COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // Search input wrapper
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    height: 42,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.bodyText,
    paddingVertical: 0,
  },

  // Active filter pill shown below search row
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs,
    gap: 4,
  },
  activeFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },

  // List
  listContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  listEmptyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },

  // Resource row card
  rowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.itemGap,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bodyText,
    lineHeight: 20,
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  rowBookmarkWrap: {
    paddingTop: 2,
    flexShrink: 0,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.placeholderText,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Filter modal (bottom sheet style)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bodyText,
    marginBottom: SPACING.sm,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowLabel: {
    fontSize: 15,
    color: COLORS.bodyText,
    fontWeight: '500',
  },
  modalRowLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalBottomPad: {
    height: SPACING.xl + 10,
  },
});
