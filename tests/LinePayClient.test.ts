import { describe, expect, it, mock } from 'bun:test'
import { LinePayClient } from '../src/LinePayClient'
import { Currency } from '../src/enums/Currency'
import type { PaymentRequestBody } from '../src/payments/PaymentRequest'
import { LinePayError, LinePayTimeoutError, LinePayConfigError } from '../src'

describe('LinePayClient', () => {
  const config = {
    channelId: '1234567890',
    channelSecret: 'testsecret',
    env: 'sandbox' as const,
  }

  // 有效的 19 位數字 transactionId（用於測試）
  const VALID_TRANSACTION_ID = '1234567890123456789'

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
      info: { transactionId: VALID_TRANSACTION_ID },
    }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.confirm(VALID_TRANSACTION_ID, {
      amount: 100,
      currency: Currency.TWD,
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain(`/v4/payments/${VALID_TRANSACTION_ID}/confirm`)
    expect(init.method).toBe('POST')
    expect(init.body).toContain('"amount":100')
  })

  it('should call capture correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = {
      returnCode: '0000',
      returnMessage: 'OK',
      info: { transactionId: VALID_TRANSACTION_ID },
    }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.capture(VALID_TRANSACTION_ID, {
      amount: 100,
      currency: Currency.TWD,
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain(
      `/v4/payments/authorizations/${VALID_TRANSACTION_ID}/capture`
    )
    expect(init.method).toBe('POST')
  })

  it('should call void correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: {} }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.void(VALID_TRANSACTION_ID)

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain(
      `/v4/payments/authorizations/${VALID_TRANSACTION_ID}/void`
    )
    expect(init.method).toBe('POST')
  })

  it('should call refund correctly', async () => {
    const client = new LinePayClient(config)
    const mockResponse = { returnCode: '0000', returnMessage: 'OK', info: {} }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    await client.refund(VALID_TRANSACTION_ID, { refundAmount: 50 })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain(`/v4/payments/${VALID_TRANSACTION_ID}/refund`)
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

    await client.checkStatus(VALID_TRANSACTION_ID)

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain(`/v4/payments/requests/${VALID_TRANSACTION_ID}/check`)
    expect(init.method).toBe('GET')
  })

  it('should handle API errors correctly with LinePayError', async () => {
    const client = new LinePayClient(config)
    const errorResponse = {
      returnCode: '1104',
      returnMessage: 'Invalid Channel ID',
    }
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(errorResponse), {
          status: 400,
          statusText: 'Bad Request',
        })
      )
    )
    global.fetch = fetchMock as unknown as typeof fetch

    try {
      await client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LinePayError)
      const linePayError = error as LinePayError
      expect(linePayError.returnCode).toBe('1104')
      expect(linePayError.returnMessage).toBe('Invalid Channel ID')
      expect(linePayError.httpStatus).toBe(400)
    }
  })

  it('should handle non-JSON API errors correctly', async () => {
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

    try {
      await client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LinePayError)
      const linePayError = error as LinePayError
      expect(linePayError.returnCode).toBe('PARSE_ERROR')
    }
  })

  it('should handle business logic errors (returnCode !== 0000)', async () => {
    const client = new LinePayClient(config)
    const errorResponse = {
      returnCode: '1150',
      returnMessage: 'Transaction not found',
    }
    const fetchMock = mock(() =>
      Promise.resolve(new Response(JSON.stringify(errorResponse)))
    )
    global.fetch = fetchMock as unknown as typeof fetch

    try {
      await client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LinePayError)
      const linePayError = error as LinePayError
      expect(linePayError.returnCode).toBe('1150')
      expect(linePayError.isAuthError).toBe(true)
    }
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

  it('should handle timeout errors correctly with LinePayTimeoutError', async () => {
    const client = new LinePayClient(config)
    const fetchMock = mock(() => {
      const error = new Error('The operation was aborted')
      error.name = 'AbortError'
      return Promise.reject(error)
    })
    global.fetch = fetchMock as unknown as typeof fetch

    try {
      await client.requestPayment({
        amount: 100,
        currency: Currency.TWD,
        orderId: '1',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LinePayTimeoutError)
      const timeoutError = error as LinePayTimeoutError
      expect(timeoutError.timeout).toBe(20000)
    }
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
      await shortTimeoutClient.checkStatus(VALID_TRANSACTION_ID)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LinePayTimeoutError)
      expect((error as LinePayTimeoutError).timeout).toBe(1)
    }
  })

  it('should validate transactionId format', () => {
    const client = new LinePayClient(config)

    // 無效的 transactionId 應該拋出錯誤（同步驗證）
    expect(() =>
      client.confirm('12345', { amount: 100, currency: Currency.TWD })
    ).toThrow('Invalid transactionId format')

    expect(() => client.checkStatus('invalid')).toThrow(
      'Invalid transactionId format'
    )
  })

  it('should throw LinePayConfigError for invalid config', () => {
    expect(
      () => new LinePayClient({ channelId: '', channelSecret: 'test' })
    ).toThrow(LinePayConfigError)
    expect(
      () => new LinePayClient({ channelId: 'test', channelSecret: '' })
    ).toThrow(LinePayConfigError)
    expect(
      () =>
        new LinePayClient({
          channelId: 'test',
          channelSecret: 'test',
          timeout: -1,
        })
    ).toThrow(LinePayConfigError)
  })
})
