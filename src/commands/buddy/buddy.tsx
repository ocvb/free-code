import React from 'react'
import { Text } from '../../ink.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: unknown,
  _args: string,
): Promise<React.ReactNode> {
  onDone()
  return <Text>Buddy mode is not available in this reconstructed snapshot.</Text>
}
