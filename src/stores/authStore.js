import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import USERS from '../data/users.json';

const AUTH_KEY = '@connectfbla_auth';
const PROFILE_KEY = (id) => `@connectfbla_profile_${id}`;

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  /**
   * Called on app start — restores persisted session if available.
   */
  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const { userId } = JSON.parse(stored);
        // Check for a locally updated profile first
        const profileOverride = await AsyncStorage.getItem(PROFILE_KEY(userId));
        const base = USERS.find((u) => u.id === userId);
        if (base) {
          // grade is not user-editable — always preserve it from the source data
          const override = profileOverride ? JSON.parse(profileOverride) : null;
          const user = override ? { ...base, ...override, grade: base.grade } : base;
          set({ isAuthenticated: true, user, isLoading: false });
          return;
        }
      }
    } catch (_e) {
      // Storage read failed — stay logged out
    }
    set({ isLoading: false });
  },

  /**
   * SEMANTIC validation: checks credential correctness against mock user list.
   * SYNTACTIC validation is handled in the UI layer (LoginScreen).
   */
  login: async (email, password) => {
    const normalized = email.trim().toLowerCase();
    const user = USERS.find((u) => u.email.toLowerCase() === normalized);

    // Semantic check 1: account existence
    if (!user) {
      throw new Error('No account found with that email address.');
    }
    // Semantic check 2: password correctness (mock hash format: hashed_{plaintext})
    if (user.passwordHash !== `hashed_${password}`) {
      throw new Error('Incorrect password. Please try again.');
    }

    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ userId: user.id }));
    } catch (_e) {
      // Non-fatal: session won't persist but login succeeds
    }
    set({ isAuthenticated: true, user });
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (_e) {
      // Non-fatal
    }
    set({ isAuthenticated: false, user: null });
  },

  /**
   * Updates the current user's profile and persists locally.
   */
  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    try {
      await AsyncStorage.setItem(PROFILE_KEY(current.id), JSON.stringify(updates));
    } catch (_e) {
      // Non-fatal
    }
  },
}));
