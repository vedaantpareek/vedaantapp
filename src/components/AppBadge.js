import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { CATEGORY_COLORS } from '../utils/constants';
import COLORS from '../theme/colors';

/**
 * AppBadge — Category/chip badge component.
 * Variant 'filled': solid background, white text.
 * Variant 'outline': border + colored text, transparent background.
 */
export default function AppBadge({ category, variant, style }) {
  const color = CATEGORY_COLORS[category] || COLORS.primary;

  const containerStyle = [
    styles.base,
    variant === 'filled' && { backgroundColor: color },
    variant === 'outline' && { borderColor: color, borderWidth: 1.5, backgroundColor: 'transparent' },
    style,
  ];

  const textStyle = [
    styles.label,
    variant === 'filled' && { color: COLORS.white },
    variant === 'outline' && { color },
  ];

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{category.toUpperCase()}</Text>
    </View>
  );
}

AppBadge.propTypes = {
  category: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['filled', 'outline']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

AppBadge.defaultProps = {
  variant: 'filled',
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
