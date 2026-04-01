import type { Command } from '../../commands.js'

const buddy = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Start a buddy session for pair programming',
  load: () => import('./buddy.js'),
} satisfies Command

export default buddy
