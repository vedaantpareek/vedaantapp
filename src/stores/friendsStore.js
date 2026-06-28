import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FRIENDS_KEY = '@connectfbla_friends';

/**
 * friendsStore — tracks which other members the current user has added as friends.
 * Friend IDs are persisted locally so the relationship survives app restarts.
 */
export const useFriendsStore = create((set, get) => ({
  friendIds: [],
  initialized: false,

  /**
   * Called on app start — restores the saved friends list.
   */
  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(FRIENDS_KEY);
      if (stored) set({ friendIds: JSON.parse(stored) });
    } catch (_e) {
      // Storage read failed — start with an empty friends list
    }
    set({ initialized: true });
  },

  isFriend: (userId) => get().friendIds.includes(userId),

  addFriend: (userId) => {
    set((state) =>
      state.friendIds.includes(userId)
        ? state
        : { friendIds: [...state.friendIds, userId] }
    );
    AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(get().friendIds)).catch(() => {});
  },

  removeFriend: (userId) => {
    set((state) => ({ friendIds: state.friendIds.filter((id) => id !== userId) }));
    AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(get().friendIds)).catch(() => {});
  },

  /** Adds the friend if not already added, otherwise removes them. */
  toggleFriend: (userId) => {
    if (get().isFriend(userId)) {
      get().removeFriend(userId);
    } else {
      get().addFriend(userId);
    }
  },
}));
