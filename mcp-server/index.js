import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
    {
        name: "barberlinkshop-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_barber_info",
                description: "Get information about a specific barber",
                inputSchema: {
                    type: "object",
                    properties: {
                        barberId: {
                            type: "string",
                            description: "The ID of the barber",
                        },
                    },
                    required: ["barberId"],
                },
            },
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_barber_info") {
        const { barberId } = request.params.arguments;

        // In a real implementation, you would query Firebase here
        return {
            content: [
                {
                    type: "text",
                    text: `Mock data for barber ${barberId}. Please integrate with Firebase for real data.`,
                },
            ],
        };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("barberlinkshop MCP Server running on stdio");
}

run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
