import React from 'react'
import type { TextBlockParam } from '@anthropic-ai/sdk/resources/index.mjs'
import { Text } from '../../ink.js'

type Props = {
  addMargin: boolean
  param: TextBlockParam
}

export function UserForkBoilerplateMessage(_props: Props): React.ReactNode {
  return <Text dimColor>Fork subagent context</Text>
}
