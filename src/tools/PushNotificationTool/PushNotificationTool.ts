import { z } from 'zod'
import { buildTool } from '../../Tool.js'

const inputSchema = z.object({
  title: z.string().describe('Notification title'),
  body: z.string().describe('Notification body text'),
})

export const PushNotificationTool = buildTool({
  name: 'PushNotificationTool',
  async description() {
    return 'Send a push notification to the user. Requires Kairos notification backend.'
  },
  inputSchema,
  isReadOnly() {
    return true
  },
  isEnabled() {
    return false
  },
  userFacingName() {
    return 'PushNotificationTool'
  },
  async call(input) {
    return {
      type: 'result' as const,
      resultForAssistant:
        'Push notifications are not available in this snapshot. The Kairos notification backend is required.',
      data: { sent: false, title: input.title },
    }
  },
})
