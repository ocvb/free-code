import type { Command } from '../types/command.js'

const subscribePr: Command = {
  type: 'prompt',
  name: 'subscribe-pr',
  description: 'Subscribe to GitHub PR notifications',
  progressMessage: 'subscribing to PR',
  contentLength: 0,
  source: 'builtin',
  isHidden: true,
  async getPromptForCommand(args) {
    return [
      {
        type: 'text',
        text: `Subscribe to PR notifications for: ${args || '(no PR specified)'}. Use the SubscribePRTool to set up the webhook.`,
      },
    ]
  },
}

export default subscribePr
