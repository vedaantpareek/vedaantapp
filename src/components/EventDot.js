import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

/**
 * EventDot — Small colored dot for calendar date cells.
 * Shows up to 3 dots side by side for multiple events on the same day.
 */
export default function EventDot({ colors, style }) {
  const visibleColors = colors.slice(0, 3);

  return (
    <View style={[styles.row, style]}>
      {visibleColors.map((color, index) => (
        <View
          key={index}
          style={[styles.dot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

EventDot.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

EventDot.defaultProps = {
  colors: [],
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
