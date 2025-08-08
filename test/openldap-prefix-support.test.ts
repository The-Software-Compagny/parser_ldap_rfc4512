import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPObjectClassInterface, RFC4512Parser } from '../src'

/**
 * Test suite for OpenLDAP cn=config prefix support in RFC4512Parser
 *
 * This test suite validates the parser's ability to handle OpenLDAP
 * cn=config format with index prefixes like {0}, {57}, etc.
 * These prefixes are used in OpenLDAP's configuration to maintain
 * ordering of multi-valued attributes.
 */
describe('RFC4512Parser - OpenLDAP cn=config Prefix Support', () => {
  let parser: RFC4512Parser

  beforeEach(() => {
    parser = new RFC4512Parser()
  })

  /**
   * Test: Basic prefix removal
   * Verifies that various OpenLDAP index prefixes are correctly removed
   */
  it('should remove various OpenLDAP index prefixes', () => {
    const testCases = [
      {
        input: '{0}( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
        expectedName: 'cn'
      },
      {
        input: '{57}( 1.3.6.1.4.1.7165.2.1.80 NAME \'sambaSupportedEncryptionTypes\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 )',
        expectedName: 'sambaSupportedEncryptionTypes'
      },
      {
        input: '{123}( 2.5.6.6 NAME \'person\' DESC \'RFC2256: a person\' SUP top STRUCTURAL MUST ( sn $ cn ) )',
        expectedName: 'person'
      },
      {
        input: '{9999}( 1.2.3.4 NAME \'testAttribute\' DESC \'Test attribute\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
        expectedName: 'testAttribute'
      }
    ]

    testCases.forEach(({ input, expectedName }) => {
      const result = parser.parseSchema(input)
      expect(result.name).toBe(expectedName)
    })
  })

  /**
   * Test: Prefix with whitespace variations
   * Verifies that prefixes with different whitespace patterns are handled correctly
   */
  it('should handle prefixes with various whitespace patterns', () => {
    const testCases = [
      '  {0}  ( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      '\t{0}\t( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      '{0}( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )', // No extra spaces
      '   {0}( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )' // Leading spaces only
    ]

    testCases.forEach(input => {
      const result = parser.parseSchema(input)
      expect(result.name).toBe('cn')
      expect(result.oid).toBe('2.5.4.3')
    })
  })

  /**
   * Test: Non-prefixed schemas remain unchanged
   * Verifies that schemas without OpenLDAP prefixes are processed normally
   */
  it('should process non-prefixed schemas normally', () => {
    const testCases = [
      '( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      '( 2.5.6.6 NAME \'person\' DESC \'RFC2256: a person\' SUP top STRUCTURAL MUST ( sn $ cn ) )'
    ]

    testCases.forEach(input => {
      const result = parser.parseSchema(input)
      expect(result).toBeDefined()
      expect(result.oid).toBeDefined()
      expect(result.name).toBeDefined()
    })
  })

  /**
   * Test: ObjectClass schemas with OpenLDAP prefixes
   * Verifies that ObjectClass definitions with prefixes are parsed correctly
   */
  it('should handle ObjectClass schemas with OpenLDAP prefixes', () => {
    const objectClassWithPrefix = '{5}( 2.5.6.6 NAME \'person\' DESC \'RFC2256: a person\' SUP top STRUCTURAL MUST ( sn $ cn ) MAY ( userPassword $ telephoneNumber $ seeAlso $ description ) )'

    const result = parser.parseSchema<LDAPObjectClassInterface>(objectClassWithPrefix)

    expect(result.type).toBe('objectClass')
    expect(result.oid).toBe('2.5.6.6')
    expect(result.name).toBe('person')
    expect(result.desc).toBe('RFC2256: a person')
    expect(result.objectClassType).toBe('STRUCTURAL')
    expect(result.sup).toEqual(['top'])
    expect(result.must).toEqual(['sn', 'cn'])
    expect(result.may).toEqual(['userPassword', 'telephoneNumber', 'seeAlso', 'description'])
  })

  /**
   * Test: Utility methods work with prefixed schemas
   * Verifies that extractOID and extractName work correctly with prefixed schemas
   */
  it('should work with utility methods for prefixed schemas', () => {
    const prefixedSchema = '{42}( 1.2.3.4.5 NAME \'testAttribute\' DESC \'Test attribute with prefix\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'

    const oid = parser.extractOID(prefixedSchema)
    const name = parser.extractName(prefixedSchema)

    expect(oid).toBe('1.2.3.4.5')
    expect(name).toBe('testAttribute')
  })

  /**
   * Test: Schema validation works with prefixed schemas
   * Verifies that isValidSchema correctly identifies valid prefixed schemas
   */
  it('should validate prefixed schemas correctly', () => {
    const validPrefixedSchema = '{100}( 2.5.4.3 NAME \'cn\' DESC \'Common Name\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
    const invalidPrefixedSchema = '{100}( invalid schema definition )'

    expect(parser.isValidSchema(validPrefixedSchema)).toBe(true)
    expect(parser.isValidSchema(invalidPrefixedSchema)).toBe(false)
  })

  /**
   * Test: Edge cases with prefix patterns
   * Verifies that edge cases are handled correctly
   */
  it('should handle edge cases with prefix patterns', () => {
    const testCases = [
      // Single digit
      '{0}( 2.5.4.3 NAME \'test0\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Multiple digits
      '{12345}( 2.5.4.3 NAME \'test12345\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Prefix with no spaces
      '{1}( 2.5.4.3 NAME \'test1\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Prefix with multiple spaces
      '{2}   ( 2.5.4.3 NAME \'test2\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
    ]

    testCases.forEach((input, index) => {
      const result = parser.parseSchema(input)
      expect(result).toBeDefined()
      expect(result.oid).toBe('2.5.4.3')
      const expectedName = index === 1 ? 'test12345' : `test${index === 0 ? '0' : index === 2 ? '1' : '2'}`
      expect(result.name).toBe(expectedName)
    })
  })

  /**
   * Test: Invalid prefix patterns are not modified
   * Verifies that strings that look like prefixes but aren't valid are left alone
   */
  it('should not modify invalid prefix-like patterns', () => {
    const testCases = [
      // Not at start of string
      'test {0}( 2.5.4.3 NAME \'cn\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Missing opening brace
      '0}( 2.5.4.3 NAME \'cn\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Missing closing brace
      '{0( 2.5.4.3 NAME \'cn\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )',
      // Non-numeric content
      '{abc}( 2.5.4.3 NAME \'cn\' DESC \'Test\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 )'
    ]

    testCases.forEach(input => {
      // These should fail to parse because they're not valid RFC 4512 format
      expect(parser.isValidSchema(input)).toBe(false)
    })
  })
})
