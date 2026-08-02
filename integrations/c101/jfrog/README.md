# Transcreve BR — JFrog CLI plugin recipe (C101)

This recipe describes a CI step that sends an explicitly authorized file to Transcreve BR and stores transcript/SRT outputs as versioned artifacts. The API key belongs to the buyer and must be injected through the CI secret store.

It is not published to the official JFrog registry. Official publication requires acceptance into the registry repository; see [JFrog plugin publishing](https://docs.jfrog.com/integrations/docs/jf-plugin-publish).

Public demand route: https://www.brainiall.com/transcreve/integracoes/jfrog-transcript-cli-plugin-c101

Never commit keys, audio, or transcripts.

