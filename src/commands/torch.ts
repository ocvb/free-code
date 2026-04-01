import type { Command } from '../types/command.js'

const torch = {
  type: 'local',
  name: 'torch',
  description: 'Clear conversation and start fresh (aggressive reset)',
  supportsNonInteractive: false,
  load: () =>
    Promise.resolve({
      async call(_args: string, _context: import('../types/command.js').LocalJSXCommandContext) {
        return {
          type: 'text' as const,
          value: 'Torch is not fully available in this reconstructed snapshot. Use /clear instead.',
        }
      },
    }),
} satisfies Command

export default torch
