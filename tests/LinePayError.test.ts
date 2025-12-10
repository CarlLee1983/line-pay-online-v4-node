import { describe, expect, it } from 'bun:test'
import {
  LinePayError,
  LinePayTimeoutError,
  LinePayConfigError,
  LinePayValidationError,
} from '../src'

describe('LinePayError', () => {
  it('should create error with correct message', () => {
    const error = new LinePayError('1104', 'Invalid Channel ID', 400)

    expect(error.message).toBe('LINE Pay API Error [1104]: Invalid Channel ID')
    expect(error.name).toBe('LinePayError')
    expect(error.returnCode).toBe('1104')
    expect(error.returnMessage).toBe('Invalid Channel ID')
    expect(error.httpStatus).toBe(400)
    expect(error.rawResponse).toBeUndefined()
  })

  it('should create error with raw response', () => {
    const rawResponse = '{"returnCode":"1104","returnMessage":"Invalid"}'
    const error = new LinePayError('1104', 'Invalid', 400, rawResponse)

    expect(error.rawResponse).toBe(rawResponse)
  })

  it('should be instanceof Error', () => {
    const error = new LinePayError('1104', 'Test', 400)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(LinePayError)
  })

  describe('isAuthError', () => {
    it('should return true for 1xxx error codes', () => {
      expect(new LinePayError('1104', 'Test', 400).isAuthError).toBe(true)
      expect(new LinePayError('1150', 'Test', 400).isAuthError).toBe(true)
      expect(new LinePayError('1199', 'Test', 400).isAuthError).toBe(true)
    })

    it('should return false for non-1xxx error codes', () => {
      expect(new LinePayError('2101', 'Test', 400).isAuthError).toBe(false)
      expect(new LinePayError('9000', 'Test', 500).isAuthError).toBe(false)
    })
  })

  describe('isPaymentError', () => {
    it('should return true for 2xxx error codes', () => {
      expect(new LinePayError('2101', 'Test', 400).isPaymentError).toBe(true)
      expect(new LinePayError('2042', 'Test', 400).isPaymentError).toBe(true)
    })

    it('should return false for non-2xxx error codes', () => {
      expect(new LinePayError('1104', 'Test', 400).isPaymentError).toBe(false)
      expect(new LinePayError('9000', 'Test', 500).isPaymentError).toBe(false)
    })
  })

  describe('isInternalError', () => {
    it('should return true for 9xxx error codes', () => {
      expect(new LinePayError('9000', 'Test', 500).isInternalError).toBe(true)
      expect(new LinePayError('9999', 'Test', 500).isInternalError).toBe(true)
    })

    it('should return false for non-9xxx error codes', () => {
      expect(new LinePayError('1104', 'Test', 400).isInternalError).toBe(false)
      expect(new LinePayError('2101', 'Test', 400).isInternalError).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return correct JSON object', () => {
      const error = new LinePayError('1104', 'Invalid Channel ID', 400, '{}')
      const json = error.toJSON()

      expect(json).toEqual({
        name: 'LinePayError',
        message: 'LINE Pay API Error [1104]: Invalid Channel ID',
        returnCode: '1104',
        returnMessage: 'Invalid Channel ID',
        httpStatus: 400,
        rawResponse: '{}',
      })
    })

    it('should include undefined rawResponse when not provided', () => {
      const error = new LinePayError('1104', 'Test', 400)
      const json = error.toJSON()

      expect(json.rawResponse).toBeUndefined()
    })
  })
})

describe('LinePayTimeoutError', () => {
  it('should create error with correct message', () => {
    const error = new LinePayTimeoutError(5000)

    expect(error.message).toBe('Request timeout after 5000ms')
    expect(error.name).toBe('LinePayTimeoutError')
    expect(error.timeout).toBe(5000)
    expect(error.url).toBeUndefined()
  })

  it('should create error with URL', () => {
    const error = new LinePayTimeoutError(
      3000,
      'https://api-pay.line.me/v4/payments'
    )

    expect(error.timeout).toBe(3000)
    expect(error.url).toBe('https://api-pay.line.me/v4/payments')
  })

  it('should be instanceof Error', () => {
    const error = new LinePayTimeoutError(5000)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(LinePayTimeoutError)
  })
})

describe('LinePayConfigError', () => {
  it('should create error with correct message', () => {
    const error = new LinePayConfigError('channelId is required')

    expect(error.message).toBe('channelId is required')
    expect(error.name).toBe('LinePayConfigError')
  })

  it('should be instanceof Error', () => {
    const error = new LinePayConfigError('Test')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(LinePayConfigError)
  })
})

describe('LinePayValidationError', () => {
  it('should create error with message only', () => {
    const error = new LinePayValidationError('Amount is required')

    expect(error.message).toBe('Amount is required')
    expect(error.name).toBe('LinePayValidationError')
    expect(error.field).toBeUndefined()
  })

  it('should create error with field', () => {
    const error = new LinePayValidationError('Amount is required', 'amount')

    expect(error.message).toBe('Amount is required')
    expect(error.field).toBe('amount')
  })

  it('should be instanceof Error', () => {
    const error = new LinePayValidationError('Test')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(LinePayValidationError)
  })
})
