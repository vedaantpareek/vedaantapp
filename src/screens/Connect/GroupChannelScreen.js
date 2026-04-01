import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
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
import COLORS from '../../theme/colors';
import SPACING from '../../theme/spacing';
import USERS from '../../data/users.json';
import { VALIDATION, SCREENS } from '../../utils/constants';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

function getUserById(id) {
  return USERS.find((u) => u.id === id) || { name: 'Member', avatarUrl: null };
}

// Typing indicator dots animation
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

export default function GroupChannelScreen({ route, navigation }) {
  const { channelId, channelName, memberCount } = route.params;
  // Reactive selectors — re-renders when messages or typingUsers change
  const messages = useChatStore((state) => state.messages[channelId] || []);
  const typingList = useChatStore((state) => state.typingUsers[channelId] || []);
  const { sendMessage, addReaction, markChannelRead, addMemberToChannel } = useChatStore();
  const channel = useChatStore((state) => state.channels.find((c) => c.id === channelId));
  const { user } = useAuthStore();
  const currentUserId = user?.id || 'user_1';

  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [reactionModal, setReactionModal] = useState({ visible: false, messageId: null });
  const [addMembersVisible, setAddMembersVisible] = useState(false);
  const listRef = useRef(null);

  // Non-members: all users not already in this channel
  const nonMembers = USERS.filter((u) => !channel?.memberIds?.includes(u.id));

  const isTyping = typingList.length > 0;

  // Enrich messages with author info
  const enrichedMessages = messages.map((m) => {
    const author = getUserById(m.authorId);
    return {
      ...m,
      authorName: author.name,
      authorImageUri: author.avatarUrl || null,
    };
  });

  useEffect(() => {
    markChannelRead(channelId);
  }, [channelId, markChannelRead]);

  // Set header buttons — custom back (handles cross-tab navigation) + add-members
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate(SCREENS.CHAT_LIST);
            }
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ paddingLeft: 16 }}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setAddMembersVisible(true)}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ paddingRight: 16 }}
        >
          <Ionicons name="person-add-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Pre-fill shared post if navigated from AnnouncementDetailScreen
  useEffect(() => {
    const sharedPost = route.params?.sharedPost;
    if (sharedPost) {
      setInputText(`📢 ${sharedPost.title}\n\n${sharedPost.body}`);
      navigation.setParams({ sharedPost: undefined });
    }
  }, [route.params?.sharedPost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill shared resource if navigated from Resources
  useEffect(() => {
    if (route.params?.shareResource) {
      setInputText('Check out this resource:');
    }
  }, [route.params?.shareResource]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text && !attachedImage) return;
    sendMessage(channelId, {
      text,
      imageUri: attachedImage,
      resource: route.params?.shareResource || null,
    }, false);
    setInputText('');
    setAttachedImage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [inputText, attachedImage, channelId, sendMessage, route.params?.shareResource]);

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

  const handleAddMember = useCallback((userId) => {
    addMemberToChannel(channelId, userId);
    const newCount = (channel?.memberIds?.length || 0) + 1;
    navigation.setParams({ memberCount: newCount });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [addMemberToChannel, channelId, channel, navigation]);

  const handleLongPress = (messageId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReactionModal({ visible: true, messageId });
  };

  const handleReaction = (emoji, messageId) => {
    if (messageId) {
      addReaction(channelId, messageId, emoji, false);
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
      {/* Message list */}
      <FlatList
        ref={listRef}
        data={enrichedMessages}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        scrollEnabled={!reactionModal.visible}
        renderItem={({ item, index }) => {
          const isOutgoing = item.authorId === currentUserId;
          const prevMsg = enrichedMessages[index - 1];
          const showAuthor = !isOutgoing && item.authorId !== prevMsg?.authorId;
          return (
            <Pressable
              onLongPress={() => handleLongPress(item.id)}
              delayLongPress={300}
            >
              <MessageBubble
                message={item}
                isOutgoing={isOutgoing}
                showAuthor={showAuthor}
              />
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing indicator */}
      {isTyping && <TypingIndicator name={typingList[0]} />}

      {/* Attached image preview */}
      {attachedImage && (
        <View style={styles.attachPreview}>
          <Ionicons name="image" size={16} color={COLORS.primary} />
          <Text style={styles.attachLabel}>Photo attached</Text>
          <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.attachRemove}>
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handlePickImage}
          accessibilityLabel="Attach image"
        >
          <Ionicons name="attach" size={24} color={COLORS.secondaryText} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Message..."
          placeholderTextColor={COLORS.placeholderText}
          value={inputText}
          onChangeText={(t) => setInputText(t.slice(0, VALIDATION.messageMaxLength))}
          multiline
          maxLength={VALIDATION.messageMaxLength}
          returnKeyType="default"
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

      {/* Emoji reaction picker modal — Pressable throughout, pointerEvents pattern */}
      <Modal
        visible={reactionModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setReactionModal({ visible: false, messageId: null })}
      >
        {/* Backdrop dismisses on press */}
        <Pressable
          style={[StyleSheet.absoluteFillObject, styles.modalBackdrop]}
          onPress={() => setReactionModal({ visible: false, messageId: null })}
        />
        {/* Picker floats in the center — pointerEvents="box-none" lets backdrop receive taps outside */}
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

      {/* Add Members modal */}
      <Modal
        visible={addMembersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddMembersVisible(false)}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => setAddMembersVisible(false)}
        />
        <View style={styles.addMembersSheet}>
          <View style={styles.addMembersHandle} />
          <Text style={styles.addMembersTitle}>Add Members</Text>
          {nonMembers.length === 0 ? (
            <View style={styles.addMembersEmpty}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              <Text style={styles.addMembersEmptyText}>All members are already in this channel!</Text>
            </View>
          ) : (
            <FlatList
              data={nonMembers}
              keyExtractor={(u) => u.id}
              style={styles.addMembersList}
              renderItem={({ item }) => {
                const alreadyAdded = channel?.memberIds?.includes(item.id);
                return (
                  <View style={styles.addMemberRow}>
                    <View style={[styles.addMemberAvatar, { backgroundColor: avatarBg(item.id) }]}>
                      <Text style={styles.addMemberInitial}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.addMemberInfo}>
                      <Text style={styles.addMemberName}>{item.name}</Text>
                      <Text style={styles.addMemberSub}>{item.school}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addMemberBtn, alreadyAdded && styles.addMemberBtnDone]}
                      onPress={() => !alreadyAdded && handleAddMember(item.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={alreadyAdded ? 'checkmark' : 'add'}
                        size={18}
                        color={alreadyAdded ? COLORS.success : COLORS.white}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.addMemberSep} />}
            />
          )}
          <TouchableOpacity
            style={styles.addMembersDoneBtn}
            onPress={() => setAddMembersVisible(false)}
          >
            <Text style={styles.addMembersDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// Stable pastel color for member avatars
const AVATAR_COLORS_LIST = ['#5C6BC0','#26A69A','#EF5350','#AB47BC','#FF7043','#29B6F6','#66BB6A','#FFA726'];
function avatarBg(userId) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS_LIST[Math.abs(h) % AVATAR_COLORS_LIST.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  memberCount: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginRight: SPACING.sm,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingRow: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  typingName: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginRight: 6,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachLabel: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  attachRemove: {
    padding: SPACING.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  attachBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.bodyText,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPicker: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.lg,
    minWidth: 280,
  },
  emojiPickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  emoji: {
    fontSize: 24,
  },

  // Add Members sheet
  addMembersSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '65%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addMembersHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  addMembersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bodyText,
    textAlign: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addMembersList: { flexGrow: 0 },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  addMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberInitial: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  addMemberInfo: { flex: 1 },
  addMemberName: { fontSize: 15, fontWeight: '600', color: COLORS.bodyText },
  addMemberSub: { fontSize: 12, color: COLORS.secondaryText, marginTop: 1 },
  addMemberBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberBtnDone: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  addMemberSep: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.screenPadding + 40 + SPACING.sm },
  addMembersEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
    paddingHorizontal: SPACING.screenPadding,
  },
  addMembersEmptyText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  addMembersDoneBtn: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  addMembersDoneText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
