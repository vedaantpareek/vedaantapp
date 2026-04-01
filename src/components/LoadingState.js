import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';

/**
 * LoadingState — Centered spinner with optional loading message.
 */
export default function LoadingState({ message, style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

LoadingState.propTypes = {
  message: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 15,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
});
