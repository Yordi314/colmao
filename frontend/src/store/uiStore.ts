import { create } from 'zustand';

interface UIState {
  isMobileCartOpen: boolean;
  setMobileCartOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileCartOpen: false,
  setMobileCartOpen: (isOpen) => set({ isMobileCartOpen: isOpen }),
}));
