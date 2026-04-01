import { z } from 'zod'
import { buildTool } from '../../Tool.js'

const inputSchema = z.object({
  repository: z.string().describe('GitHub repository (owner/repo)'),
  prNumber: z.number().describe('Pull request number'),
})

export const SubscribePRTool = buildTool({
  name: 'SubscribePRTool',
  async description() {
    return 'Subscribe to GitHub PR webhook notifications. Requires Kairos backend.'
  },
  inputSchema,
  isReadOnly() {
    return true
  },
  isEnabled() {
    return false
  },
  userFacingName() {
    return 'SubscribePRTool'
  },
  async call(input) {
    return {
      type: 'result' as const,
      resultForAssistant: `PR webhook subscription for ${input.repository}#${input.prNumber} is not available. Kairos backend required.`,
      data: { subscribed: false },
    }
  },
})
