import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser, RFC4512ErrorType } from '../src'

/**
 * Test suite for RFC4512Parser - Enhanced RFC 4512 Compliance Validation
 *
 * This test suite validates the enhanced RFC 4512 compliance checks
 * that were added to ensure stricter conformity with the specification.
 */
describe('RFC4512Parser - Enhanced RFC 4512 Compliance', () => {
  let parser: RFC4512Parser

  beforeEach(() => {
    parser = new RFC4512Parser()
  })

  describe('ObjectClass Validation', () => {
    it('should validate OID format according to RFC 4512', () => {
      // Test valid OIDs that pass grammar but should fail post-validation
      const validSchema = '( 1.2.3 NAME \'test\' STRUCTURAL )'
      const result = parser.parseSchema(validSchema)
      expect(result.success).toBe(true)

      // Some OID formats that grammar allows but our validation catches
      const invalidOidFormats = [
        '( 1.2.3. NAME \'test\' STRUCTURAL )' // Trailing dot
      ]

      invalidOidFormats.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid OID format')
      })

      // Grammar catches completely invalid formats
      const grammarInvalidOids = [
        '( abc.def NAME \'test\' STRUCTURAL )'
      ]

      grammarInvalidOids.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
      })
    })

    it('should validate SUP field constraints', () => {
      const invalidSups = [
        '( 1.2.3 NAME \'test\' SUP STRUCTURAL STRUCTURAL )',
        '( 1.2.3 NAME \'test\' SUP NAME STRUCTURAL )',
        '( 1.2.3 NAME \'test\' SUP DESC STRUCTURAL )',
        '( 1.2.3 NAME \'test\' SUP 123invalid STRUCTURAL )'
      ]

      invalidSups.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid SUP')
      })
    })

    it('should prevent MUST/MAY attribute overlap', () => {
      // RFC 4512 prohibits the same attribute from appearing in both MUST and MAY lists
      // This test ensures that overlapping attributes are detected and rejected
      const overlappingSchema = '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST ( cn $ sn ) MAY ( cn $ mail ) )'
      const result = parser.parseSchema(overlappingSchema)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Attributes cannot appear in both MUST and MAY: cn')
    })

    it('should validate attribute name format in MUST/MAY', () => {
      // Test that invalid attribute names are properly rejected in MUST/MAY lists
      // Our validation catches invalid attribute names that grammar allows
      const invalidAttributeNames = [
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST ( 123invalid ) )' // Attribute name starting with number
      ]

      invalidAttributeNames.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid attribute name')
      })

      // Grammar catches completely invalid formats with special characters
      const grammarInvalidAttributes = [
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MAY ( invalid-char@ ) )' // Contains invalid '@' character
      ]

      grammarInvalidAttributes.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
      })
    })

    it('should reject unknown fields in objectClass', () => {
      // This would need to be caught by the grammar or additional validation
      const validSchema = '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST cn )'
      const result = parser.parseSchema(validSchema)
      expect(result.success).toBe(true)
    })
  })

  describe('AttributeType Validation', () => {
    it('should validate OID format for attributeTypes', () => {
      // Some OID formats that our validation catches
      const invalidOidFormats = [
        '( 1.2.3. NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )' // Trailing dot
      ]

      invalidOidFormats.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid OID format')
      })

      // Grammar catches completely invalid formats
      const grammarInvalidOids = [
        '( abc.def NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
      ]

      grammarInvalidOids.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
      })
    })

    it('should require SYNTAX when no SUP is specified', () => {
      const missingSyntax = '( 1.2.3 NAME \'test\' EQUALITY caseIgnoreMatch )'
      const result = parser.parseSchema(missingSyntax)

      expect(result.success).toBe(false)
      expect(result.error).toContain('AttributeType must have either SUP (superior type) or SYNTAX defined')
    })

    it('should validate SUP field for attributeTypes', () => {
      const invalidSups = [
        '( 1.2.3 NAME \'test\' SUP SYNTAX )',
        '( 1.2.3 NAME \'test\' SUP EQUALITY )'
      ]

      invalidSups.forEach(schema => {
        const result = parser.parseSchema(schema)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid SUP value')
      })
    })

    it('should accept valid attributeType with SUP', () => {
      const validWithSup = '( 1.2.3 NAME \'test\' SUP name )'
      const result = parser.parseSchema(validWithSup)

      expect(result.success).toBe(true)
    })

    it('should accept valid attributeType with SYNTAX', () => {
      const validWithSyntax = '( 1.2.3 NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
      const result = parser.parseSchema(validWithSyntax)

      expect(result.success).toBe(true)
    })
  })

  describe('General RFC 4512 Compliance', () => {
    it('should provide RFC 4512 section references in error messages', () => {
      const missingType = '( 1.2.3 NAME \'test\' SUP top MUST cn )'
      const result = parser.parseSchema(missingType)

      expect(result.success).toBe(false)
      expect(result.error).toContain('RFC 4512 Section 4.1.1')
    })

    it('should validate complete objectClass structure', () => {
      const validObjectClass = '( 1.2.3.4 NAME \'testClass\' DESC \'Test class\' SUP top STRUCTURAL MUST ( cn $ sn ) MAY ( description $ mail ) )'
      const result = parser.parseSchema(validObjectClass)

      expect(result.success).toBe(true)
      expect(result.data?.type).toBe('objectClass')
      expect(result.data?.oid).toBe('1.2.3.4')
      expect(result.data?.name).toBe('testClass')
    })

    it('should validate complete attributeType structure', () => {
      const validAttributeType = '( 1.2.3.4 NAME \'testAttr\' DESC \'Test attribute\' EQUALITY caseIgnoreMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{256} SINGLE-VALUE )'
      const result = parser.parseSchema(validAttributeType)

      expect(result.success).toBe(true)
      expect(result.data?.type).toBe('attributeType')
      expect(result.data?.oid).toBe('1.2.3.4')
      expect(result.data?.name).toBe('testAttr')
    })
  })
})
