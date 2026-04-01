import type { TextBlockParam } from '@anthropic-ai/sdk/resources/index.mjs'
import * as React from 'react'
import { Box, Text } from '../../ink.js'

type Props = {
  addMargin: boolean
  param: TextBlockParam
}

export function UserGitHubWebhookMessage({ addMargin, param }: Props) {
  return (
    <Box marginBottom={addMargin ? 1 : 0}>
      <Text dimColor>[GitHub webhook activity — Kairos backend not available]</Text>
    </Box>
  )
}
