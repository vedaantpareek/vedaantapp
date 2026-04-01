import { create } from 'zustand';
import CHANNELS_DATA from '../data/channels.json';
import MESSAGES_DATA from '../data/messages.json';
import DMS_DATA from '../data/directMessages.json';

function formatTimestamp(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export const useChatStore = create((set, get) => ({
  channels: CHANNELS_DATA,
  messages: MESSAGES_DATA,
  directMessages: DMS_DATA,
  typingUsers: {},

  // ---------- Computed ----------

  getTotalUnread: () => {
    const { channels, directMessages } = get();
    const channelUnread = channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);
    const dmUnread = directMessages.reduce((sum, dm) => sum + (dm.unreadCount || 0), 0);
    return channelUnread + dmUnread;
  },

  getChannelMessages: (channelId) => get().messages[channelId] || [],

  getDmMessages: (dmId) => {
    const dm = get().directMessages.find((d) => d.id === dmId);
    return dm ? dm.messages : [];
  },

  getDmByParticipant: (userId) =>
    get().directMessages.find((dm) => dm.participants.includes(userId)),

  // ---------- Messaging ----------

  sendMessage: (channelId, messagePayload, isDm = false) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      channelId,
      authorId: 'user_1',
      text: messagePayload.text || '',
      timestamp: formatTimestamp(new Date()),
      reactions: [],
      readStatus: 'sent',
      imageUri: messagePayload.imageUri || null,
      resource: messagePayload.resource || null,
    };

    if (isDm) {
      set((state) => ({
        directMessages: state.directMessages.map((dm) =>
          dm.id === channelId
            ? {
                ...dm,
                messages: [...dm.messages, newMsg],
                lastMessage: { text: newMsg.text, authorId: 'user_1', timestamp: newMsg.timestamp },
                unreadCount: 0,
              }
            : dm
        ),
      }));
    } else {
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: [...(state.messages[channelId] || []), newMsg],
        },
        channels: state.channels.map((ch) =>
          ch.id === channelId
            ? {
                ...ch,
                lastMessage: { text: newMsg.text, authorId: 'user_1', timestamp: newMsg.timestamp },
                unreadCount: 0,
              }
            : ch
        ),
      }));
    }

    // Simulate a typing indicator + reply after a short delay
    setTimeout(() => get().simulateTyping(channelId, isDm), 1200);
  },

  // ---------- Direct Messages ----------

  createDm: (otherUserId, otherUserName) => {
    const newDmId = `dm_new_${Date.now()}`;
    const newDm = {
      id: newDmId,
      participants: ['user_1', otherUserId],
      otherUser: otherUserName,
      messages: [],
      lastMessage: null,
      unreadCount: 0,
    };
    set((state) => ({
      directMessages: [...state.directMessages, newDm],
    }));
    return newDmId;
  },

  // ---------- Reactions ----------

  addReaction: (channelId, messageId, emoji, isDm = false) => {
    const applyReaction = (msgs) =>
      msgs.map((m) => {
        if (m.id !== messageId) return m;
        const current = m.reactions || [];
        const existing = current.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: current.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        }
        return { ...m, reactions: [...current, { emoji, count: 1 }] };
      });

    if (isDm) {
      set((state) => ({
        directMessages: state.directMessages.map((dm) =>
          dm.id === channelId ? { ...dm, messages: applyReaction(dm.messages) } : dm
        ),
      }));
    } else {
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: applyReaction(state.messages[channelId] || []),
        },
      }));
    }
  },

  // ---------- Read status ----------

  markChannelRead: (channelId) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
      ),
    }));
  },

  markDmRead: (dmId) => {
    set((state) => ({
      directMessages: state.directMessages.map((dm) =>
        dm.id === dmId ? { ...dm, unreadCount: 0 } : dm
      ),
    }));
  },

  // ---------- Members ----------

  addMemberToChannel: (channelId, userId) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === channelId && !ch.memberIds.includes(userId)
          ? { ...ch, memberIds: [...ch.memberIds, userId] }
          : ch
      ),
    }));
  },

  // ---------- Typing simulation ----------

  simulateTyping: (channelId, isDm = false) => {
    const REPLY_POOL = [
      "Thanks for sharing! 👍",
      "Great point! See you there 🎉",
      "Can't wait for the conference!",
      "Absolutely! Let's connect at State.",
      "Good luck with your presentation! 🚀",
      "This is so helpful, thank you!",
      "100% agree! 💯",
    ];

    // Show typing indicator
    set((state) => ({
      typingUsers: { ...state.typingUsers, [channelId]: ['Another member'] },
    }));

    // After 2 seconds: hide typing, send simulated reply
    setTimeout(() => {
      set((state) => {
        const typing = { ...state.typingUsers };
        delete typing[channelId];
        return { typingUsers: typing };
      });

      const replyText = REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)];
      const authorIds = ['user_2', 'user_3', 'user_5', 'user_10'];
      const authorId = authorIds[Math.floor(Math.random() * authorIds.length)];

      const simulatedMsg = {
        id: `msg_sim_${Date.now()}`,
        channelId,
        authorId,
        text: replyText,
        timestamp: formatTimestamp(new Date()),
        reactions: [],
        readStatus: 'delivered',
        imageUri: null,
        resource: null,
      };

      if (isDm) {
        set((state) => ({
          directMessages: state.directMessages.map((dm) =>
            dm.id === channelId ? { ...dm, messages: [...dm.messages, simulatedMsg] } : dm
          ),
        }));
      } else {
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), simulatedMsg],
          },
        }));
      }
    }, 2000);
  },
}));
