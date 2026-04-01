import {
  type ReadResourceResult,
  ReadResourceResultSchema,
  ListResourcesResultSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { Command } from '../commands.js'
import { ensureConnectedClient } from '../services/mcp/client.js'
import type { MCPServerConnection } from '../services/mcp/types.js'
import { memoizeWithLRU } from '../utils/memoize.js'
import { logMCPError } from '../utils/log.js'
import { parseFrontmatter } from '../utils/frontmatterParser.js'
import { getMCPSkillBuilders } from './mcpSkillBuilders.js'

const MCP_SKILLS_CACHE_SIZE = 20

/**
 * Fetch skill commands from an MCP server's resources (skill:// URIs).
 * Exported as a memoized LRU function so callers can invalidate by server
 * name via fetchMcpSkillsForClient.cache.delete(name).
 */
export const fetchMcpSkillsForClient = memoizeWithLRU(
  async (client: MCPServerConnection): Promise<Command[]> => {
    if (client.type !== 'connected') return []

    try {
      if (!client.capabilities?.resources) {
        return []
      }

      const result = await client.client.request(
        { method: 'resources/list' },
        ListResourcesResultSchema,
      )

      if (!result.resources || result.resources.length === 0) return []

      const skillResources = result.resources.filter(r =>
        r.uri?.startsWith('skill://'),
      )
      if (skillResources.length === 0) return []

      const connectedClient = await ensureConnectedClient(client)
      const builders = getMCPSkillBuilders()
      const commands: Command[] = []

      for (const resource of skillResources) {
        try {
          const readResult = (await connectedClient.client.request(
            { method: 'resources/read', params: { uri: resource.uri } },
            ReadResourceResultSchema,
          )) as ReadResourceResult

          const textContent = readResult.contents
            .filter((c): c is typeof c & { text: string } => 'text' in c && typeof c.text === 'string')
            .map(c => c.text)
            .join('\n')

          if (!textContent) continue

          const { frontmatter, content: markdownContent } = parseFrontmatter(textContent)
          const resolvedName =
            (frontmatter.name as string | undefined) ??
            resource.name ??
            resource.uri

          const parsed = builders.parseSkillFrontmatterFields(
            frontmatter,
            markdownContent,
            resolvedName,
          )

          const command = builders.createSkillCommand({
            ...parsed,
            skillName: resolvedName,
            markdownContent,
            source: 'mcp' as const,
            baseDir: undefined,
            loadedFrom: 'mcp' as const,
            paths: undefined,
          })

          commands.push(command)
        } catch (e) {
          logMCPError(
            client.name,
            `Failed to load MCP skill from ${resource.uri}: ${e instanceof Error ? e.message : String(e)}`,
          )
        }
      }

      return commands
    } catch (error) {
      logMCPError(
        client.name,
        `Failed to fetch MCP skills: ${error instanceof Error ? error.message : String(error)}`,
      )
      return []
    }
  },
  (client: MCPServerConnection) => client.name,
  MCP_SKILLS_CACHE_SIZE,
)
