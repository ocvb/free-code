import type { Command } from '../../commands.js'

const forkCmd = {
  type: 'local-jsx',
  name: 'fork',
  description: 'Fork conversation into a new subagent',
  load: () => import('./fork.js'),
} satisfies Command

export default forkCmd
