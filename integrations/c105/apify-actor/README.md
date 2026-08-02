# C105 Apify Actor blueprint

Expose the already-published transcript and diarization Actor as a narrow
job: authorized media in, transcript/SRT/WebVTT out. Use a pay-per-event
contract only when the event is unambiguous and the provider cost is covered.

## Gate

Record Actor ID, input, run, event, buyer identity, payout and bank
reconciliation separately. Store ranking, owner QA and anonymous runs are
discovery signals, not buyer-linked cash.

Reference: <https://docs.apify.com/actors/publishing/monetize/pay-per-event>.
