---
slug: "forms"
title: "Forms"
description: "Set up the contact form with Formspree integration for collecting messages from your visitors."
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
  description: "Set up the contact form with Formspree integration for collecting messages from your visitors."
  noIndex: false
---

Unloyd includes a fully functional contact form that integrates with **Formspree** — a simple, free service that forwards form submissions to your email.

No backend server is required. Everything runs on the client side.

---

## How It Works

1. User fills out the contact form on your site
2. The form data is sent directly to Formspree
3. Formspree forwards the message to your email
4. User sees a success message

:::steps
1.  ### Create a Formspree Account
    - Go to [Formspree](https://formspree.io)
    - Create a free account
    - Create a new form
    - Copy the form endpoint URL

    Your endpoint URL will look like: `https://formspree.io/f/xxxxxxxx`

2.  ### Add to Environment Variables
    Add the form endpoint to your `.env` file:

    ```env
    PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
    ```

3.  ### Update Form Configuration
    The form labels, placeholders, and messages are stored in `src/config/form.ts`. You can customize them to match your brand:
    ```ts
    // src/config/form.ts
    export const FORM_CONFIG = {
      endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || "",
      labels: {
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
      },
      placeholders: {
        name: "John Doe",
        email: "john@example.com",
        subject: "Your subject...",
        message: "Write your message here...",
      },
      success: {
        title: "Message Sent",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      },
      error: {
        title: "Something went wrong",
        description: "Please check your connection and try again.",
      },
      button: {
        text: "Send Message",
        loading: "Sending...",
      },
    } as const;
    ```
4.  ### Deploy
    After setting up the environment variable and config, deploy your site. The contact form will be ready to accept messages.
:::

## Customizing the Form
### Labels and Placeholders
All text displayed in the form can be customized in `src/config/form.ts`. Change the values to match your brand voice or language.

### Success and Error Messages
The success and error messages are also configurable. Make sure they are clear and helpful to your users.

## Testing
To test the form:
- Open your site and go to the contact page
- Fill out the form and submit it
- Check your email for the test message
- Verify that the success message appears

If you don't receive the email:
- Check that the endpoint URL is correct
- Check your spam folder
- Check the Formspree dashboard for submissions

## Formspree Limits
Formspree free plan includes:

| Feature | Limit |
| ---- | ---- |
| Submissions | 50 per month |
| Forms | 1 form |
| Email notifications | Yes |
| Spam protection | Yes |

For higher limits, consider upgrading to a paid plan or using a different service.

## Privacy Considerations
Form submissions may contain personal information. Make sure to:

- Include a Privacy Policy page
- Inform users how their data will be used
- Consider adding a consent checkbox (if required)

## Next Steps
:::card[Pagefind]{href="/docs/pagefinde/" icon='book-2'}
Static search engine configuration
:::
