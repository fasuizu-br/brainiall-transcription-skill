# HubSpot RevOps handoff fixture

This is a bounded recipe for a RevOps team that wants to review one consented
call before deciding whether a CRM handoff is worth a paid pilot.

## Test

1. Use one local recording with explicit participant consent.
2. Generate the transcript and captions through the existing skill.
3. Have the RevOps reviewer approve the fields before any CRM write; the
   default is a human-reviewed CSV or note, not an OAuth installation.
4. Record the organization's opt-in, evaluation outcome, and buyer identity
   without collecting personal contact data in this repository.

## Kill gate

If five qualified visits produce no opt-in request by the experiment deadline,
rewrite the wedge or stop this fixture. Approval, an integration install, and
checkout initiation are not payment; count only settled, reconciled funds.
