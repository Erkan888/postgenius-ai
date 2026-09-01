# PostGenius AI

Build a production-ready, responsive one-page Micro-SaaS called PostGenius. Use a dark violet/indigo SaaS aesthetic with a polished minimalist logo combining a lightning bolt and quotation/speech-mark motif in the top-left nav. Implement the hero (“Transform Your Ideas Into Viral Posts in Seconds”), workspace/dashboard where users paste notes, choose Professional/Casual/Witty tone, LinkedIn/Twitter platform, then generate high-converting post/thread. Use Google Gemini AI securely through server-side configuration, with useful loading, error, empty, and missing-configuration states plus a settings/configuration fallback modal. Include pricing: Free limited generations and Pro $29/month, and Stripe subscription checkout flow ready for activation. Enable Lovable Cloud for database/auth: user signup, login, secure sessions, usage limits, and saved generations. Use React, Tailwind, and Lucide. Connect to the user-provided Supabase project if feasible (URL https://qyeztscgcbwmsrfdqxic.supabase.co; publishable key supplied by user) otherwise use Lovable Cloud and clearly configure it. Do not expose API keys client-side. User supplied Gemini API key and asked it to be configured; request it through secure secret entry if needed. User named Stripe secret as '@secret:STRIPE_LIVE_API_KEY'; request the actual secret through the secure secret flow if needed. Make it fully functional out of the box once secure secrets/connectors are provided.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c1dee44c-92fb-4daa-b1f3-919a13e6e76c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
