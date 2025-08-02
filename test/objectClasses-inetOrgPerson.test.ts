import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPObjectClassInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - ObjectClasses LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP ObjectClass definitions in LDIF format, specifically
 * testing against the 'inetOrgPerson' object class definition.
 *
 * The inetOrgPerson class (RFC2798) extends organizationalPerson with additional
 * attributes for Internet organizational persons.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Superior class (SUP) extraction
 * - Object class type detection (STRUCTURAL)
 * - MAY attributes extraction (extensive list)
 * - Schema type detection
 * - Schema validation
 * - Direct utility method testing
 */
describe('RFC4512Parser - inetOrgPerson ObjectClass LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the inetOrgPerson.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcObjectClasses/inetOrgPerson.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the inetOrgPerson objectClass LDIF file', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result).toBeDefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the inetOrgPerson objectClass definition
   */
  it('should correctly extract the OID from the inetOrgPerson objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('2.16.840.1.113730.3.2.2')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the inetOrgPerson objectClass definition
   */
  it('should correctly extract the NAME from the inetOrgPerson objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('inetOrgPerson')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the inetOrgPerson objectClass definition
   */
  it('should correctly extract the DESCRIPTION from the inetOrgPerson objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('RFC2798: Internet Organizational Person')
  })

  /**
   * Test: SUP (Superior class) extraction
   * Verifies that the parser correctly extracts the superior object class
   * from the inetOrgPerson objectClass definition
   */
  it('should correctly extract the SUP (superior class)', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.sup).toBe('organizationalPerson')
  })

  /**
   * Test: Schema type detection
   * Verifies that the parser correctly identifies the schema type
   * as an objectClass
   */
  it('should correctly detect the objectClass type', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.type).toBe('objectClass')
  })

  /**
   * Test: STRUCTURAL objectClass type extraction
   * Verifies that the parser correctly identifies the objectClass
   * as STRUCTURAL type
   */
  it('should correctly extract the STRUCTURAL objectClass type', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.objectClassType).toBe('STRUCTURAL')
  })

  /**
   * Test: MAY attributes extraction
   * Verifies that the parser correctly extracts the optional attributes list
   * inetOrgPerson has an extensive MAY attributes list
   */
  it('should correctly extract the MAY attributes', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.may).toBeDefined()
    expect(Array.isArray(result.may)).toBe(true)

    // Verify some key attributes are present
    const mayAttributes = result.may || []
    expect(mayAttributes).toContain('audio')
    expect(mayAttributes).toContain('businessCategory')
    expect(mayAttributes).toContain('mail')
    expect(mayAttributes).toContain('employeeNumber')
    expect(mayAttributes).toContain('givenName')
    expect(mayAttributes).toContain('uid')
    expect(mayAttributes).toContain('jpegPhoto')
    expect(mayAttributes).toContain('displayName')

    // Verify the total number of MAY attributes
    expect(mayAttributes.length).toBeGreaterThan(20)
  })

  /**
   * Test: MUST attributes (should be undefined)
   * Verifies that inetOrgPerson doesn't define its own MUST attributes
   * (inherits from organizationalPerson)
   */
  it('should not have MUST attributes defined (inherits from superior)', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.must).toBeNull()
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

    expect(oid).toBe('2.16.840.1.113730.3.2.2')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('inetOrgPerson')
  })
})
