import { NextResponse } from 'next/server'
import { linePayClient } from '@/lib/linepay'
import { Currency } from '@carllee1983/line-pay-online-v4'

export async function POST() {
  const orderId = `ORDER_${Date.now()}`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  console.log('Checkout API called', {
    orderId,
    baseUrl,
    hasChannelId: !!process.env.LINE_PAY_CHANNEL_ID,
    hasSecret: !!process.env.LINE_PAY_CHANNEL_SECRET,
  })

  try {
    const res = await linePayClient
      .payment()
      .setAmount(100)
      .setCurrency(Currency.TWD)
      .setOrderId(orderId)
      .addPackage({
        id: 'pkg_1',
        amount: 100,
        products: [
          {
            name: 'Demo Product',
            quantity: 1,
            price: 100,
          },
        ],
      })
      .setRedirectUrls(`${baseUrl}/api/confirm`, `${baseUrl}`)
      .send()

    return NextResponse.json(res)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
