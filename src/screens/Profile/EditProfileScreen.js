import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';
import AppAvatar from '../../components/AppAvatar';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import {
  validateDisplayName,
  validateBio,
  validateSocialHandle,
} from '../../utils/validation';
import { VALIDATION } from '../../utils/constants';
import USERS from '../../data/users.json';
import { validateUsernameUnique } from '../../utils/validation';

// ─── Inline field with validation error ─────────────────────────────────────

function Field({ label, value, onChangeText, placeholder, multiline, maxLength, error, keyboardType, autoCapitalize, hint }) {
  const hasError = !!error;
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[
          fieldStyles.input,
          multiline && fieldStyles.inputMultiline,
          hasError && fieldStyles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholderText}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        autoCorrect={false}
        returnKeyType={multiline ? 'default' : 'done'}
      />
      {maxLength && multiline && (
        <Text style={fieldStyles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {hasError && (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      )}
      {hint && !hasError && (
        <Text style={fieldStyles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.bodyText,
    height: SPACING.inputHeight,
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm + 2,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.placeholderText,
    textAlign: 'right',
    marginTop: 3,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    flex: 1,
  },
  hint: {
    fontSize: 11,
    color: COLORS.placeholderText,
    marginTop: 3,
  },
});

// ─── Social handle field ─────────────────────────────────────────────────────

function SocialField({ platform, icon, iconColor, value, onChangeText, error }) {
  return (
    <View style={socialStyles.wrapper}>
      <View style={[socialStyles.iconBox, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={socialStyles.inputWrapper}>
        <TextInput
          style={[socialStyles.input, !!error && socialStyles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`${platform} handle (optional)`}
          placeholderTextColor={COLORS.placeholderText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
        {!!error && (
          <View style={socialStyles.errorRow}>
            <Ionicons name="alert-circle" size={12} color={COLORS.error} />
            <Text style={socialStyles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const socialStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  inputWrapper: { flex: 1 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 40,
    fontSize: 14,
    color: COLORS.bodyText,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    flex: 1,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', color: '#0077B5' },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
  { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuthStore();

  // ── Avatar state ──────────────────────────────────────────────────────────
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`@connectfbla_avatar_${user.id}`)
      .then((uri) => { if (uri) setAvatarUri(uri); })
      .catch(() => {});
  }, [user]);

  const handleChangePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.', [{ text: 'OK' }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem(`@connectfbla_avatar_${user.id}`, uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [user]);

  // ── Local form state ─────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [socialLinks, setSocialLinks] = useState({
    instagram: user?.socialLinks?.instagram || '',
    linkedin: user?.socialLinks?.linkedin || '',
    youtube: user?.socialLinks?.youtube || '',
    twitter: user?.socialLinks?.twitter || '',
    facebook: user?.socialLinks?.facebook || '',
  });

  // ── Error state ──────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setSocialLink = (platform, value) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
    // Clear error on change
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`social_${platform}`];
      return updated;
    });
  };

  const clearFieldError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validateAll = useCallback(() => {
    const newErrors = {};

    // SYNTACTIC: Display name
    const nameResult = validateDisplayName(name);
    if (!nameResult.valid) newErrors.name = nameResult.error;

    // SYNTACTIC: Bio length
    const bioResult = validateBio(bio);
    if (!bioResult.valid) newErrors.bio = bioResult.error;

    // SYNTACTIC: Username format
    if (!username || username.trim().length === 0) {
      newErrors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, dots, and underscores.';
    }

    // SEMANTIC: Username uniqueness
    if (!newErrors.username) {
      const uniqueResult = validateUsernameUnique(username.trim(), USERS, user?.id);
      if (!uniqueResult.valid) newErrors.username = uniqueResult.error;
    }

    // SYNTACTIC: Social handles
    SOCIAL_PLATFORMS.forEach(({ key, label }) => {
      const handle = socialLinks[key];
      const result = validateSocialHandle(handle, label);
      if (!result.valid) newErrors[`social_${key}`] = result.error;
    });

    return newErrors;
  }, [name, username, bio, socialLinks, user?.id]);

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        grade: grade.trim(),
        socialLinks: {
          instagram: socialLinks.instagram.trim(),
          linkedin: socialLinks.linkedin.trim(),
          youtube: socialLinks.youtube.trim(),
          twitter: socialLinks.twitter.trim(),
          facebook: socialLinks.facebook.trim(),
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save Failed', 'Could not save your profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, username, bio, grade, socialLinks, validateAll, updateProfile, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar picker ────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleChangePhoto}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarTouchable}
          >
            <AppAvatar name={name || user?.name} size="xl" imageUri={avatarUri} />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.7} style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* ── Basic Info ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BASIC INFO</Text>
          <Field
            label="Full Name"
            value={name}
            onChangeText={(v) => { setName(v); clearFieldError('name'); }}
            placeholder="Your full name"
            error={errors.name}
          />
          <Field
            label="Username"
            value={username}
            onChangeText={(v) => { setUsername(v.toLowerCase()); clearFieldError('username'); }}
            placeholder="yourhandle"
            autoCapitalize="none"
            error={errors.username}
            hint="Only letters, numbers, dots, and underscores"
          />
          <Field
            label="Grade"
            value={grade}
            onChangeText={setGrade}
            placeholder="e.g., 11th Grade"
            error={errors.grade}
          />
        </View>

        {/* ── Bio ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIO</Text>
          <Field
            label="About You"
            value={bio}
            onChangeText={(v) => { setBio(v); clearFieldError('bio'); }}
            placeholder="Tell your FBLA story..."
            multiline
            maxLength={VALIDATION.bioMaxLength}
            error={errors.bio}
          />
        </View>

        {/* ── Social Links ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOCIAL MEDIA</Text>
          <Text style={styles.socialSubtext}>
            Add your handles to connect with other members
          </Text>
          {SOCIAL_PLATFORMS.map((platform) => (
            <SocialField
              key={platform.key}
              platform={platform.label}
              icon={platform.icon}
              iconColor={platform.color}
              value={socialLinks[platform.key]}
              onChangeText={(v) => setSocialLink(platform.key, v)}
              error={errors[`social_${platform.key}`]}
            />
          ))}
        </View>

        {/* ── Save Button ──────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
        >
          {saving ? (
            <Text style={styles.saveBtnText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarTouchable: {
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoBtn: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  socialSubtext: {
    fontSize: 12,
    color: COLORS.placeholderText,
    marginBottom: SPACING.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: SPACING.buttonHeight,
    marginTop: SPACING.sm,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
