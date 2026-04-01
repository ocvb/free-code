import * as React from 'react'
import { Box, Text } from '../../ink.js'

export function SnipBoundaryMessage(_props: { message: unknown }): React.ReactNode {
  return (
    <Box marginY={1}>
      <Text dimColor>✂ Conversation history snipped</Text>
    </Box>
  )
}
