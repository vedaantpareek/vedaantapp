import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import TYPOGRAPHY from '../../theme/typography';
import { SCREENS } from '../../utils/constants';
import AppInputField from '../../components/AppInputField';
import AppButton from '../../components/AppButton';
import { useAuthStore } from '../../stores/authStore';
import {
  validateEmailSyntax,
  validatePasswordSyntax,
  validateEmailExists,
  validatePasswordMatch,
} from '../../utils/validation';
import { MOCK_USERS } from '../../data/mockUsers';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    // Reset errors
    setEmailError(null);
    setPasswordError(null);

    // Step 1: Syntactic validation
    const emailSyntax = validateEmailSyntax(email);
    if (!emailSyntax.valid) {
      setEmailError(emailSyntax.error);
      return;
    }

    const passSyntax = validatePasswordSyntax(password);
    if (!passSyntax.valid) {
      setPasswordError(passSyntax.error);
      return;
    }

    // Step 2: Semantic validation
    const emailCheck = validateEmailExists(email, MOCK_USERS);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.error);
      return;
    }

    const passCheck = validatePasswordMatch(password, emailCheck.user.passwordHash);
    if (!passCheck.valid) {
      setPasswordError(passCheck.error);
      return;
    }

    // Step 3: Authenticate
    setLoading(true);
    try {
      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 800));
      await login(email, password);
      // Navigation happens automatically via RootNavigator watching isAuthenticated
    } catch (err) {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('vedaant@cherrycreek.edu');
    setPassword('FBLADemo2026!');
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Ionicons name="people-circle" size={56} color={COLORS.gold} />
          <Text style={styles.headerTitle}>ConnectFBLA</Text>
          <Text style={styles.headerSubtitle}>Welcome back</Text>
        </View>
      </View>

      {/* Form section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>
            Enter your chapter credentials to continue.
          </Text>

          {/* Email field */}
          <AppInputField
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            placeholder="name@cherrycreek.edu"
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />

          {/* Password field */}
          <AppInputField
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="Enter your password"
            error={passwordError}
            secureTextEntry
            testID="password-input"
          />

          {/* Sign In button */}
          <AppButton
            label="Sign In"
            onPress={handleLogin}
            variant="primary"
            loading={loading}
            style={styles.signInButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo account helper */}
          <TouchableOpacity
            style={styles.demoBox}
            onPress={fillDemoCredentials}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Fill demo account credentials"
          >
            <Ionicons name="information-circle" size={20} color={COLORS.info} style={styles.demoIcon} />
            <View style={styles.demoText}>
              <Text style={styles.demoTitle}>Demo Account</Text>
              <Text style={styles.demoCredential}>Email: vedaant@cherrycreek.edu</Text>
              <Text style={styles.demoCredential}>Password: FBLADemo2026!</Text>
              <Text style={styles.demoHint}>Tap to auto-fill</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: SPACING.screenPadding,
    padding: SPACING.xs,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.sm,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  formWrapper: {
    flex: 1,
  },
  form: {
    padding: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  formTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    marginBottom: SPACING.lg,
  },
  signInButton: {
    marginTop: SPACING.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.placeholderText,
    marginHorizontal: SPACING.sm,
  },
  demoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  demoIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  demoText: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.info,
    marginBottom: 4,
  },
  demoCredential: {
    fontSize: 13,
    color: COLORS.bodyText,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 1,
  },
  demoHint: {
    fontSize: 12,
    color: COLORS.info,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
