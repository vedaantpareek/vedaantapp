import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { RemoteKeyboardManager } from '../../components/RemoteControlListener';
import MessageBubble from '../../components/MessageBubble';
import AppAvatar from '../../components/AppAvatar';
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import USERS from '../../data/users.json';
import { VALIDATION, SCREENS } from '../../utils/constants';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

function getUserById(id) {
  return USERS.find((u) => u.id === id) || { name: 'Member', avatarUrl: null };
}

function TypingIndicator({ name }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondaryText,
    marginHorizontal: 2,
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingName}>{name} is typing</Text>
        <View style={styles.typingDots}>
          <Animated.View style={dotStyle(dot1)} />
          <Animated.View style={dotStyle(dot2)} />
          <Animated.View style={dotStyle(dot3)} />
        </View>
      </View>
    </View>
  );
}

export default function DirectMessageScreen({ route, navigation }) {
  const { dmId, otherUserId, otherUserName, otherUserOnline } = route.params;
  const { getDmMessages, sendMessage, addReaction, markDmRead, typingUsers, createDm } = useChatStore();
  const { user } = useAuthStore();
  const currentUserId = user?.id || 'user_1';

  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [reactionModal, setReactionModal] = useState({ visible: false, messageId: null });
  const [activeDmId, setActiveDmId] = useState(dmId);
  const listRef = useRef(null);

  const otherUser = getUserById(otherUserId);
  // Reactive selectors — re-renders when messages or typingUsers change
  const messages = useChatStore((state) => {
    if (!activeDmId) return [];
    const dm = state.directMessages.find((d) => d.id === activeDmId);
    return dm ? dm.messages : [];
  });
  const typingList = useChatStore((state) => state.typingUsers[activeDmId] || []);
  const isTyping = typingList.length > 0;

  const enrichedMessages = messages.map((m) => ({
    ...m,
    authorName: m.authorId === currentUserId ? (user?.name || 'You') : otherUserName,
    authorImageUri: null,
  }));

  useEffect(() => {
    // title + headerRight are set in ConnectStack.js options
    if (activeDmId) markDmRead(activeDmId);
  }, [activeDmId, markDmRead]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text && !attachedImage) return;

    let targetDmId = activeDmId;
    if (!targetDmId) {
      // First message in a new conversation — create the DM entry first
      targetDmId = createDm(otherUserId, otherUserName);
      setActiveDmId(targetDmId);
    }

    sendMessage(targetDmId, { text, imageUri: attachedImage }, true);
    setInputText('');
    setAttachedImage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [inputText, attachedImage, activeDmId, otherUserId, otherUserName, createDm, sendMessage]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAttachedImage(result.assets[0].uri);
    }
  };

  const handleLongPress = (messageId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReactionModal({ visible: true, messageId });
  };

  const handleReaction = (emoji, messageId) => {
    if (messageId && activeDmId) {
      addReaction(activeDmId, messageId, emoji, true);
    }
    setReactionModal({ visible: false, messageId: null });
  };

  // Keep a stable ref to handleSend so the keyboard subscriber never goes stale
  const handleSendRef = useRef(null);
  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  // Remote keyboard — type on laptop, text appears in the message input
  useEffect(() => {
    const unsub = RemoteKeyboardManager.subscribe(({ key, char }) => {
      if (key === 'Backspace') {
        setInputText((prev) => prev.slice(0, -1));
      } else if (key === 'ClearAll') {
        setInputText('');
      } else if (key === 'Enter') {
        handleSendRef.current?.();
      } else if (char) {
        setInputText((prev) => (prev + char).slice(0, VALIDATION.messageMaxLength));
      }
    });
    return unsub;
  }, []);

  const canSend = inputText.trim().length > 0 || !!attachedImage;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={enrichedMessages}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        scrollEnabled={!reactionModal.visible}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => handleLongPress(item.id)}
            delayLongPress={300}
          >
            <MessageBubble
              message={item}
              isOutgoing={item.authorId === currentUserId}
              showAuthor={false}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyConvo}>
            <AppAvatar name={otherUserName} size="xl" />
            <Text style={styles.emptyConvoName}>{otherUserName}</Text>
            <Text style={styles.emptyConvoSub}>No messages yet. Say hello!</Text>
          </View>
        }
        contentContainerStyle={[styles.listContent, enrichedMessages.length === 0 && styles.listContentEmpty]}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {isTyping && <TypingIndicator name={otherUserName} />}

      {attachedImage && (
        <View style={styles.attachPreview}>
          <Ionicons name="image" size={16} color={COLORS.primary} />
          <Text style={styles.attachLabel}>Photo attached</Text>
          <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.attachRemove}>
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage} accessibilityLabel="Attach image">
          <Ionicons name="attach" size={24} color={COLORS.secondaryText} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={`Message ${otherUserName}...`}
          placeholderTextColor={COLORS.placeholderText}
          value={inputText}
          onChangeText={(t) => setInputText(t.slice(0, VALIDATION.messageMaxLength))}
          multiline
          maxLength={VALIDATION.messageMaxLength}
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Ionicons name="send" size={20} color={canSend ? COLORS.white : COLORS.placeholderText} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={reactionModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setReactionModal({ visible: false, messageId: null })}
      >
        <Pressable
          style={[StyleSheet.absoluteFillObject, styles.modalBackdrop]}
          onPress={() => setReactionModal({ visible: false, messageId: null })}
        />
        <View style={styles.modalOverlay} pointerEvents="box-none">
          <View style={styles.emojiPicker}>
            <Text style={styles.emojiPickerTitle}>Add Reaction</Text>
            <View style={styles.emojiRow}>
              {EMOJI_REACTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={({ pressed }) => [styles.emojiBtn, pressed && { opacity: 0.6 }]}
                  onPress={() => handleReaction(emoji, reactionModal.messageId)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingVertical: SPACING.sm, paddingBottom: SPACING.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.sm, gap: SPACING.sm },
  headerOnlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  headerStatus: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingRow: { paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xs },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, alignSelf: 'flex-start',
  },
  typingName: { fontSize: 12, color: COLORS.secondaryText, marginRight: 6 },
  typingDots: { flexDirection: 'row', alignItems: 'center' },
  attachPreview: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.screenPadding, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  attachLabel: { fontSize: 13, color: COLORS.primary, marginLeft: SPACING.xs, flex: 1 },
  attachRemove: { padding: SPACING.xs },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background,
  },
  attachBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  textInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 22,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 15, color: COLORS.bodyText, maxHeight: 120,
    borderWidth: 1, borderColor: COLORS.border, marginHorizontal: SPACING.xs,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnActive: { backgroundColor: COLORS.primary },
  listContentEmpty: { flex: 1 },
  emptyConvo: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyConvoName: { fontSize: 20, fontWeight: '700', color: COLORS.bodyText, marginTop: SPACING.md },
  emptyConvoSub: { fontSize: 15, color: COLORS.secondaryText, marginTop: SPACING.sm },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emojiPicker: { backgroundColor: COLORS.background, borderRadius: 20, padding: SPACING.lg, minWidth: 280 },
  emojiPickerTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.secondaryText,
    textAlign: 'center', marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: COLORS.surface },
  emoji: { fontSize: 24 },
});
