import { describe, expect, it } from 'bun:test'
import { LinePayUtils } from '../src/LinePayUtils'
import { createHmac } from 'node:crypto'

describe('LinePayUtils', () => {
  it('should be instantiable (private constructor coverage)', () => {
    // @ts-expect-error Testing private constructor
    new LinePayUtils()
  })

  describe('generateSignature', () => {
    it('should generate correct HMAC-SHA256 signature', () => {
      const secret = 'd9c2e0b1c2b3e4f5a6b7c8d9e0f1a2b3'
      const uri = '/v4/payments/request'
      const body = JSON.stringify({ amount: 100 })
      const nonce = 'nonce123'
      const queryString = ''

      const expected = createHmac('sha256', secret)
        .update(`${secret}${uri}${queryString}${body}${nonce}`)
        .digest('base64')

      const signature = LinePayUtils.generateSignature(
        secret,
        uri,
        body,
        nonce,
        queryString
      )

      expect(signature).toBe(expected)
    })
  })

  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const secret = 'secret'
      const data = 'some-data-to-sign'
      const signature = createHmac('sha256', secret)
        .update(data)
        .digest('base64')

      expect(LinePayUtils.verifySignature(secret, data, signature)).toBe(true)
    })

    it('should return false for invalid signature', () => {
      const secret = 'secret'
      const data = 'some-data-to-sign'
      const signature = 'invalid-signature'

      expect(LinePayUtils.verifySignature(secret, data, signature)).toBe(false)
    })

    it('should return false for signature with different length (timing-safe)', () => {
      const secret = 'secret'
      const data = 'some-data-to-sign'
      // 建立一個長度不同的簽章
      const shortSignature = 'short'
      const longSignature =
        'very-long-signature-that-is-definitely-not-the-correct-length-for-base64-hmac'

      expect(LinePayUtils.verifySignature(secret, data, shortSignature)).toBe(
        false
      )
      expect(LinePayUtils.verifySignature(secret, data, longSignature)).toBe(
        false
      )
    })
  })

  describe('validateTransactionId', () => {
    it('should not throw for valid 19-digit transactionId', () => {
      expect(() => {
        LinePayUtils.validateTransactionId('1234567890123456789')
      }).not.toThrow()
    })

    it('should throw for transactionId with less than 19 digits', () => {
      expect(() => {
        LinePayUtils.validateTransactionId('123456789')
      }).toThrow('Invalid transactionId format')
    })

    it('should throw for transactionId with more than 19 digits', () => {
      expect(() => {
        LinePayUtils.validateTransactionId('12345678901234567890')
      }).toThrow('Invalid transactionId format')
    })

    it('should throw for transactionId with non-digit characters', () => {
      expect(() => {
        LinePayUtils.validateTransactionId('123456789012345678a')
      }).toThrow('Invalid transactionId format')
    })

    it('should throw for empty transactionId', () => {
      expect(() => {
        LinePayUtils.validateTransactionId('')
      }).toThrow('Invalid transactionId format')
    })
  })

  describe('isValidTransactionId', () => {
    it('should return true for valid 19-digit transactionId', () => {
      expect(LinePayUtils.isValidTransactionId('1234567890123456789')).toBe(
        true
      )
    })

    it('should return false for invalid transactionId', () => {
      expect(LinePayUtils.isValidTransactionId('123')).toBe(false)
      expect(LinePayUtils.isValidTransactionId('12345678901234567890')).toBe(
        false
      )
      expect(LinePayUtils.isValidTransactionId('abc')).toBe(false)
      expect(LinePayUtils.isValidTransactionId('')).toBe(false)
    })
  })

  describe('buildQueryString', () => {
    it('should return empty string for empty params', () => {
      expect(LinePayUtils.buildQueryString()).toBe('')
      expect(LinePayUtils.buildQueryString({})).toBe('')
    })

    it('should return correct query string for valid params', () => {
      const params = {
        key1: 'value1',
        key2: 'value2',
      }
      expect(LinePayUtils.buildQueryString(params)).toBe(
        '?key1=value1&key2=value2'
      )
    })
  })

  describe('parseConfirmQuery', () => {
    it('should extract transactionId and orderId correctly', () => {
      const query = {
        transactionId: '123456789',
        orderId: 'ORDER_001',
      }
      const result = LinePayUtils.parseConfirmQuery(query)
      expect(result.transactionId).toBe('123456789')
      expect(result.orderId).toBe('ORDER_001')
    })

    it('should handle array values (take first)', () => {
      const query = {
        transactionId: ['123', '456'],
        orderId: ['ORD1', 'ORD2'],
      }
      const result = LinePayUtils.parseConfirmQuery(query)
      expect(result.transactionId).toBe('123')
      expect(result.orderId).toBe('ORD1')
    })

    it('should throw error if transactionId is missing', () => {
      const query = {
        orderId: 'ORDER_001',
      }
      expect(() => LinePayUtils.parseConfirmQuery(query)).toThrow(
        'Missing transactionId'
      )
    })

    it('should work without optional orderId', () => {
      const query = {
        transactionId: '123',
      }
      const result = LinePayUtils.parseConfirmQuery(query)
      expect(result.transactionId).toBe('123')
      expect(result.orderId).toBeUndefined()
    })
  })
})
