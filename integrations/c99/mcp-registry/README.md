# C99 — MCP Registry recipe

Use this as a metadata-and-validation checklist for a Transcreve BR MCP server.

## Contract

- Homepage: https://www.brainiall.com/transcreve
- Product: Transcreve BR transcription and caption QA
- Transport: use the server transport documented by the current MCP Registry schema
- Auth: inject the customer's key at runtime; never commit it
- Input: an explicitly authorized audio file or public fixture
- Output: transcript, timestamps, optional diarization, and an export artifact

## Safe preflight

1. Validate the server metadata against the current official schema.
2. Run a fixture or an authorized file only.
3. Review language, timestamps, speaker labels, and export before any paid run.
4. Attribute the first value with the intent c99|mcp-registry|global|transcript.

The registry is a discovery surface. Publication, approval, installation, payment, settlement, and reconciliation are separate states.

Official guide: https://modelcontextprotocol.io/registry/quickstart
