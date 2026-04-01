/**
 * Template job CLI handler stub.
 */

export async function templatesMain(args: string[]): Promise<void> {
  const subcommand = args[0]

  switch (subcommand) {
    case 'list':
      console.log('No templates found. Template system is not yet available in this snapshot.')
      break
    case 'new':
      console.log('Template creation is not yet available in this snapshot.')
      break
    case 'reply':
      console.log('Template reply is not yet available in this snapshot.')
      break
    default:
      console.log(`Unknown template command: ${subcommand}`)
      console.log('Usage: cli new | list | reply')
      break
  }
}
