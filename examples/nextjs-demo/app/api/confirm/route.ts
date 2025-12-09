import { NextRequest, NextResponse } from 'next/server'
import { linePayClient } from '@/lib/linepay'
import { LinePayUtils, Currency } from '@carllee1983/line-pay-online-v4'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('transactionId')
  const orderId = searchParams.get('orderId')

  if (!transactionId || !orderId) {
    return NextResponse.json(
      { error: 'Missing transactionId or orderId' },
      { status: 400 }
    )
  }

  try {
    // Confirm the payment
    const res = await linePayClient.confirm(transactionId, {
      amount: 100,
      currency: Currency.TWD,
    })

    if (res.returnCode === '0000') {
      // Redirect to success page on success
      return NextResponse.redirect(new URL('/payment/success', req.url))
    }

    // Return error JSON on failure
    return NextResponse.json(res, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
