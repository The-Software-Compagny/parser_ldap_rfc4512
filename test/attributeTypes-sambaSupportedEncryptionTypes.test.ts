import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions in LDIF format, specifically
 * testing against the 'sambaSupportedEncryptionTypes' attribute type definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Equality matching rule extraction
 * - Syntax OID extraction
 * - Single-value flag detection
 * - Schema type detection
 * - Schema validation
 * - Direct utility method testing
 */
describe('RFC4512Parser - AttributeTypes LDIF (sambaSupportedEncryptionTypes)', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the sambaSupportedEncryptionTypes.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/sambaSupportedEncryptionTypes.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the sambaSupportedEncryptionTypes.ldif file', () => {
    // Parse the schema definition
    const result = parser.parseSchema(ldifContent)

    // Verify that parsing succeeded
    expect(result).toBeDefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly extract the OID from the sambaSupportedEncryptionTypes attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('1.3.6.1.4.1.7165.2.1.80')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly extract the NAME from the sambaSupportedEncryptionTypes attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('sambaSupportedEncryptionTypes')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly extract the DESCRIPTION from the sambaSupportedEncryptionTypes attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('Supported encryption types of a trust')
  })

  /**
   * Test: EQUALITY matching rule extraction
   * Verifies that the parser correctly extracts the equality matching rule
   * from the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly extract the EQUALITY matching rule', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.equality).toBe('integerMatch')
  })

  /**
   * Test: SYNTAX extraction
   * Verifies that the parser correctly extracts the syntax OID
   * from the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly extract the SYNTAX', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.27')
  })

  /**
   * Test: SINGLE-VALUE detection
   * Verifies that the parser correctly detects the SINGLE-VALUE flag
   * in the sambaSupportedEncryptionTypes attributeType definition
   */
  it('should correctly detect SINGLE-VALUE', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.singleValue).toBe(true)
  })

  /**
   * Test: Schema type detection
   * Verifies that the parser correctly identifies the schema type
   * as an attributeType
   */
  it('should detect the attributeType schema type', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.type).toBe('attributeType')
  })

  /**
   * Test: Schema validation
   * Verifies that the parser's validation method correctly identifies
   * the schema definition as syntactically valid
   */
  it('should validate that the definition is syntactically correct', () => {
    const isValid = parser.isValidSchema(ldifContent)

    expect(isValid).toBe(true)
  })

  /**
   * Test: Direct OID extraction utility
   * Verifies that the extractOID utility method works correctly
   * for direct OID extraction without full parsing
   */
  it('should use extractOID to get the OID directly', () => {
    const oid = parser.extractOID(ldifContent)

    expect(oid).toBe('1.3.6.1.4.1.7165.2.1.80')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('sambaSupportedEncryptionTypes')
  })

  /**
   * Test: OpenLDAP cn=config prefix support
   * Verifies that the parser correctly handles OpenLDAP index prefixes
   * like {57} that are used in cn=config format
   */
  it('should handle OpenLDAP cn=config prefix {57} correctly', () => {
    // Verify that the original content contains the prefix
    expect(ldifContent).toContain('{57}(')

    // Verify that parsing works despite the prefix
    const result = parser.parseSchema(ldifContent)

    expect(result).toBeDefined()
    expect(result.oid).toBe('1.3.6.1.4.1.7165.2.1.80')
    expect(result.name).toBe('sambaSupportedEncryptionTypes')
  })

  /**
   * Test: OpenLDAP prefix variants support
   * Verifies that the parser correctly handles different OpenLDAP index formats
   */
  it('should handle various OpenLDAP prefix formats', () => {
    // Test different prefix formats
    const testCases = [
      '{0}( 1.3.6.1.4.1.7165.2.1.80 NAME \'test0\' DESC \'Test with 0\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 )',
      '  {123}  ( 1.3.6.1.4.1.7165.2.1.80 NAME \'test123\' DESC \'Test with spaces\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 )',
      '{9999}( 1.3.6.1.4.1.7165.2.1.80 NAME \'test9999\' DESC \'Test with large number\' SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 )'
    ]

    testCases.forEach((testCase, index) => {
      const result = parser.parseSchema(testCase)
      expect(result).toBeDefined()
      expect(result.oid).toBe('1.3.6.1.4.1.7165.2.1.80')
      expect(result.name).toBe(`test${index === 0 ? '0' : index === 1 ? '123' : '9999'}`)
    })
  })

  /**
   * Test: Mixed format compatibility
   * Verifies that the parser works with both pure RFC 4512 format and OpenLDAP format
   */
  it('should work with both RFC 4512 pure format and OpenLDAP cn=config format', () => {
    // RFC 4512 pure format (without prefix)
    const rfc4512Format = '( 1.3.6.1.4.1.7165.2.1.80 NAME \'sambaSupportedEncryptionTypes\' DESC \'Supported encryption types of a trust\' EQUALITY integerMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 SINGLE-VALUE )'

    // OpenLDAP cn=config format (with prefix)
    const openLdapFormat = '{57}( 1.3.6.1.4.1.7165.2.1.80 NAME \'sambaSupportedEncryptionTypes\' DESC \'Supported encryption types of a trust\' EQUALITY integerMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.27 SINGLE-VALUE )'

    // Both should parse to the same result
    const rfc4512Result = parser.parseSchema(rfc4512Format)
    const openLdapResult = parser.parseSchema(openLdapFormat)

    expect(rfc4512Result).toEqual(openLdapResult)
    expect(rfc4512Result.oid).toBe('1.3.6.1.4.1.7165.2.1.80')
    expect(rfc4512Result.name).toBe('sambaSupportedEncryptionTypes')
  })
})
