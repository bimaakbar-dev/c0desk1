---
slug: "analytics"
title: "Analytics"
description: "Integrate Google Analytics and Yandex Metrica with Unloyd."
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
  description: "Integrate Google Analytics and Yandex Metrica with Unloyd."
  noIndex: false
lastUpdated: 2026-08-12T15:03:00Z
---

Unloyd supports Google Analytics (GA4) and Yandex Metrica out of the box. Set the environment variable and deploy — no code changes needed.

---

## Google Analytics (GA4)

:::steps

1. ### Get Your Measurement ID
   - Go to [Google Analytics](https://analytics.google.com/)
   - Navigate to **Admin** → **Data Streams** → select or create a web stream
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

2. ### Add to Environment Variables

   ```env
   PUBLIC_ANALYTICS_GOOGLE=G-XXXXXXXXXX
   ```

3. ### Deploy

   The script loads automatically on build. No further setup needed.

   > [!NOTE]
   > The script uses `data-consent="required"` and is integrated with the cookie consent system.
   > :::

## Yandex Metrica

:::steps

1. ### Get Your Counter ID
   - Go to [Yandex Metrica](https://metrica.yandex.com/)
   - Create a new counter and copy the **Counter ID** (numeric value)

2. ### Add to Environment Variables

   ```env
   PUBLIC_ANALYTICS_YANDEX=XXXXXXXXX
   ```

3. ### Deploy
   The script loads automatically on build. No further setup needed.
   :::

## How It Works

Both scripts are conditionally loaded in `Head.astro` — they only render if the corresponding environment variable is set. This keeps your site lightweight when analytics are not configured.

## Privacy Considerations

Both services collect user data. Make sure your site has:

- A **Privacy Policy** page
- The built-in cookie consent system enabled
- Clear notice to users about data collection
