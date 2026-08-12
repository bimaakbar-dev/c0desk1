// src/config/form.ts
export const FORM_CONFIG = {
  endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || "https://formspree.io/f/your-endpoint",

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
    description:
      "Thank you for reaching out. We'll get back to you within 24 hours.",
  },

  error: {
    title: "Something went wrong",
    description: "Please check your connection and try again.",
  },

  button: {
    text: "Send Message",
    loading: "Sending...",
  },

  helper: "Markdown is supported.",
} as const;