import { describe, expect, it, mock } from 'bun:test'
import { LinePayClient } from '../src/LinePayClient'
import { RequestPayment } from '../src/payments/RequestPayment'
import { Currency } from '../src/enums/Currency'
import type { PaymentPackage } from '../src/domain/PaymentPackage'
import type { RequestPaymentResponse } from '../src/payments/PaymentResponse'
import type { PaymentRequestBody } from '../src/payments/PaymentRequest'

describe('RequestPayment Operation', () => {
  const config = {
    channelId: '123',
    channelSecret: 'secret',
    env: 'sandbox' as const,
  }

  // Mock Client
  const client = new LinePayClient(config)
  const mockRequestPayment = mock(() =>
    Promise.resolve({
      returnCode: '0000',
      returnMessage: 'OK',
      info: {},
    } as RequestPaymentResponse)
  )
  client.requestPayment = mockRequestPayment

  it('should build and send a valid request', async () => {
    const pkg: PaymentPackage = {
      id: 'pkg1',
      amount: 100,
      products: [{ name: 'test', quantity: 1, price: 100 }],
    }

    const request = new RequestPayment(client)
    await request
      .setAmount(100)
      .setCurrency(Currency.TWD)
      .setOrderId('order123')
      .addPackage(pkg)
      .setRedirectUrls('https://confirm', 'https://cancel')
      .setOptions({ display: { locale: 'en' } }) // Add options
      .send()

    expect(mockRequestPayment).toHaveBeenCalledTimes(1)
    const callArg = (
      mockRequestPayment.mock.calls[0] as unknown as [PaymentRequestBody]
    )[0]
    expect(callArg).toEqual({
      amount: 100,
      currency: Currency.TWD,
      orderId: 'order123',
      packages: [pkg],
      redirectUrls: {
        confirmUrl: 'https://confirm',
        cancelUrl: 'https://cancel',
      },
      options: { display: { locale: 'en' } }, // Verify options
    })
  })

  it('should throw error if required fields are missing', () => {
    const request = new RequestPayment(client)
    expect(() => {
      request.validate()
    }).toThrow('Amount is required')

    request.setAmount(100)
    expect(() => {
      request.validate()
    }).toThrow('Currency is required')

    request.setCurrency(Currency.USD)
    expect(() => {
      request.validate()
    }).toThrow('OrderId is required')

    request.setOrderId('123')
    expect(() => {
      request.validate()
    }).toThrow('At least one package is required')

    request.addPackage({ id: 'p', amount: 50, products: [] })
    expect(() => {
      request.validate()
    }).toThrow('Redirect URLs are required')
  })

  it('should throw error if amounts do not match', () => {
    const request = new RequestPayment(client)
    request
      .setAmount(100)
      .setCurrency(Currency.TWD)
      .setOrderId('123')
      .setRedirectUrls('c', 'c')
      .addPackage({ id: 'p', amount: 50, products: [] }) // 50 != 100

    expect(() => {
      request.validate()
    }).toThrow('Sum of package amounts (50) does not match total amount (100)')
  })

  it('should throw error if product amounts do not match package amount', () => {
    const request = new RequestPayment(client)
    const pkgMismatch: PaymentPackage = {
      id: 'pkg1',
      amount: 100, // Package says 100
      products: [{ name: 'test', quantity: 1, price: 90 }], // Product is 90
    }

    request
      .setAmount(100)
      .setCurrency(Currency.TWD)
      .setOrderId('123')
      .setRedirectUrls('c', 'c')
      .addPackage(pkgMismatch)

    expect(() => {
      request.validate()
    }).toThrow(
      'Sum of product amounts (90) in package index 0 does not match package amount (100)'
    )
  })
})
