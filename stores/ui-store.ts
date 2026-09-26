import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "jobpilot-theme";

function applyThemeToDocument(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

interface UIState {
  theme: ThemePreference;
  themeHydrated: boolean;
  hydrateTheme: () => void;
  setTheme: (theme: ThemePreference) => void;

  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "system",
  themeHydrated: false,
  hydrateTheme: () => {
    if (get().themeHydrated) return;
    set({ theme: readStoredTheme(), themeHydrated: true });
  },
  setTheme: (theme) => {
    applyThemeToDocument(theme);
    try {
      if (theme === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch {
      /* private browsing / storage disabled */
    }
    set({ theme, themeHydrated: true });
  },

  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      useUIStore.setState({ theme: readStoredTheme(), themeHydrated: true });
    }
  });
}
