import { z } from 'zod'
import { buildTool } from '../../Tool.js'

export const OVERFLOW_TEST_TOOL_NAME = 'OverflowTestTool'

const inputSchema = z.object({
  size: z
    .number()
    .optional()
    .describe('Approximate size in characters of output to generate (default: 100000)'),
})

export const OverflowTestTool = buildTool({
  name: OVERFLOW_TEST_TOOL_NAME,
  maxResultSizeChars: Infinity,
  async description() {
    return 'Generate large output for testing context overflow handling. Dev/test only.'
  },
  async prompt() {
    return 'Generate large output for testing context overflow handling. Dev/test only.'
  },
  get inputSchema() {
    return inputSchema
  },
  isReadOnly() {
    return true
  },
  isEnabled() {
    return true
  },
  isConcurrencySafe() {
    return true
  },
  userFacingName() {
    return OVERFLOW_TEST_TOOL_NAME
  },
  renderToolUseMessage(_input, _options) {
    return null
  },
  mapToolResultToToolResultBlockParam(
    content: { resultForAssistant: string },
    toolUseID: string,
  ) {
    return {
      type: 'tool_result' as const,
      tool_use_id: toolUseID,
      content: content.resultForAssistant,
    }
  },
  async call(input) {
    const size = input.size ?? 100_000
    const line = 'The quick brown fox jumps over the lazy dog. '
    const repetitions = Math.ceil(size / line.length)
    const output = line.repeat(repetitions).slice(0, size)
    return {
      type: 'result' as const,
      resultForAssistant: `Generated ${output.length} characters of test output:\n${output}`,
      data: { length: output.length },
    }
  },
})
