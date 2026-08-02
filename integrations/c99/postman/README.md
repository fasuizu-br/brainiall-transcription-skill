# C99 — Postman API collection recipe

Use a collection to make the first API call reproducible for a developer team.

## Variables

- base_url: the documented Transcreve BR API base URL
- api_key: set locally in a secret environment, never commit
- audio_fixture_url or a local authorized file
- language: pt
- diarize: false or true according to the test

Import the collection, review variables, send one authorized request, verify transcript and export, and record the first value. A public workspace or public collection needs its own account and publication receipt; this repository file does not claim either.

Track c99|postman|global|api. Official reference: https://learning.postman.com/latest-v-12/docs/collaborating-in-postman/using-workspaces/public-workspaces
