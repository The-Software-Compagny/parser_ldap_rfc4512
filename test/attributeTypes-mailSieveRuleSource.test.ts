import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's behavior when encountering LDAP
 * AttributeType definitions with vendor-specific extensions that are not
 * part of the RFC 4512 standard, specifically testing against the
 * 'mailSieveRuleSource' attribute type definition which contains X-ORIGIN extension.
 *
 * The tests cover:
 * - Parser limitations with vendor extensions
 * - Validation behavior with non-standard extensions
 * - OID and name extraction from invalid schema
 * - Error handling for unsupported syntax
 *
 * Note: This schema contains X-ORIGIN extension which is not supported
 * by the RFC 4512 compliant parser.
 */
describe('RFC4512Parser - mailSieveRuleSource AttributeType LDIF (with X-ORIGIN extension)', () => {
  let parser: RFC4512Parser
  let ldifContent: string
  let cleanedLdifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the mailSieveRuleSource.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/mailSieveRuleSource.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()

    // Create a cleaned version without the X-ORIGIN extension for comparison
    cleanedLdifContent = ldifContent.replace(/\s+X-ORIGIN\s+'[^']*'/, '')
  })

  /**
   * Test: Parser now supports X-ORIGIN extension
   * Verifies that the parser can successfully parse schemas with X-* extensions
   */
  it('should successfully parse schema with X-ORIGIN extension', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result).toBeDefined()
    expect(result.type).toBe('attributeType')
  })

  /**
   * Test: Validation succeeds with X-ORIGIN extension
   * Verifies that validation passes with X-* extensions
   */
  it('should pass validation with X-ORIGIN extension', () => {
    const isValid = parser.isValidSchema(ldifContent)

    expect(isValid).toBe(true)
  })

  /**
   * Test: Extract OID from schema with X-ORIGIN extension
   * Verifies that extractOID works when the schema contains X-* extensions
   */
  it('should successfully extract OID from schema with X-ORIGIN extension', () => {
    const oid = parser.extractOID(ldifContent)

    expect(oid).toBe('1.3.6.1.4.1.29426.1.10.9')
  })

  /**
   * Test: Extract name from schema with X-ORIGIN extension
   * Verifies that extractName works when the schema contains X-* extensions
   */
  it('should successfully extract name from schema with X-ORIGIN extension', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('mailSieveRuleSource')
  })

  /**
   * Test: Extract X-ORIGIN extension
   * Verifies that the parser correctly extracts the X-ORIGIN extension value
   */
  it('should correctly extract the X-ORIGIN extension', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(result.extensions?.['X-ORIGIN']).toBe('Sun ONE Messaging Server')
  })

  /**
   * Test: Extensions object structure
   * Verifies that the extensions object contains only the expected X-* extensions
   */
  it('should have properly structured extensions object', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(typeof result.extensions).toBe('object')
    expect(Object.keys(result.extensions!)).toHaveLength(1)
    expect(Object.keys(result.extensions!)[0]).toBe('X-ORIGIN')
  })

  /**
   * Test: Basic attribute extraction still works
   * Verifies that basic attribute extraction still works with X-* extensions
   */
  it('should correctly extract basic attributes with X-ORIGIN extension', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.oid).toBe('1.3.6.1.4.1.29426.1.10.9')
    expect(result.name).toBe('mailSieveRuleSource')
    expect(result.desc).toBe('Sun ONE Messaging Server defined attribute')
    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.26')
  })

  /**
   * Test: Cleaned schema parsing success
   * Verifies that when the X-ORIGIN extension is removed, the schema parses correctly
   */
  it('should successfully parse the cleaned schema without X-ORIGIN extension', () => {
    const result = parser.parseSchema(cleanedLdifContent)

    expect(result).toBeDefined()
    expect(result.type).toBe('attributeType')
  })

  /**
   * Test: OID extraction from cleaned schema
   * Verifies that the OID can be correctly extracted from the cleaned schema
   */
  it('should correctly extract the OID from cleaned schema', () => {
    const result = parser.parseSchema(cleanedLdifContent)

    expect(result.oid).toBe('1.3.6.1.4.1.29426.1.10.9')
  })

  /**
   * Test: NAME extraction from cleaned schema
   * Verifies that the NAME can be correctly extracted from the cleaned schema
   */
  it('should correctly extract the NAME from cleaned schema', () => {
    const result = parser.parseSchema(cleanedLdifContent)

    expect(result.name).toBe('mailSieveRuleSource')
  })

  /**
   * Test: DESCRIPTION extraction from cleaned schema
   * Verifies that the DESCRIPTION can be correctly extracted from the cleaned schema
   */
  it('should correctly extract the DESCRIPTION from cleaned schema', () => {
    const result = parser.parseSchema(cleanedLdifContent)

    expect(result.desc).toBe('Sun ONE Messaging Server defined attribute')
  })

  /**
   * Test: SYNTAX extraction from cleaned schema
   * Verifies that the SYNTAX can be correctly extracted from the cleaned schema
   */
  it('should correctly extract the SYNTAX OID from cleaned schema', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(cleanedLdifContent)

    expect(result.syntax?.oid).toBe('1.3.6.1.4.1.1466.115.121.1.26')
  })

  /**
   * Test: Direct OID extraction from cleaned schema
   * Verifies that extractOID works correctly on the cleaned schema
   */
  it('should use extractOID to get the OID from cleaned schema', () => {
    const oid = parser.extractOID(cleanedLdifContent)

    expect(oid).toBe('1.3.6.1.4.1.29426.1.10.9')
  })

  /**
   * Test: Direct name extraction from cleaned schema
   * Verifies that extractName works correctly on the cleaned schema
   */
  it('should use extractName to get the name from cleaned schema', () => {
    const name = parser.extractName(cleanedLdifContent)

    expect(name).toBe('mailSieveRuleSource')
  })

  /**
   * Test: RFC 4512 compliance documentation
   * Documents that this schema would be valid RFC 4512 without vendor extensions
   */
  it('should validate cleaned schema as RFC 4512 compliant', () => {
    const isValid = parser.isValidSchema(cleanedLdifContent)

    expect(isValid).toBe(true)
  })

  /**
   * Test: Content verification
   * Verifies that the original LDIF content actually contains the X-ORIGIN extension
   */
  it('should contain X-ORIGIN extension in original content', () => {
    expect(ldifContent).toContain('X-ORIGIN')
    expect(ldifContent).toContain('Sun ONE Messaging Server')
  })

  /**
   * Test: Cleaned content verification
   * Verifies that the cleaned content no longer contains the X-ORIGIN extension
   */
  it('should not contain X-ORIGIN extension in cleaned content', () => {
    expect(cleanedLdifContent).not.toContain('X-ORIGIN')
    expect(cleanedLdifContent).toContain('Sun ONE Messaging Server defined attribute')
  })
})
