import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'
import { SNIP_TOOL_DESCRIPTION, SNIP_TOOL_NAME } from './prompt.js'

const inputSchema = z.object({
  reason: z
    .string()
    .optional()
    .describe('Optional reason for snipping the conversation'),
})

type InputSchema = typeof inputSchema
type Output = { tokensFreed: number; executed: boolean }

export const SnipTool = buildTool({
  name: SNIP_TOOL_NAME,
  maxResultSizeChars: 100_000,
  async description() {
    return SNIP_TOOL_DESCRIPTION
  },
  async prompt() {
    return SNIP_TOOL_DESCRIPTION
  },
  get inputSchema(): InputSchema {
    return inputSchema
  },
  isReadOnly() {
    return true
  },
  isConcurrencySafe() {
    return true
  },
  renderToolUseMessage(_input, _options) {
    return null
  },
  mapToolResultToToolResultBlockParam(content: Output, toolUseID: string) {
    return {
      type: 'tool_result' as const,
      tool_use_id: toolUseID,
      content: content.executed
        ? `Snipped conversation. Freed ${content.tokensFreed} tokens.`
        : 'Snip not needed or not available in this snapshot.',
    }
  },
  async call(_input, _context) {
    const { snipCompactIfNeeded } = await import(
      '../../services/compact/snipCompact.js'
    )
    const result = snipCompactIfNeeded([], { force: true })
    return {
      data: {
        tokensFreed: result.tokensFreed,
        executed: result.executed,
      },
    }
  },
} satisfies ToolDef<InputSchema, Output>)
