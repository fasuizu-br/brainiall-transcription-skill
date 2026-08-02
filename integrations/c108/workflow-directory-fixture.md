# C108 workflow-directory fixture

This fixture maps a reviewed transcript to a task or decision artifact for
Asana, Linear or Google Workspace. It makes no OAuth call and writes nothing to
an external workspace.

Acceptance checks:

- synthetic or explicitly authorized audio only;
- least-privilege scope and a human review before any write;
- reversible export with timestamps and speaker labels;
- a clear external payment route and independent reconciliation;
- no claim of directory inclusion, install, approval or partnership.

See [Asana](https://developers.asana.com/docs/overview), [Linear](https://linear.app/docs/integration-directory), and [Google Workspace add-ons](https://developers.google.com/workspace/add-ons/how-tos/publish-add-on-overview).

