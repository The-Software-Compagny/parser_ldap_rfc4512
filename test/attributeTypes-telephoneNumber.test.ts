import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions in LDIF format, specifically
 * testing against the 'telephoneNumber' attribute type definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Equality matching rule extraction
 * - Substring matching rule extraction
 * - Syntax OID extraction (with length restriction)
 * - Schema type detection
 * - Schema validation
 * - Direct utility method testing
 */
describe('RFC4512Parser - telephoneNumber AttributeType LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the telephoneNumber.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/telephoneNumber.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the telephoneNumber attributeType LDIF file', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result).toBeDefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the OID from the telephoneNumber attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('2.5.4.20')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the NAME from the telephoneNumber attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('telephoneNumber')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the DESCRIPTION from the telephoneNumber attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('RFC2256: Telephone Number')
  })

  /**
   * Test: EQUALITY matching rule extraction
   * Verifies that the parser correctly extracts the equality matching rule
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the EQUALITY matching rule', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.equality).toBe('telephoneNumberMatch')
  })

  /**
   * Test: SUBSTR matching rule extraction
   * Verifies that the parser correctly extracts the substring matching rule
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the SUBSTR matching rule', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.substr).toBe('telephoneNumberSubstringsMatch')
  })

  /**
   * Test: SYNTAX extraction
   * Verifies that the parser correctly extracts the syntax OID with length restriction
   * from the telephoneNumber attributeType definition
   */
  it('should correctly extract the SYNTAX with length restriction', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.50')
    expect(result.syntax?.length).toBe(32)
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

    expect(oid).toBe('2.5.4.20')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('telephoneNumber')
  })
})
