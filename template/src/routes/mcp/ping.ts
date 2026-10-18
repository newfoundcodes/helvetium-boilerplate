import type { McpTool } from '@newfoundcodes/helvetium-mcp';

export function pingTool(): McpTool {
  return {
    description: 'Ping tool to check server status',
    inputSchema: { type: 'object', properties: {}, additionalProperties: true },
    handler: () => {
      return {
        status: 'pong',
        framework: 'Helvetium MCP',
      };
    },
  };
}
