# Microsoft Teams call-notes fixture

Permission-first fixture for a Teams administrator who wants to turn one
explicitly authorized recording into a speaker-labelled note, with no tenant
wide export and no unattended install.

## Test

1. Obtain written consent for the recording and confirm the file is local.
2. Run the existing `brainiall-diarized-transcription` skill once with a
   dedicated API key and the least-privilege input.
3. Review the generated SRT/VTT and map only approved fields into the team's
   existing note template.
4. Stop if the admin cannot name a buyer, approved workspace, or paid pilot
   path. This fixture is not a Teams Marketplace listing.

## Measurement

Attribute a visit, opt-in request, checkout, settlement, and reconciliation
separately. A Teams page view or a generated transcript is not revenue.
