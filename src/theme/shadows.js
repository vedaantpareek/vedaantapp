import { Platform } from 'react-native';

const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
  elevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#1B3A6B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
};

export default SHADOWS;
