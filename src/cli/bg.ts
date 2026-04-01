/**
 * Background session management stubs.
 */

function printNotAvailable(action: string): void {
  console.log(
    `Background ${action} is not fully available in this reconstructed snapshot.`,
  )
}

export async function psHandler(_args: string[]): Promise<void> {
  printNotAvailable('session listing')
  console.log('No background sessions found.')
}

export async function logsHandler(_sessionId: string): Promise<void> {
  printNotAvailable('log tailing')
}

export async function attachHandler(_sessionId: string): Promise<void> {
  printNotAvailable('session attach')
}

export async function killHandler(_sessionId: string): Promise<void> {
  printNotAvailable('session kill')
}

export async function handleBgFlag(_args: string[]): Promise<void> {
  printNotAvailable('background launch')
  console.log('Use the standard CLI for now.')
}
