import { LinePayClient } from '@carllee1983/line-pay-online-v4'

export const linePayClient = new LinePayClient({
  channelId: process.env.LINE_PAY_CHANNEL_ID || '',
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET || '',
  env: (process.env.LINE_PAY_ENV as 'sandbox' | 'production') || 'sandbox',
})
