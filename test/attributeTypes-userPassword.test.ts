import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser } from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions in LDIF format, specifically
 * testing against the 'userPassword' attribute type definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Equality matching rule extraction
 * - Syntax OID extraction
 * - Syntax length limitation detection
 * - Schema type detection
 * - Schema validation
 * - Direct utility method testing
 */
describe('RFC4512Parser - AttributeTypes LDIF - userPassword', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the userPassword.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/userPassword.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the userPassword attributeType LDIF file', () => {
    // Parse the schema definition
    const result = parser.parseSchema(ldifContent)

    // Verify that parsing succeeded
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the userPassword attributeType definition
   */
  it('should correctly extract the OID from the userPassword attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.oid).toBe('2.5.4.35')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the userPassword attributeType definition
   */
  it('should correctly extract the NAME from the userPassword attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('userPassword')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the userPassword attributeType definition
   */
  it('should correctly extract the DESCRIPTION from the userPassword attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.desc).toBe('User Password')
  })

  /**
   * Test: EQUALITY matching rule extraction
   * Verifies that the parser correctly extracts the equality matching rule
   * from the userPassword attributeType definition
   */
  it('should correctly extract the EQUALITY matching rule', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.equality).toBe('octetStringMatch')
  })

  /**
   * Test: SYNTAX extraction
   * Verifies that the parser correctly extracts the syntax OID
   * from the userPassword attributeType definition
   */
  it('should correctly extract the SYNTAX', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.40')
  })

  /**
   * Test: SYNTAX length limitation
   * Verifies that the parser correctly extracts the syntax length limitation
   * from the userPassword attributeType definition
   */
  it('should correctly extract the SYNTAX length limitation', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.syntax?.length).toBe(128)
  })

  /**
   * Test: SINGLE-VALUE detection
   * Verifies that the parser correctly detects that userPassword does not have SINGLE-VALUE specified
   * (multi-value is allowed for password attributes by default)
   */
  it('should correctly detect that userPassword does not specify SINGLE-VALUE', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.singleValue).toBe(false)
  })

  /**
   * Test: Schema type detection
   * Verifies that the parser correctly identifies the schema type
   * as an attributeType
   */
  it('should detect the attributeType schema type', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.success).toBe(true)
    expect(result.data?.type).toBe('attributeType')
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

    expect(oid).toBe('2.5.4.35')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('userPassword')
  })
})
