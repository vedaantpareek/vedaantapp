import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';

const AVATAR_COLORS = [
  '#1B3A6B', '#38A169', '#C9A84C', '#E53E3E', '#805AD5',
  '#DD6B20', '#3182CE', '#D53F8C', '#2C7A7B', '#744210',
];

const SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZES = {
  sm: 12,
  md: 15,
  lg: 20,
  xl: 28,
};

/**
 * Derives initials from a full name string.
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Deterministically selects a background color from the name string.
 */
function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * AppAvatar — Circular avatar component.
 * Shows image if imageUri provided, else shows initials on colored background.
 * Optional online indicator dot.
 */
export default function AppAvatar({ name, imageUri, size, online, style }) {
  const dimension = SIZES[size] || SIZES.md;
  const fontSize = FONT_SIZES[size] || FONT_SIZES.md;
  const bgColor = getAvatarColor(name);
  const initials = getInitials(name);
  const dotSize = Math.max(10, dimension * 0.25);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.avatar,
          { width: dimension, height: dimension, borderRadius: dimension / 2, backgroundColor: bgColor },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        )}
      </View>
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

AppAvatar.propTypes = {
  name: PropTypes.string,
  imageUri: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  online: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

AppAvatar.defaultProps = {
  name: '',
  size: 'md',
  online: false,
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: COLORS.white,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
});
