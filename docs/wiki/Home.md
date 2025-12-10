# Welcome to line-pay-online-v4 Wiki

This wiki provides detailed documentation, examples, and guides for the official LINE Pay Online V4 API SDK.

## Getting Started

### Installation

```bash
# npm
npm install line-pay-online-v4

# pnpm
pnpm add line-pay-online-v4

# yarn
yarn add line-pay-online-v4

# bun
bun add line-pay-online-v4
```

### Basic Usage

Initialize the client with your Channel ID and Secret.

```typescript
import { LinePayClient } from 'line-pay-online-v4'

const client = new LinePayClient({
  channelId: process.env.LINE_PAY_CHANNEL_ID,
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET,
  env: 'sandbox', // or 'production'
  timeout: 5000 // optional, defaults to 20s
})
```

## Navigation

- [API Reference](API-Reference)
- [Error Handling](Error-Handling)
- [Examples](Examples)
