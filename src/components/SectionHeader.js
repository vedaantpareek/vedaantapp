import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import TYPOGRAPHY from '../theme/typography';

/**
 * SectionHeader — Consistent section heading with optional "See All" action.
 */
export default function SectionHeader({ title, onSeeAll, seeAllLabel, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={seeAllLabel}
        >
          <Text style={styles.seeAll}>{seeAllLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onSeeAll: PropTypes.func,
  seeAllLabel: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

SectionHeader.defaultProps = {
  seeAllLabel: 'See All',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.sectionHeader,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
