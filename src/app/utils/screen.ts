export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const screens: { [key in ScreenSize]: number } = {
  'xs': 320,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

export const screensUntil: { [key in ScreenSize]: number } = {
  'xs': 640,
  'sm': 768,
  'md': 1024,
  'lg': 1280,
  'xl': 1536,
  '2xl': 2048,
};
