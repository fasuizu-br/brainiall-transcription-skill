# Cloudflare Workers AI Whisper comparison — C102 blueprint

This recipe is a provider-comparison harness for an explicitly authorized
audio fixture. It records language, duration, diarization, timestamps, output
format, and the first-value decision without claiming a Cloudflare deployment
or an equivalent quality result.

The official [Whisper chunking tutorial](https://developers.cloudflare.com/workers-ai/guides/tutorials/build-a-workers-ai-whisper-with-chunking/)
and [model page](https://developers.cloudflare.com/workers-ai/models/whisper/)
define the external path. Keep API tokens in the customer's secret manager and
never commit audio, credentials, or provider responses containing sensitive data.
