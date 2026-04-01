import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import { SCREENS, APP_TAGLINE, SCHOOL_NAME, CHAPTER_NAME } from '../../utils/constants';
import AppButton from '../../components/AppButton';

const { height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    const timing = (duration, delay = 0) =>
      withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    const slide = (duration, delay = 0) =>
      withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));

    logoOpacity.value = timing(600, 100);
    logoTranslateY.value = slide(600, 100);
    titleOpacity.value = timing(600, 300);
    titleTranslateY.value = slide(600, 300);
    taglineOpacity.value = timing(600, 500);
    buttonsOpacity.value = timing(600, 700);
    buttonsTranslateY.value = slide(600, 700);
    footerOpacity.value = timing(600, 900);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Logo + Branding */}
        <View style={styles.brandingSection}>
          <Animated.View style={[styles.logoWrapper, logoStyle]}>
            <Ionicons name="people-circle" size={100} color={COLORS.gold} />
          </Animated.View>

          <Animated.View style={titleStyle}>
            <Text style={styles.appName}>ConnectFBLA</Text>
          </Animated.View>

          <Animated.View style={taglineStyle}>
            <Text style={styles.tagline}>{APP_TAGLINE}</Text>
          </Animated.View>
        </View>

        {/* Feature highlights */}
        <Animated.View style={[styles.featuresSection, taglineStyle]}>
          <FeatureRow icon="newspaper-outline" text="Stay up-to-date with chapter announcements" />
          <FeatureRow icon="calendar-outline" text="Never miss a conference or deadline" />
          <FeatureRow icon="library-outline" text="Access study resources and competitive event tips" />
          <FeatureRow icon="chatbubbles-outline" text="Connect with your chapter members" />
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonsSection, buttonsStyle]}>
          <AppButton
            label="Get Started"
            onPress={() => navigation.navigate(SCREENS.LOGIN)}
            variant="primary"
            style={styles.getStartedButton}
            labelStyle={styles.getStartedLabel}
          />

          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation.navigate(SCREENS.LOGIN)}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
          >
            <Text style={styles.signInText}>Already have an account? </Text>
            <Text style={styles.signInTextBold}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerStyle]}>
          <Text style={styles.footerText}>{SCHOOL_NAME} · {CHAPTER_NAME}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={20} color={COLORS.gold} style={styles.featureIcon} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  brandingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  logoWrapper: {
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 17,
    fontStyle: 'italic',
    color: COLORS.gold,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    marginRight: SPACING.md,
    width: 24,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    lineHeight: 20,
  },
  buttonsSection: {
    paddingBottom: SPACING.lg,
  },
  getStartedButton: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  getStartedLabel: {
    color: COLORS.primary,
  },
  signInLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  signInText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  signInTextBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  footer: {
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
});
