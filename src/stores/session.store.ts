// src/stores/session.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppSession, AuthenticatedUser } from '../types/session.types';

interface SessionState {
  session: AppSession | null;
  user: AuthenticatedUser | null;

  setSession: (session: AppSession | null) => void;
  setUser: (user: AuthenticatedUser | null) => void;
  clearSession: () => void;
}


export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      user: null,

      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
        }),

      setUser: (user) =>
        set((state) => ({
          user,
          session: state.session
            ? {
                ...state.session,
                user: user ?? state.session.user,
              }
            : null,
        })),

      clearSession: () =>
        set({
          session: null,
          user: null,
        }),
    }),
    {
      name: 'galberto-session',
    }
  )
)


