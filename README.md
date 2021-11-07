# Freshdesk Secret Message

Youtube introduction [here](https://www.youtube.com/watch?v=vdmlns1Y9a8).

## Get started
Setup the environment follow the [Freshdesk Developer Guide](https://developers.freshdesk.com/v2/docs/quick-start/)

Create a [restdb.io](https://restdb.io) account.
  - Create a collection named `fd-secrets`.
  - Create the following fields in the collection:
    - `tenant` - text, required(true)
    - `yopassId` - text, required(true), unique(true)
    - `expiration` - number
    - `one_time` - bool
    - `ticketId` - number
    - `createdAt` - datetime
    - `createdBy` - text

`fdk run`
  - Goto `http://localhost:10001/custom_configs`, fill in the information mentioned.
  - Goto freshdesk `https://{{xxxxxx}}.freshdesk.com/a/tickets/{????}?dev=true`, turn on `dev=true`.

## Inspiration
Security is a big concern nowadays. Often customer support does not just help answer questions regarding the product. Sometimes, they need to deal with potential customers asking for a demo account,  sharing critical logs for troubleshooting, or even just sharing some one-time password. How do you share them securely?

Traditionally, they would share it within the Service Desk comments and leave it exposed to potential threats. Another workaround could be using services such as Tresorit or Box. What about making the solution integrate seamlessly with FreshDesk? This is the solution for it.

## What it does
The application allows easy sharing of sensitive or secret messages securely through FreshDesk ticket conversation.

## How we built it
Firstly, displaying and inputting information is done through FreshDesk's Core API and App SDK. There are 2 parts to it.
1. Creating a secret message in the ticket view can be done using location `ticket_conversation_editor` and interface `setValue trigger`.
2. Listing page to display the collection of secrets created by who, when, and where. This listing page served as an auditing purpose to ensure traceability for a secure and compliance software.
 
Next, we leverage existing encryption technology [OpenPGP](https://openpgpjs.org) to secure the message transit and storage.  We also leverage an open-source project ([yopass.se](https://yopass.se/#/) ) to enable us to build on a cloud service that is cheap and easy to maintain.

## What's next for Freshdesk Secret Message

- There is some minor improvement that could be done in the data structure design used for restdb.io. For example, separation of concern for multi-tenant implementation, which allows the user to have to store it in their own DB.
- Implement permission control to the listing page.
- Besides the secret message, we could also expand this into implementing attachments so that documentation can be shared in a secure manner.
- That aside, the workaround hack works well and is also good for production use. Of course, if the technology improves, we could revise on making an improved version of this app. Eg. dynamically rendered secret component within the conversation thread. And, porting the database to using Freshdesk's database.
- Also, nice to have is to allow to add a plugin on the customer's side conversation editor view. So that they too can add secret messages and provide more information that is contained within the system.
