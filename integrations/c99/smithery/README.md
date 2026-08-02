# C99 — Smithery MCP recipe

A vendor-neutral checklist for testing a Transcreve BR MCP server in an MCP client.

## Client-safe flow

1. Read the server endpoint and tool contract.
2. Configure a key outside source control.
3. Send a public fixture or file for which the operator has permission.
4. Compare transcript, speaker labels, and SRT/VTT export.
5. Record first value before selecting a plan.

No Smithery login, publication, review, or external message is implied by this recipe. Use the intent c99|smithery|global|mcp for the own-site funnel.

Official publishing reference: https://smithery.mintlify.app/api-reference/servers/publish-a-server
