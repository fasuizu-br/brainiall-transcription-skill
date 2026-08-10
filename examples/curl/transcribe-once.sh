#!/usr/bin/env bash
set -euo pipefail

API_URL="https://api.brainiall.com/v1/whisper/transcribe"
MAX_BYTES=26214400
CONFIRMATION="I_CONFIRM_RIGHTS_AND_COST"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

[[ $# -eq 3 ]] || fail "Usage: $0 INPUT.(mp3|wav|m4a|mp4|mpeg|mpga|webm|ogg) LANGUAGE(pt|es) OUTPUT.json"
[[ "${BRAINIALL_CONFIRM:-}" == "$CONFIRMATION" ]] || fail "Set BRAINIALL_CONFIRM=$CONFIRMATION after confirming rights, speaker notice or consent, current price, and balance."
[[ -n "${BRAINIALL_API_KEY:-}" ]] || fail "BRAINIALL_API_KEY is required."

input=$1
language=$2
output=$3

[[ -f "$input" && ! -L "$input" ]] || fail "Input must be one local regular file and not a symlink."
case "${input##*.}" in
  mp3|wav|m4a|mp4|mpeg|mpga|webm|ogg) ;;
  *) fail "Unsupported media extension." ;;
esac
[[ "$language" == "pt" || "$language" == "es" ]] || fail "Language must be pt or es."
[[ ! -e "$output" && ! -L "$output" ]] || fail "Output path must not already exist."

bytes=$(wc -c < "$input" | tr -d ' ')
[[ "$bytes" -gt 0 && "$bytes" -le "$MAX_BYTES" ]] || fail "Input must be between 1 byte and 25 MB."

umask 077
output_dir=$(dirname "$output")
[[ -d "$output_dir" ]] || fail "Output directory must already exist."
temporary=$(mktemp "$output_dir/.brainiall-response.XXXXXX")
trap 'rm -f "$temporary"' EXIT

# Exactly one metered request: no redirects and no retries.
curl --silent --show-error --fail \
  --max-redirs 0 \
  --retry 0 \
  --request POST \
  --header "Authorization: Bearer $BRAINIALL_API_KEY" \
  --form "audio=@$input" \
  --form "language=$language" \
  --form "diarize=true" \
  --output "$temporary" \
  "$API_URL"

mv "$temporary" "$output"
trap - EXIT
printf 'Saved private response to %s. Human review is required.\n' "$output"
