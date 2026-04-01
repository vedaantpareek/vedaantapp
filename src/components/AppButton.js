import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import SHADOWS from '../theme/shadows';

/**
 * AppButton — Primary reusable button component.
 * Variants: 'primary', 'secondary', 'ghost'
 * Supports loading state, disabled state, and left/right icons.
 * Animated spring press feedback (scale 0.97).
 */
export default function AppButton({
  label,
  onPress,
  variant,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'ghost' && styles.labelGhost,
    isDisabled && styles.labelDisabled,
    labelStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? COLORS.white : COLORS.primary}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={textStyle}>{label}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

AppButton.propTypes = {
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

AppButton.defaultProps = {
  variant: 'primary',
  loading: false,
  disabled: false,
  onPress: () => {},
};

const styles = StyleSheet.create({
  base: {
    minHeight: SPACING.buttonHeight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.button,
  },
  secondary: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelPrimary: {
    color: COLORS.white,
  },
  labelSecondary: {
    color: COLORS.primary,
  },
  labelGhost: {
    color: COLORS.primary,
  },
  labelDisabled: {
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
});
