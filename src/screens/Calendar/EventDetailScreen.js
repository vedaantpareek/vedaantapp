import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { EVENT_TYPE_COLORS } from '../../utils/constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map event type → Ionicons name */
const TYPE_ICON = {
  conference: 'trophy',
  chapter: 'people',
  deadline: 'alert-circle',
  nlc: 'star',
  personal: 'person-circle',
};

/** Human-readable label for event type */
const TYPE_LABEL = {
  conference: 'Conference',
  chapter: 'Chapter Event',
  deadline: 'Deadline',
  nlc: 'NLC',
  personal: 'Personal',
};

/**
 * Format "2026-04-03" → "Friday, April 3, 2026"
 * Parsed as local date to avoid UTC-shift issues.
 */
function formatFullDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Produce a share-friendly date + time string */
function formatShareDateTime(event) {
  const date = formatFullDate(event.date);
  if (event.startTime && event.endTime && event.startTime !== event.endTime) {
    return `${date}, ${event.startTime} – ${event.endTime}`;
  }
  if (event.startTime) return `${date}, ${event.startTime}`;
  return date;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ iconName, iconColor, label, value, valueStyle }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function CardTitle({ children }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EventDetailScreen({ route }) {
  const { event } = route.params;

  const typeColor = EVENT_TYPE_COLORS[event.type] || COLORS.primary;
  const iconName = TYPE_ICON[event.type] || 'calendar';
  const typeLabel = TYPE_LABEL[event.type] || event.type;

  const [rsvped, setRsvped] = useState(event.isRsvped ?? false);

  const handleRsvpToggle = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRsvped((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: event.title,
        message: [
          event.title,
          formatShareDateTime(event),
          event.location,
        ].join('\n'),
      });
    } catch {
      // User cancelled — do nothing
    }
  }, [event]);

  const handleAddToCalendar = useCallback(() => {
    Alert.alert(
      'Added to Calendar',
      'Added to your device calendar.',
      [{ text: 'OK' }],
    );
  }, []);

  const hasNotes = event.notes && event.notes.trim().length > 0;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero header ──────────────────────────────────────────────── */}
      <View style={[styles.hero, { backgroundColor: typeColor }]}>
        {/* Icon circle */}
        <View style={styles.heroIconCircle}>
          <Ionicons name={iconName} size={34} color={typeColor} />
        </View>

        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>{event.title}</Text>
      </View>

      {/* ── Info card ────────────────────────────────────────────────── */}
      <Card style={styles.infoCard}>
        <InfoRow
          iconName="calendar"
          iconColor={COLORS.primary}
          label="Date & Time"
          value={
            event.startTime && event.endTime && event.startTime !== event.endTime
              ? `${formatFullDate(event.date)}\n${event.startTime} – ${event.endTime}`
              : event.startTime
              ? `${formatFullDate(event.date)}\n${event.startTime}`
              : formatFullDate(event.date)
          }
        />

        <View style={styles.infoSeparator} />

        <InfoRow
          iconName="location"
          iconColor={COLORS.error}
          label="Location"
          value={event.location}
        />

        <View style={styles.infoSeparator} />

        {/* Type row with colored badge instead of plain text */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconWrap, { backgroundColor: typeColor + '18' }]}>
            <Ionicons name={iconName} size={18} color={typeColor} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Event Type</Text>
            <View style={[styles.eventTypePill, { backgroundColor: typeColor + '20', borderColor: typeColor + '50' }]}>
              <Text style={[styles.eventTypePillText, { color: typeColor }]}>{typeLabel}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* ── Description card ─────────────────────────────────────────── */}
      {event.description ? (
        <Card>
          <CardTitle>About This Event</CardTitle>
          <Text style={styles.bodyText}>{event.description}</Text>
        </Card>
      ) : null}

      {/* ── Notes card (conditional) ──────────────────────────────────── */}
      {hasNotes && (
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.warning} />
            <CardTitle>My Notes</CardTitle>
          </View>
          <Text style={styles.notesText}>{event.notes}</Text>
        </Card>
      )}

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <View style={styles.actionsBlock}>
        {/* RSVP button */}
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            rsvped ? styles.rsvpButtonActive : styles.rsvpButtonInactive,
          ]}
          onPress={handleRsvpToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name={rsvped ? 'checkmark-circle' : 'calendar-outline'}
            size={20}
            color={rsvped ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.rsvpButtonText,
              rsvped ? styles.rsvpButtonTextActive : styles.rsvpButtonTextInactive,
            ]}
          >
            {rsvped ? "RSVP'd ✓" : 'RSVP for This Event'}
          </Text>
        </TouchableOpacity>

        {/* Secondary row: Share + Add to Calendar */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Ionicons name="share-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>

          <View style={styles.secondaryDivider} />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddToCalendar}
            activeOpacity={0.75}
          >
            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg + SPACING.xl, // extra so the card overlaps
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.sm,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    // Subtle shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs - 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.white, // overridden inline when needed
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 27,
    marginTop: SPACING.xs,
  },

  // ── Cards ──
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: 14,
    padding: SPACING.cardPadding,
    // Shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCard: {
    marginTop: -SPACING.xl, // pull up over the hero gradient
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.bodyText,
    lineHeight: 21,
  },

  // ── Info rows ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.placeholderText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.bodyText,
    lineHeight: 20,
    fontWeight: '400',
  },
  infoSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
    marginLeft: 36 + SPACING.md,
  },

  // ── Event type pill ──
  eventTypePill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    marginTop: 2,
  },
  eventTypePillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Notes card ──
  notesCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // ── Actions ──
  actionsBlock: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.buttonHeight,
    borderRadius: 14,
    gap: SPACING.sm,
  },
  rsvpButtonActive: {
    backgroundColor: COLORS.success,
  },
  rsvpButtonInactive: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  rsvpButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  rsvpButtonTextActive: {
    color: COLORS.white,
  },
  rsvpButtonTextInactive: {
    color: COLORS.primary,
  },

  // ── Secondary action row ──
  secondaryActions: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    height: SPACING.buttonHeight,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  secondaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});
