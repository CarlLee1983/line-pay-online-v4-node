# Next.js LINE Pay Demo

This is a Next.js App Router example integrating `@carllee1983/line-pay-online-v4` SDK.

## Setup

1. **Install Dependencies**
   Since this example links to the local SDK, please use **pnpm** to ensure correct symlinking with Next.js Turbopack.
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your LINE Pay credentials.
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   - `LINE_PAY_CHANNEL_ID`
   - `LINE_PAY_CHANNEL_SECRET`
   - `LINE_PAY_ENV` (sandbox or production)

3. **Run Development Server**
   ```bash
   pnpm run dev
   ```

## Structure

- `app/api/checkout`: Creates payment request
- `app/api/confirm`: Handles payment confirmation
- `lib/linepay.ts`: SDK initialization
