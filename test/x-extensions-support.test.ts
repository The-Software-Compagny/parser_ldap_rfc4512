import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - X-* Extensions Support
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions with vendor-specific X-* extensions,
 * specifically testing against the 'mailSieveRuleSource' attribute type definition
 * which contains X-ORIGIN extension.
 *
 * The tests cover:
 * - Basic parsing success with X-* extensions
 * - OID and NAME extraction with extensions present
 * - X-ORIGIN extension extraction and validation
 * - Extensions object structure verification
 * - Schema validation with extensions
 * - Direct utility method testing with extensions
 */
describe('RFC4512Parser - X-* Extensions Support (mailSieveRuleSource)', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the mailSieveRuleSource.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/mailSieveRuleSource.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success with X-* extensions
   * Verifies that the parser can successfully parse LDIF files with X-* extensions
   */
  it('should successfully parse schema with X-ORIGIN extension', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result).toBeDefined()
    expect(result.type).toBe('attributeType')
  })

  /**
   * Test: OID extraction with X-* extensions
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from schemas containing X-* extensions
   */
  it('should correctly extract the OID with X-ORIGIN extension present', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('1.3.6.1.4.1.29426.1.10.9')
  })

  /**
   * Test: NAME extraction with X-* extensions
   * Verifies that the parser correctly extracts the name field
   * from schemas containing X-* extensions
   */
  it('should correctly extract the NAME with X-ORIGIN extension present', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('mailSieveRuleSource')
  })

  /**
   * Test: DESCRIPTION extraction with X-* extensions
   * Verifies that the parser correctly extracts the description field
   * from schemas containing X-* extensions
   */
  it('should correctly extract the DESCRIPTION with X-ORIGIN extension present', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('Sun ONE Messaging Server defined attribute')
  })

  /**
   * Test: SYNTAX extraction with X-* extensions
   * Verifies that the parser correctly extracts the syntax OID
   * from schemas containing X-* extensions
   */
  it('should correctly extract the SYNTAX with X-ORIGIN extension present', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.26')
  })

  /**
   * Test: X-ORIGIN extension extraction
   * Verifies that the parser correctly extracts and stores X-ORIGIN vendor extension
   */
  it('should correctly extract the X-ORIGIN extension', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(result.extensions?.['X-ORIGIN']).toBe('Sun ONE Messaging Server')
  })

  /**
   * Test: Extensions object structure validation
   * Verifies that the extensions object is properly structured and contains expected data
   */
  it('should have properly structured extensions object', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(typeof result.extensions).toBe('object')
    expect(Object.keys(result.extensions!)).toHaveLength(1)
    expect(Object.keys(result.extensions!)[0]).toBe('X-ORIGIN')
  })

  /**
   * Test: Schema type detection with X-* extensions
   * Verifies that the parser correctly identifies the schema type
   * even when X-* extensions are present
   */
  it('should detect the attributeType schema type with X-* extensions', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.type).toBe('attributeType')
  })

  /**
   * Test: Schema validation with X-* extensions
   * Verifies that the parser's validation method correctly validates
   * schemas containing X-* extensions
   */
  it('should validate schemas with X-* extensions as syntactically correct', () => {
    const isValid = parser.isValidSchema(ldifContent)

    expect(isValid).toBe(true)
  })

  /**
   * Test: Direct OID extraction utility with X-* extensions
   * Verifies that the extractOID utility method works correctly
   * when schemas contain X-* extensions
   */
  it('should use extractOID to get the OID directly from schemas with X-* extensions', () => {
    const oid = parser.extractOID(ldifContent)

    expect(oid).toBe('1.3.6.1.4.1.29426.1.10.9')
  })

  /**
   * Test: Direct name extraction utility with X-* extensions
   * Verifies that the extractName utility method works correctly
   * when schemas contain X-* extensions
   */
  it('should use extractName to get the name directly from schemas with X-* extensions', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('mailSieveRuleSource')
  })

  /**
   * Test: Complete attribute validation with X-* extensions
   * Verifies that all standard attributes are correctly extracted
   * when X-* extensions are present
   */
  it('should extract all standard attributes correctly when X-* extensions are present', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    // Standard RFC 4512 attributes
    expect(result.oid).toBe('1.3.6.1.4.1.29426.1.10.9')
    expect(result.name).toBe('mailSieveRuleSource')
    expect(result.desc).toBe('Sun ONE Messaging Server defined attribute')
    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.26')

    // Properties that should not be present for this attribute
    expect(result.equality).toBeNull()
    expect(result.ordering).toBeNull()
    expect(result.substr).toBeNull()
    expect(result.singleValue).toBe(false)
    expect(result.collective).toBeNull()
    expect(result.noUserModification).toBeNull()
    expect(result.usage).toBeNull()
    expect(result.sup).toBeNull()

    // X-* extension
    expect(result.extensions).toBeDefined()
    expect(result.extensions?.['X-ORIGIN']).toBe('Sun ONE Messaging Server')
  })

  /**
   * Test: Extensions property presence
   * Verifies that the extensions property is only present when X-* extensions exist
   */
  it('should only include extensions property when X-* extensions are present', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    // Should have extensions because X-ORIGIN is present
    expect(result.extensions).toBeDefined()
    expect(Object.keys(result.extensions!).length).toBeGreaterThan(0)
  })

  /**
   * Test: Extension key format validation
   * Verifies that extension keys follow the X-* format
   */
  it('should correctly parse extension keys in X-* format', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()

    const extensionKeys = Object.keys(result.extensions!)
    for (const key of extensionKeys) {
      expect(key).toMatch(/^X-[A-Z0-9-]+$/)
    }
  })
})
