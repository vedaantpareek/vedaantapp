import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Modal, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import COLORS from '../theme/colors';
import SPACING from '../theme/spacing';
import AppAvatar from './AppAvatar';

/**
 * MessageBubble — Chat message bubble component.
 * Outgoing: right-aligned, primary blue, white text.
 * Incoming: left-aligned, surface gray, body text.
 * Supports image attachments, resource previews, emoji reactions, and read receipts.
 */
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MessageBubble({
  message,
  isOutgoing,
  showAuthor,
  style,
}) {
  const {
    text,
    authorName,
    authorImageUri,
    timestamp,
    imageUri,
    resource,
    reactions,
    readStatus,
  } = message;

  const [lightboxVisible, setLightboxVisible] = useState(false);

  return (
    <View style={[styles.row, isOutgoing ? styles.rowOutgoing : styles.rowIncoming, style]}>
      {/* Avatar for incoming messages */}
      {!isOutgoing && (
        <AppAvatar
          name={authorName}
          imageUri={authorImageUri}
          size="sm"
          style={styles.avatar}
        />
      )}

      <View style={styles.bubbleColumn}>
        {/* Author name for incoming group messages */}
        {!isOutgoing && showAuthor && authorName ? (
          <Text style={styles.authorName}>{authorName}</Text>
        ) : null}

        {/* Main bubble */}
        <View
          style={[
            styles.bubble,
            isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
          ]}
        >
          {/* Image attachment — tap to view full screen */}
          {imageUri ? (
            <>
              <TouchableOpacity onPress={() => setLightboxVisible(true)} activeOpacity={0.9}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
                <View style={styles.openHint}>
                  <Ionicons name="expand-outline" size={14} color={COLORS.white} />
                  <Text style={styles.openHintText}>Tap to open</Text>
                </View>
              </TouchableOpacity>
              <Modal
                visible={lightboxVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setLightboxVisible(false)}
              >
                <Pressable style={styles.lightboxOverlay} onPress={() => setLightboxVisible(false)}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.lightboxImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.lightboxClose}>Tap anywhere to close</Text>
                </Pressable>
              </Modal>
            </>
          ) : null}

          {/* Resource preview card */}
          {resource ? (
            <View style={styles.resourcePreview}>
              <Ionicons name="document-text" size={16} color={isOutgoing ? COLORS.white : COLORS.primary} />
              <Text
                style={[
                  styles.resourceTitle,
                  isOutgoing ? styles.resourceTitleOutgoing : styles.resourceTitleIncoming,
                ]}
                numberOfLines={1}
              >
                {resource.title}
              </Text>
            </View>
          ) : null}

          {/* Text content */}
          {text ? (
            <Text
              style={[
                styles.messageText,
                isOutgoing ? styles.textOutgoing : styles.textIncoming,
              ]}
            >
              {text}
            </Text>
          ) : null}
        </View>

        {/* Reaction bar */}
        {reactions && reactions.length > 0 ? (
          <View style={[styles.reactions, isOutgoing && styles.reactionsOutgoing]}>
            {reactions.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.reactionChip}
                activeOpacity={0.75}
                accessibilityLabel={`${r.emoji} reaction, ${r.count}`}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                {r.count > 1 ? <Text style={styles.reactionCount}>{r.count}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Timestamp + read receipt */}
        <View style={[styles.meta, isOutgoing && styles.metaOutgoing]}>
          <Text style={styles.timestamp}>{timestamp}</Text>
          {isOutgoing ? <ReadReceipt status={readStatus} /> : null}
        </View>
      </View>
    </View>
  );
}

function ReadReceipt({ status }) {
  if (!status) return null;
  const color = status === 'read' ? COLORS.info : COLORS.placeholderText;
  const icon = status === 'sent' ? 'checkmark' : 'checkmark-done';
  return (
    <Ionicons name={icon} size={14} color={color} style={styles.readReceipt} />
  );
}

ReadReceipt.propTypes = {
  status: PropTypes.oneOf(['sent', 'delivered', 'read']),
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
    authorName: PropTypes.string,
    authorImageUri: PropTypes.string,
    timestamp: PropTypes.string,
    imageUri: PropTypes.string,
    resource: PropTypes.shape({
      title: PropTypes.string,
    }),
    reactions: PropTypes.arrayOf(
      PropTypes.shape({
        emoji: PropTypes.string,
        count: PropTypes.number,
      })
    ),
    readStatus: PropTypes.oneOf(['sent', 'delivered', 'read']),
  }).isRequired,
  isOutgoing: PropTypes.bool,
  showAuthor: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

MessageBubble.defaultProps = {
  isOutgoing: false,
  showAuthor: false,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: SPACING.screenPadding,
  },
  rowOutgoing: {
    justifyContent: 'flex-end',
  },
  rowIncoming: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  avatar: {
    marginRight: SPACING.xs,
    marginBottom: 16,
  },
  bubbleColumn: {
    maxWidth: '75%',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    overflow: 'hidden',
  },
  bubbleOutgoing: {
    backgroundColor: COLORS.bubbleOutgoing,
    borderBottomRightRadius: 4,
  },
  bubbleIncoming: {
    backgroundColor: COLORS.bubbleIncoming,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textOutgoing: {
    color: COLORS.bubbleOutgoingText,
  },
  textIncoming: {
    color: COLORS.bubbleIncomingText,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 2,
  },
  openHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: SPACING.xs,
  },
  openHintText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '500',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  lightboxClose: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 16,
  },
  resourcePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    padding: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  resourceTitleOutgoing: {
    color: COLORS.white,
  },
  resourceTitleIncoming: {
    color: COLORS.primary,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  reactionsOutgoing: {
    justifyContent: 'flex-end',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginLeft: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginLeft: 4,
  },
  metaOutgoing: {
    justifyContent: 'flex-end',
    marginLeft: 0,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.placeholderText,
  },
  readReceipt: {
    marginLeft: 3,
  },
});
