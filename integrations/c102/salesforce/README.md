# Salesforce transcript evidence — C102 blueprint

This is a public, credential-free blueprint for turning one explicitly authorized
audio file into a reviewable transcript, speaker labels, SRT, and a CRM-ready
note. It is not an AppExchange package, Salesforce security review, or partner
claim.

## Flow

1. Run the local skill with a consented file.
2. Review `transcript.json` and the caption outputs.
3. Copy only the approved summary into the Salesforce record using the
   organization's own OAuth-controlled workflow.

The recipe deliberately does not accept Salesforce credentials or upload raw
audio. See the [AppExchange publishing path](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/list-app-appexchange)
and [security analyzer guidance](https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide/appexchange.html)
before any real listing work.
