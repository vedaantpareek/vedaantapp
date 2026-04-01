import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semiBold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
});

const TYPOGRAPHY = {
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A202C',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1A202C',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4A5568',
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4A5568',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonLabelSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputField: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1A202C',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
    color: '#A0AEC0',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
};

export default TYPOGRAPHY;
