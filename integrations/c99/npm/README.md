# C99 — TypeScript SDK packaging recipe

Prepare a small SDK without publishing it automatically.

## Release checklist

1. Keep package.json, README, license, and an explicit files allowlist.
2. Run tests and npm pack --dry-run.
3. Inspect the tarball for secrets, PII, and private endpoints.
4. Configure the customer's key at runtime.
5. Publish only after the corporate npm account and 2FA/review gate are explicitly available.

The own-site intent is c99|npm|global|sdk. A package download is activation evidence; it is not a buyer or settled revenue.

Official reference: https://docs.npmjs.com/cli/publish/
