---
slug: "analytics"
title: "Analytics"
description: "Integrate Google Analytics and Yandex Metrica with Unloyd to track visitor behavior and performance."
category: "Integration"
order: 1
draft: false
author:
  name: "Unloyd Team"
  role: "Developer"
  url: "https://github.com/unloyd"
  email: "hello@unloyd.web.id"
seo:
  title: "Analytics"
  description: "Integrate Google Analytics and Yandex Metrica with Unloyd to track visitor behavior and performance."
  noIndex: false
---

Unloyd supports two popular analytics services out of the box: **Google Analytics (GA4)** and **Yandex Metrica**. This guide explains how to configure them.

---

## Google Analytics (GA4)

Google Analytics 4 is the latest version of Google's analytics platform. It provides detailed insights about your visitors, traffic sources, and user behavior.

:::steps
1.  ### Get Your Measurement ID

    - Go to [Google Analytics](https://analytics.google.com/)
    - Create a new GA4 property (or use an existing one)
    - Navigate to **Admin** → **Data Streams**
    - Select or create a web data stream
    - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

2.  ###  Add to Environment Variables

    Add your Measurement ID to the `.env` file:

    ```env
    PUBLIC_ANALYTICS_GOOGLE=G-XXXXXXXXXX
    ```

3.  ### Deploy
    The Google Analytics script is already included in the layout. It will automatically load when your site is built and deployed.

    > [!NOTE]
    > The analytics script uses `data-consent="required"` attribute. It is integrated with the cookie consent system.
:::

## Yandex Metrica
Yandex Metrica is a powerful analytics tool that offers heatmaps, session replays, and real-time visitor tracking.

:::steps
1.  ### Get Your Counter ID
    - Go to [Yandex Metrica](https://metrica.yandex.com/)
    - Create a new counter
    - Copy the `Counter ID` (a numeric value)
2.  ### Add to Environment Variables
    Add your Counter ID to the `.env` file:

    ```env
    PUBLIC_ANALYTICS_YANDEX=XXXXXXXXX
    ```
3. ### Deploy
    The Yandex Metrica script is already included in the layout. It will automatically load when your site is built and deployed.
:::

## Environment Variables Reference
### `PUBLIC_ANALYTICS_GOOGLE`
- **Required**
- Google Analytics 4 Measurement ID

### `PUBLIC_ANALYTICS_YANDEX`
- **Required**
- Yandex Metrica Counter ID

## How It Works
Both analytics scripts are conditionally loaded in the `Head.astro`component:

```astro
<!-- Google Analytics -->
{SEO.analytics.google && (
  <script src={`https://www.googletagmanager.com/gtag/js?id=${SEO.analytics.google}`} async />
)}

<!-- Yandex Metrica -->
{SEO.analytics.yandex && (
  <script async src={`https://mc.yandex.ru/metrika/tag.js`} />
)}
```

The scripts are only included if the corresponding environment variable is set. This keeps your site lightweight and prevents unnecessary script loading.

## Verification
After deployment, verify that tracking is working:

### Google Analytics
1. Open your site
2. Open the browser's Developer Tools <kbd>F12</kbd>
3. Go to the Network tab
4. Look for requests to `www.google-analytics.com` or `analytics.google.com`

### Yandex Metrica
1. Open your site
2. Open the browser's Developer Tools <kbd>F12</kbd>
3. Go to the Network tab
4. Look for requests to `mc.yandex.ru`

## Privacy Considerations
Both Google Analytics and Yandex Metrica collect user data. Make sure to:

- Include a **Privacy Policy** page on your site
- Inform users about data collection
- Use the built-in cookie consent system
- Respect **"Do Not Track"** preferences where possible

## Next Steps
:::card[Pagefind]{href="/docs/pagefind/" icon='book-2'}
Static search engine configuration
:::

:::card[Form]{href="/docs/form/" icon='book-2'}
Contact form integration with Formspree
:::
