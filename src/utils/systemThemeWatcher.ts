import { oscColor } from '../ink/terminal-querier.js'
import type { TerminalQuerier } from '../ink/terminal-querier.js'
import {
  type SystemTheme,
  setCachedSystemTheme,
  themeFromOscColor,
} from './systemTheme.js'

const POLL_INTERVAL_MS = 5_000

/**
 * Poll the terminal background color via OSC 11 and update the theme
 * when it changes. Returns a cleanup function that stops polling.
 */
export function watchSystemTheme(
  querier: TerminalQuerier,
  setSystemTheme: (theme: SystemTheme) => void,
): () => void {
  let lastTheme: SystemTheme | undefined
  let stopped = false

  async function poll(): Promise<void> {
    if (stopped) return
    try {
      const query = oscColor(11)
      const response = await Promise.race([
        querier.send(query),
        querier.flush().then(() => undefined),
      ])
      if (stopped) return
      if (response && response.type === 'osc' && response.data) {
        const theme = themeFromOscColor(response.data)
        if (theme && theme !== lastTheme) {
          lastTheme = theme
          setCachedSystemTheme(theme)
          setSystemTheme(theme)
        }
      }
    } catch {
      // Terminal doesn't support OSC 11 — stop polling.
      stopped = true
    }
  }

  // Initial query
  void poll()

  const timer = setInterval(() => void poll(), POLL_INTERVAL_MS)

  return () => {
    stopped = true
    clearInterval(timer)
  }
}
