# C105 npm caption QA blueprint

Use this recipe to validate SRT/WebVTT parsing in a JavaScript project before
publishing a public package. The fixture is local-only and never contains an
API key or media upload.

## Gate

Create or use the corporate npm account, run the package tests, inspect the
tarball, and publish only after the npm account, scope, version, license and
2FA/token policy are confirmed. npm publication is discovery, not buyer proof.

Reference: <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>.
