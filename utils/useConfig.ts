import type { Config } from "~/types/Config";

export const useConfig = () => {
  return useState<Config>("config");
};
