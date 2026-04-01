import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';

/**
 * AppInputField — Fully-featured text input with label, error, char counter,
 * focus state styling, secure entry toggle, and right icon support.
 */
export default function AppInputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength,
  secureTextEntry,
  rightIcon,
  onRightIconPress,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  editable,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  testID,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const isSecure = secureTextEntry && !showPassword;

  const containerStyle = [
    styles.inputContainer,
    focused && styles.inputFocused,
    error && styles.inputError,
    !editable && styles.inputDisabled,
  ];

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={containerStyle}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholderText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconTouch}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.secondaryText}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconTouch}
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : (
          <View />
        )}
        {maxLength ? (
          <Text style={styles.counter}>
            {value ? value.length : 0}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

AppInputField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  maxLength: PropTypes.number,
  secureTextEntry: PropTypes.bool,
  rightIcon: PropTypes.node,
  onRightIconPress: PropTypes.func,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  autoCorrect: PropTypes.bool,
  editable: PropTypes.bool,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

AppInputField.defaultProps = {
  value: '',
  secureTextEntry: false,
  keyboardType: 'default',
  autoCapitalize: 'none',
  autoCorrect: false,
  editable: true,
  multiline: false,
  numberOfLines: 4,
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bodyText,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: SPACING.inputHeight,
    paddingHorizontal: SPACING.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.bodyText,
    paddingVertical: SPACING.sm,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  rightIconTouch: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    flex: 1,
  },
  counter: {
    fontSize: 12,
    color: COLORS.placeholderText,
    marginLeft: SPACING.sm,
  },
});
