import { describe, expect, it, mock } from 'bun:test'
import { LinePayClient } from '../src/LinePayClient'
import { Currency } from '../src/enums/Currency'
import type { PaymentRequestBody } from '../src/payments/PaymentRequest'

describe('LinePayClient', () => {
  const config = {
    channelId: '1234567890',
    channelSecret: 'testsecret',
    env: 'sandbox' as const,
  }

  it('should be instantiated correctly', () => {
    const client = new LinePayClient(config)
    expect(client).toBeInstanceOf(LinePayClient)
  })

  it('should return a RequestPayment builder from payment()', () => {
    const client = new LinePayClient(config)
    const builder = client.payment()
    expect(builder).toBeDefined()
    expect(typeof builder.setAmount).toBe('function')
    expect(typeof builder.send).toBe('function')
  })

  it('should construct correct signature and headers for requestPayment', async () => {
    const client = new LinePayClient(config)

    // Mock successful response
    const mockResponse = {
      returnCode: '0000',
      returnMessage: 'Success',
      info: {
        paymentUrl: {
          web: 'https://sandbox-web-pay.line.me/web/payment/url',
          app: 'line://pay/payment/url',
        },
        transactionId: '12345678910',
        paymentAccessToken: '1234567890',
      },
    }

    // Mock global fetch
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const requestBody: PaymentRequestBody = {
      amount: 100,
      currency: Currency.TWD,
      orderId: 'ORDER_20231201_001',
      packages: [
        {
          id: 'PKG_1',
          amount: 100,
          products: [
            {
              name: 'Test Product',
              quantity: 1,
              price: 100,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: 'https://example.com/confirm',
        cancelUrl: 'https://example.com/cancel',
      },
    }

    const response = await client.requestPayment(requestBody)

    expect(response).toEqual(mockResponse)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Check if correct headers and body were sent
    const calls = fetchMock.mock.calls
    expect(calls).toHaveLength(1)

    // Bun's mock calls might handle arguments differently.
    // Usually it is [ [arg1, arg2], [arg1, arg2] ]
    const [url, init] = calls[0] as unknown as [string, RequestInit]

    expect(url).toContain('https://sandbox-api-pay.line.me/v4/payments/request')
    expect(init.method).toBe('POST')
    expect(init.headers).toBeDefined()

    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['X-LINE-ChannelId']).toBe(config.channelId)
    expect(headers['X-LINE-Authorization-Nonce']).toBeDefined()
    expect(headers['X-LINE-Authorization']).toBeDefined()
  })

  it('should call confirm correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = {
      returnCode: '0000',
      returnMessage: 'OK',
      info: { transactionId: '123' },
    }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.confirm('12345', { amount: 100, currency: Currency.TWD })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/12345/confirm')
    expect(init.method).toBe('POST')
    expect(init.body).toContain('"amount":100')
  })

  it('should call capture correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = {
      returnCode: '0000',
      returnMessage: 'OK',
      info: { transactionId: '123' },
    }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.capture('12345', { amount: 100, currency: Currency.TWD })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/authorizations/12345/capture')
    expect(init.method).toBe('POST')
  })

  it('should call void correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: {} }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.void('12345')

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/authorizations/12345/void')
    expect(init.method).toBe('POST')
  })

  it('should call refund correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: {} }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.refund('12345', { refundAmount: 50 })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/12345/refund')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ refundAmount: 50 }))
  })

  it('should call getDetails correctly with params', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: [] }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.getDetails({ transactionId: ['123', '456'], fields: 'amount' })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/requests')
    expect(url).toContain('transactionId=123%2C456')
    expect(url).toContain('transactionId=123%2C456')
    expect(url).toContain('fields=amount')
    expect(init.method).toBe('GET')
  })

  it('should call getDetails with orderId correctly', async () => {
    const client = new LinePayClient(config)
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ returnCode: '0000', info: [] }))
      )
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.getDetails({ orderId: ['ORDER_1', 'ORDER_2'] })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/requests')
    expect(init.method).toBe('GET')
    expect(url).toContain('orderId=ORDER_1%2CORDER_2')
  })

  it('should call checkStatus correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: {} }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.checkStatus('12345')

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('/v4/payments/requests/12345/check')
    expect(init.method).toBe('GET')
  })

  it('should handle API errors correctly', () => {
    const client = new LinePayClient(config)
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response('Bad Request', {
          status: 400,
          statusText: 'Bad Request',
        })
      )
    )
    global.fetch = fetchMock as unknown as typeof fetch

    expect(
      client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
    ).rejects.toThrow('LINE Pay API Error: 400 Bad Request - Bad Request')
  })

  it('should handle network errors correctly', () => {
    const client = new LinePayClient(config)
    const fetchMock = mock(() => Promise.reject(new Error('Network Error')))
    global.fetch = fetchMock as unknown as typeof fetch

    expect(
      client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
    ).rejects.toThrow('Network Error')
  })

  it('should handle timeout errors correctly', () => {
    const client = new LinePayClient(config)
    const fetchMock = mock(() => {
      const error = new Error('The operation was aborted')
      error.name = 'AbortError'
      return Promise.reject(error)
    })
    global.fetch = fetchMock as unknown as typeof fetch

    expect(
      client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
    ).rejects.toThrow('Request timeout after 20000ms')
  })

  it('should abort request on actual timeout (coverage for setTimeout)', async () => {
    const shortTimeoutClient = new LinePayClient({
      ...config,
      timeout: 1,
    })

    // Mock fetch to never resolve (or resolve slow)
    const fetchMock = mock((_url, options) => {
      return new Promise<Response>((_, reject) => {
        const signal = (options as RequestInit).signal
        if (signal?.aborted === true) {
          const err = new Error('The operation was aborted')
          err.name = 'AbortError'
          reject(err)
          return
        }
        signal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })
    global.fetch = fetchMock as unknown as typeof fetch

    try {
      await shortTimeoutClient.checkStatus('123')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as Error).message).toBe('Request timeout after 1ms')
    }
  })
})
