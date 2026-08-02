/**
 * Stand-in for Nuxt's virtual `#imports` module in the unit (non-Nuxt) test
 * environment, where the real module doesn't exist. Tests replace these
 * exports with spies via `vi.mock('#imports', ...)`.
 */
export function useTrackEvent(_eventName: string, _options?: Record<string, unknown>) {}
