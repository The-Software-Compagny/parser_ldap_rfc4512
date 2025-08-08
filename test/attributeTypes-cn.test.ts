import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions in LDIF format, specifically
 * testing against the 'cn' (Common Name) attribute type definition.
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
describe('RFC4512Parser - AttributeTypes LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the cn.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/cn.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the sample-olcAttributeTypes.ldif file', () => {
    // Parse the schema definition
    const result = parser.parseSchema(ldifContent)

    // Verify that parsing succeeded
    expect(result).toBeDefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the cn attributeType definition
   */
  it('should correctly extract the OID from the cn attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('2.5.4.3')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the cn attributeType definition
   */
  it('should correctly extract the NAME from the cn attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('cn')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the cn attributeType definition
   */
  it('should correctly extract the DESCRIPTION from the cn attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('Common Name')
  })

  /**
   * Test: EQUALITY matching rule extraction
   * Verifies that the parser correctly extracts the equality matching rule
   * from the cn attributeType definition
   */
  it('should correctly extract the EQUALITY matching rule', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.equality).toBe('caseIgnoreMatch')
  })

  /**
   * Test: SYNTAX extraction
   * Verifies that the parser correctly extracts the syntax OID
   * from the cn attributeType definition
   */
  it('should correctly extract the SYNTAX', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.15')
  })

  /**
   * Test: SINGLE-VALUE detection
   * Verifies that the parser correctly detects the SINGLE-VALUE flag
   * in the cn attributeType definition
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

    expect(oid).toBe('2.5.4.3')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('cn')
  })
})
