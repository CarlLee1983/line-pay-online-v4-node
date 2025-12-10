# Next.js LINE Pay Demo

This is a Next.js App Router example integrating the `line-pay-online-v4` SDK.

[繁體中文 via README_zh-TW.md](./README_zh-TW.md)

## Prerequisites

- **Node.js** >= 18
- **pnpm** (Required for local workspace linking)

## Setup

1. **Install Dependencies**

   Since this example depends on the local SDK built in the root directory, we recommend using **pnpm** to handle local workspace symlinking correctly, especially when using Next.js Turbopack.

   ```bash
   pnpm install
   ```

2. **Environment Variables**

   Copy the example environment file to `.env.local` and fill in your LINE Pay credentials.

   ```bash
   cp .env.example .env.local
   ```

   **Required Variables:**
   - `LINE_PAY_CHANNEL_ID`: Your Channel ID from LINE Pay Merchant Center.
   - `LINE_PAY_CHANNEL_SECRET`: Your Channel Secret.
   - `LINE_PAY_ENV`: `sandbox` for testing, `production` for live environment.

3. **Run Development Server**

   Start the Next.js development server:

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- **`lib/linepay.ts`**: Initializes the `LinePayClient` singleton with environment variables.
- **`app/api/checkout/route.ts`**: API Route that handles the payment request creation. It calls `client.requestPayment()`.
- **`app/api/confirm/route.ts`**: API Route that handles the payment confirmation callback. It calls `client.confirm()`.
- **`app/page.tsx`**: The main frontend page with a "Pay Now" button.
- **`app/payment/success/page.tsx`**: The success page shown after a successful payment.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
