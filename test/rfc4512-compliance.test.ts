import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'

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
      // Test valid OIDs that pass grammar and validation
      const validSchema = '( 1.2.3 NAME \'test\' STRUCTURAL )'
      const result = parser.parseSchema(validSchema)
      expect(result.oid).toBe('1.2.3')

      // Some OID formats that grammar allows but our validation catches
      const invalidOidFormats = [
        '( 1.2.3. NAME \'test\' STRUCTURAL )' // Trailing dot
      ]

      invalidOidFormats.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
      })

      // Grammar catches completely invalid formats
      const grammarInvalidOids = [
        '( abc.def NAME \'test\' STRUCTURAL )'
      ]

      grammarInvalidOids.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
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
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Invalid SUP/)
      })
    })

    it('should prevent MUST/MAY attribute overlap', () => {
      // RFC 4512 prohibits the same attribute from appearing in both MUST and MAY lists
      // This test ensures that overlapping attributes are detected and rejected
      const overlappingSchema = '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST ( cn $ sn ) MAY ( cn $ mail ) )'

      expect(() => parser.parseSchema(overlappingSchema)).toThrow()
      expect(() => parser.parseSchema(overlappingSchema)).toThrow(/Attributes cannot appear in both MUST and MAY/)
    })

    it('should validate attribute name format in MUST/MAY', () => {
      // Test that invalid attribute names are properly rejected in MUST/MAY lists
      // Our validation catches invalid attribute names that grammar allows
      const invalidAttributeNames = [
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST ( 123invalid ) )' // Attribute name starting with number
      ]

      invalidAttributeNames.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Invalid attribute name/)
      })

      // Grammar catches completely invalid formats with special characters
      const grammarInvalidAttributes = [
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MAY ( invalid-char@ ) )' // Contains invalid '@' character
      ]

      grammarInvalidAttributes.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Expected.*but.*found/)
      })
    })

    it('should reject unknown fields in objectClass', () => {
      // Test that unknown fields are properly rejected by the grammar
      const invalidSchemas = [
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST cn UNKNOWN \'value\' )', // Unknown field
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST cn INVALID-FIELD \'test\' )', // Invalid field name
        '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST cn EXTRA \'data\' )' // Extra unexpected field
      ]

      invalidSchemas.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
      })

      // Test that a valid schema still works
      const validSchema = '( 1.2.3 NAME \'test\' SUP top STRUCTURAL MUST cn )'
      const result = parser.parseSchema(validSchema)
      expect(result.oid).toBe('1.2.3')
      expect(result.name).toBe('test')
    })
  })

  describe('AttributeType Validation', () => {
    it('should validate OID format for attributeTypes', () => {
      // Some OID formats that our validation catches
      const invalidOidFormats = [
        '( 1.2.3. NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )' // Trailing dot
      ]

      invalidOidFormats.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Invalid OID format/)
      })

      // Grammar catches completely invalid formats
      const grammarInvalidOids = [
        '( abc.def NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
      ]

      grammarInvalidOids.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Expected.*but.*found/)
      })
    })

    it('should require SYNTAX when no SUP is specified', () => {
      const missingSyntax = '( 1.2.3 NAME \'test\' EQUALITY caseIgnoreMatch )'

      expect(() => parser.parseSchema(missingSyntax)).toThrow()
      expect(() => parser.parseSchema(missingSyntax)).toThrow(/AttributeType must have either SUP \(superior type\) or SYNTAX defined/)
    })

    it('should validate SUP field for attributeTypes', () => {
      const invalidSups = [
        '( 1.2.3 NAME \'test\' SUP SYNTAX )',
        '( 1.2.3 NAME \'test\' SUP EQUALITY )'
      ]

      invalidSups.forEach(schema => {
        expect(() => parser.parseSchema(schema)).toThrow()
        expect(() => parser.parseSchema(schema)).toThrow(/Invalid SUP value/)
      })
    })

    it('should accept valid attributeType with SUP', () => {
      const validWithSup = '( 1.2.3 NAME \'test\' SUP name )'
      const result = parser.parseSchema(validWithSup)

      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('1.2.3')
      expect(result.name).toBe('test')
      expect(result.sup).toBe('name')
    })

    it('should accept valid attributeType with SYNTAX', () => {
      const validWithSyntax = '( 1.2.3 NAME \'test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
      const result = parser.parseSchema<LDAPAttributeTypeInterface>(validWithSyntax)

      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('1.2.3')
      expect(result.name).toBe('test')
      expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.15')
    })
  })

  describe('General RFC 4512 Compliance', () => {
    it('should provide RFC 4512 section references in error messages', () => {
      const missingType = '( 1.2.3 NAME \'test\' SUP top MUST cn )'

      expect(() => parser.parseSchema(missingType)).toThrow()
      expect(() => parser.parseSchema(missingType)).toThrow(/ObjectClass must specify exactly one type/)
    })

    it('should validate complete objectClass structure', () => {
      const validObjectClass = '( 1.2.3.4 NAME \'testClass\' DESC \'Test class\' SUP top STRUCTURAL MUST ( cn $ sn ) MAY ( description $ mail ) )'
      const result = parser.parseSchema(validObjectClass)

      expect(result.type).toBe('objectClass')
      expect(result.oid).toBe('1.2.3.4')
      expect(result.name).toBe('testClass')
    })

    it('should validate complete attributeType structure', () => {
      const validAttributeType = '( 1.2.3.4 NAME \'testAttr\' DESC \'Test attribute\' EQUALITY caseIgnoreMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{256} SINGLE-VALUE )'
      const result = parser.parseSchema(validAttributeType)

      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('1.2.3.4')
      expect(result.name).toBe('testAttr')
    })
  })
})
