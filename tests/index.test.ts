import { describe, expect, it } from 'bun:test'
import { Currency, VERSION } from '../src/index'

describe('line-pay-v4-node', () => {
  describe('VERSION', () => {
    it('should export the current version', () => {
      expect(VERSION).toBe('0.0.0')
    })
  })

  describe('Currency Enum', () => {
    it('should include major supported currencies', () => {
      expect(Currency.TWD as string).toBe('TWD')
      expect(Currency.JPY as string).toBe('JPY')
      expect(Currency.THB as string).toBe('THB')
      expect(Currency.USD as string).toBe('USD')
    })

    it('should have correct string values', () => {
      expect(Currency.EUR as string).toBe('EUR')
      expect(Currency.KRW as string).toBe('KRW')
    })

    it('should be usable as a value', () => {
      const myCurrency: Currency = Currency.TWD
      expect(myCurrency as string).toBe('TWD')
    })

    it('should match ISO 4217 standard for sample codes', () => {
      // Sample check of a few random ones to ensure no typos
      expect(Currency.AUD as string).toBe('AUD')
      expect(Currency.CAD as string).toBe('CAD')
      expect(Currency.GBP as string).toBe('GBP')
    })
  })
})
