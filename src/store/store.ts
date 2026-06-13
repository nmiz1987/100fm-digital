import { create, StateCreator } from 'zustand';
import { PersistOptions } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StoreState {
  isDarkMode: boolean;
  handleDarkModeToggle: () => void;
}

const persistConfig: PersistOptions<StoreState> = {
  name: '100fm-digital-storage',
  storage: createJSONStorage(() => window.localStorage),
};

const store: StateCreator<StoreState> = (set) => ({
  isDarkMode: false,
  handleDarkModeToggle: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
});

export const useStore = create(persist<StoreState>(store, persistConfig));
