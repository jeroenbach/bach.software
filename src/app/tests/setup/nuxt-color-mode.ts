if (typeof window !== 'undefined') {
  // Ensure the color-mode helper exists before the Nuxt plugin runs during tests.
  window.__NUXT_COLOR_MODE__ = window.__NUXT_COLOR_MODE__ ?? {
    preference: 'light',
    value: 'light',
    getColorScheme: () => 'light',
    addColorScheme: () => {},
    removeColorScheme: () => {},
  };
}

declare global {
  interface Window {
    __NUXT_COLOR_MODE__?: {
      preference: string;
      value: string;
      getColorScheme: () => string;
      addColorScheme: (value: string) => void;
      removeColorScheme: (value: string) => void;
    };
  }
}
