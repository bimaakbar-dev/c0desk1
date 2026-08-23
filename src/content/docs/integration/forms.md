---
slug: "forms"
title: "Forms"
description: "Set up the contact form with Formspree integration."
category: "Integration"
order: 2
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Forms"
  description: "Set up the contact form with Formspree integration."
  noIndex: false
lastUpdated: 2026-08-12T15:02:00Z
---

Unloyd includes a contact form powered by [Formspree](https://formspree.io) — a free service that forwards submissions to your email. No backend required.

---

## Setup

:::steps

1. ### Create a Formspree Account
   - Go to [Formspree](https://formspree.io) and create a free account
   - Create a new form and copy the endpoint URL

   Your endpoint will look like: `https://formspree.io/f/xxxxxxxx`

2. ### Add to Environment Variables

   ```env
   PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```

3. ### Customize Form Text

   Edit labels, placeholders, and messages in `src/config/pages/form.ts`:

   ```ts
   export const FORM_CONFIG = {
     labels: { name: "Name", email: "Email", subject: "Subject", message: "Message" },
     placeholders: { name: "John Doe", email: "john@example.com", ... },
     success: { title: "Message Sent", description: "We'll get back to you within 24 hours." },
     error: { title: "Something went wrong", description: "Please check your connection and try again." },
     button: { text: "Send Message", loading: "Sending..." },
   } as const;
   ```

4. ### Deploy
   The form is ready once the environment variable is set and the site is deployed.
   :::

## Formspree Free Plan

| Feature             | Limit        |
| ------------------- | ------------ |
| Submissions         | 50 per month |
| Forms               | 1            |
| Email notifications | ✓            |
| Spam protection     | ✓            |

Upgrade to a paid plan if you need higher limits.

## Privacy Considerations

Form submissions may contain personal data. Make sure your site has:

- A **Privacy Policy** page
- Clear notice to users about how their data is used
