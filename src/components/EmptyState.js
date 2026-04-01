import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import TYPOGRAPHY from '../theme/typography';
import AppButton from './AppButton';

/**
 * EmptyState — Centered empty state with icon, title, subtitle, and optional action button.
 */
export default function EmptyState({
  icon,
  title,
  subtitle,
  buttonLabel,
  onButtonPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={icon}
        size={64}
        color={COLORS.secondaryText}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {buttonLabel && onButtonPress ? (
        <AppButton
          label={buttonLabel}
          onPress={onButtonPress}
          variant="primary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  buttonLabel: PropTypes.string,
  onButtonPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  icon: {
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  title: {
    ...TYPOGRAPHY.heading3,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 160,
    marginTop: SPACING.sm,
  },
});
