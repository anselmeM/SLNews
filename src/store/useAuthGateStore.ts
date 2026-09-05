import { create } from "zustand";

export type AuthGateContext =
  | "bookmark"
  | "reel_watch"
  | "reel_like"
  | "market_alert"
  | "comment"
  | "follow"
  | "default";

interface AuthGateState {
  isOpen: boolean;
  context: AuthGateContext;
  openGate: (context?: AuthGateContext) => void;
  closeGate: () => void;
}

export const useAuthGateStore = create<AuthGateState>((set) => ({
  isOpen: false,
  context: "default",
  openGate: (context = "default") => set({ isOpen: true, context }),
  closeGate: () => set({ isOpen: false, context: "default" }),
}));
