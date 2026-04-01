import { registerBundledSkill } from '../bundledSkills.js'

const SKILL_BODY = `\
Help the user create a new skill file. A skill needs:

1. A frontmatter block with name, description, and optional fields
2. Clear instructions for what the skill does
3. A checklist or process flow if applicable

Ask the user:
- What should the skill do?
- What name should it have?
- Where should it be saved?

Then create the skill file with proper YAML frontmatter and markdown content.
`

export function registerRunSkillGeneratorSkill(): void {
  registerBundledSkill({
    name: 'generate-skill',
    description:
      'Generate a new skill file with proper frontmatter and content structure',
    userInvocable: true,
    async getPromptForCommand(args) {
      const parts: string[] = [SKILL_BODY.trimStart()]
      if (args) {
        parts.push(`## User Request\n\n${args}`)
      }
      return [{ type: 'text', text: parts.join('\n\n') }]
    },
  })
}
