import type { Command } from '../types/command.js'

const forceSnip: Command = {
  type: 'prompt',
  name: 'force-snip',
  description: 'Snip conversation history to reduce context size',
  progressMessage: 'snipping conversation history',
  contentLength: 0,
  source: 'builtin',
  isHidden: true,
  async getPromptForCommand(_args) {
    return [
      {
        type: 'text',
        text: 'Snip the conversation history at this point. All messages before this point will be summarized and compressed. Use the SnipTool to execute.',
      },
    ]
  },
}

export default forceSnip
