import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import EVENTS from '../../data/events.json';
import { SCREENS, APP_DATE_STRING, EVENT_TYPE_COLORS } from '../../utils/constants';
import { useTapRegistration } from '../../hooks/useTapRegistration';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Map event type → Ionicons name */
const TYPE_ICON = {
  conference: 'trophy',
  chapter: 'people',
  deadline: 'alert-circle',
  nlc: 'star',
};

/** Build a single markedDates object from the events array + today selection */
function buildMarkedDates() {
  const marks = {};

  EVENTS.forEach((event) => {
    const { date, type } = event;
    const color = EVENT_TYPE_COLORS[type] || COLORS.secondaryText;

    if (!marks[date]) {
      marks[date] = { dots: [] };
    }

    // Avoid duplicate dot colors for the same date
    const alreadyHasColor = marks[date].dots.some((d) => d.color === color);
    if (!alreadyHasColor) {
      marks[date].dots.push({ key: type, color });
    }
  });

  // Apply selected + gold highlight on APP_DATE_STRING (April 3, 2026)
  marks[APP_DATE_STRING] = {
    ...(marks[APP_DATE_STRING] || { dots: [] }),
    selected: true,
    selectedColor: COLORS.gold,
  };

  return marks;
}

const BASE_MARKED_DATES = buildMarkedDates();

/** Return events for a given date string, sorted by startTime. */
function eventsForDate(dateString) {
  return EVENTS.filter((e) => e.date === dateString);
}

/** Format a date string like "2026-04-03" → "Fri, Apr 3, 2026" */
function formatDisplayDate(dateString) {
  if (!dateString) return '';
  // Parse as local date to avoid UTC offset shifting
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Upcoming events = all events on/after APP_DATE, sorted ascending
const UPCOMING_EVENTS = [...EVENTS]
  .filter((e) => e.date >= APP_DATE_STRING)
  .sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

// ─── Sub-components ─────────────────────────────────────────────────────────

function EventRow({ event, onPress }) {
  const iconName = TYPE_ICON[event.type] || 'calendar';
  const typeColor = EVENT_TYPE_COLORS[event.type] || COLORS.secondaryText;
  const tapRef = useTapRegistration(`event-${event.id}`, () => onPress(event));

  return (
    <TouchableOpacity
      ref={tapRef}
      style={styles.eventRow}
      onPress={() => onPress(event)}
      activeOpacity={0.72}
    >
      {/* Icon badge */}
      <View style={[styles.eventIconBadge, { backgroundColor: typeColor + '1A' }]}>
        <Ionicons name={iconName} size={20} color={typeColor} />
      </View>

      {/* Text block */}
      <View style={styles.eventRowContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.eventMeta}>
          <Ionicons name="time-outline" size={12} color={COLORS.secondaryText} />
          <Text style={styles.eventMetaText}>
            {formatDisplayDate(event.date)}{'  '}
            {event.startTime}
            {event.endTime && event.endTime !== event.startTime ? ` – ${event.endTime}` : ''}
          </Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={12} color={COLORS.secondaryText} />
          <Text style={styles.eventMetaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color={COLORS.placeholderText} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CalendarScreen({ navigation, route }) {
  const jumpToDate = route?.params?.jumpToDate;

  const [selectedDate, setSelectedDate] = useState(
    jumpToDate || APP_DATE_STRING,
  );
  const [markedDates, setMarkedDates] = useState(() => {
    if (jumpToDate && jumpToDate !== APP_DATE_STRING) {
      const initial = { ...BASE_MARKED_DATES };
      // Remove selection from APP_DATE_STRING
      initial[APP_DATE_STRING] = {
        ...(BASE_MARKED_DATES[APP_DATE_STRING] || { dots: [] }),
        selected: false,
      };
      // Highlight the jump-to date in gold
      initial[jumpToDate] = {
        ...(BASE_MARKED_DATES[jumpToDate] || { dots: [] }),
        selected: true,
        selectedColor: COLORS.gold,
      };
      return initial;
    }
    return BASE_MARKED_DATES;
  });

  // When the jumpToDate param changes (e.g. navigating from another screen),
  // move the selection highlight to the new date.
  useEffect(() => {
    if (!jumpToDate) return;

    setSelectedDate(jumpToDate);

    setMarkedDates(() => {
      const updated = {};
      Object.keys(BASE_MARKED_DATES).forEach((key) => {
        updated[key] = { ...BASE_MARKED_DATES[key] };
      });
      // Strip any existing selection
      if (updated[APP_DATE_STRING]) {
        updated[APP_DATE_STRING] = {
          ...updated[APP_DATE_STRING],
          selected: false,
        };
      }
      // Highlight the requested date in gold
      updated[jumpToDate] = {
        ...(updated[jumpToDate] || { dots: [] }),
        selected: true,
        selectedColor: COLORS.gold,
      };
      return updated;
    });
  }, [jumpToDate]);

  // Events shown in the list: if selected date has events, show those; else show all upcoming
  const selectedDateEvents = eventsForDate(selectedDate);
  const listEvents = selectedDateEvents.length > 0 ? selectedDateEvents : UPCOMING_EVENTS;
  const listLabel =
    selectedDateEvents.length > 0
      ? `EVENTS ON ${formatDisplayDate(selectedDate).toUpperCase()}`
      : 'UPCOMING EVENTS';

  const handleDayPress = useCallback(
    (day) => {
      const dateString = day.dateString;
      setSelectedDate(dateString);

      // Update markedDates: keep all base marks, move the selection highlight
      setMarkedDates((prev) => {
        // Strip selection from previous selected date
        const updated = {};
        Object.keys(BASE_MARKED_DATES).forEach((key) => {
          updated[key] = { ...BASE_MARKED_DATES[key] };
        });
        // Add/override selection for tapped date
        updated[dateString] = {
          ...(updated[dateString] || { dots: [] }),
          selected: true,
          selectedColor:
            dateString === APP_DATE_STRING ? COLORS.gold : COLORS.primary,
        };
        return updated;
      });
    },
    [],
  );

  const handleEventPress = useCallback(
    (event) => {
      navigation.navigate(SCREENS.EVENT_DETAIL, { event });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => <EventRow event={item} onPress={handleEventPress} />,
    [handleEventPress],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListHeader = (
    <>
      {/* Calendar */}
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        markedDates={markedDates}
        enableSwipeMonths
        theme={{
          calendarBackground: COLORS.background,
          textSectionTitleColor: COLORS.secondaryText,
          selectedDayBackgroundColor: COLORS.gold,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.gold,
          dayTextColor: COLORS.bodyText,
          textDisabledColor: COLORS.placeholderText,
          dotColor: COLORS.gold,
          selectedDotColor: COLORS.white,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.primary,
          indicatorColor: COLORS.primary,
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(EVENT_TYPE_COLORS)
          .filter(([key]) => key !== 'personal')
          .map(([type, color]) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </View>
          ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Section header for event list */}
      <SectionHeader title={listLabel} count={listEvents.length} />
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={40} color={COLORS.placeholderText} />
      <Text style={styles.emptyText}>No events on this date</Text>
      <Text style={styles.emptySubText}>Tap another day or scroll upcoming events</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={listEvents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
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

  // ── Calendar ──
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // ── Legend ──
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.xs,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── List ──
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.screenPadding + 44 + SPACING.md, // align with text content
  },

  // ── Event row ──
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  eventIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventRowContent: {
    flex: 1,
    gap: 3,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bodyText,
    lineHeight: 19,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    flex: 1,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.placeholderText,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
