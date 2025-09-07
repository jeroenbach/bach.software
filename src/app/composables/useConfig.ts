import type { Config } from '~/types/Config';

export function useConfig() {
  return useState<Config>('config');
}
