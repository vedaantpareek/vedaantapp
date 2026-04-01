import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import SHADOWS from '../theme/shadows';

/**
 * AppCard — Reusable card container.
 * Variant 'elevated' adds extra shadow.
 * Wraps in TouchableOpacity when onPress is provided.
 */
export default function AppCard({ children, onPress, variant, style }) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

AppCard.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'elevated']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

AppCard.defaultProps = {
  variant: 'default',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.cardPadding,
    ...SHADOWS.card,
  },
  elevated: {
    ...SHADOWS.elevated,
  },
});
