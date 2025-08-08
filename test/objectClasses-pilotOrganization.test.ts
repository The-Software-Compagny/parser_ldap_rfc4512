import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPObjectClassInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - ObjectClasses LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP ObjectClass definitions in LDIF format, specifically
 * testing against the 'pilotOrganization' object class definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Superior class (SUP) extraction with multiple inheritance
 * - ObjectClass type detection
 * - ObjectClass type classification (STRUCTURAL)
 * - Optional attributes (MAY) extraction
 * - Schema validation
 * - OpenLDAP prefix support ({10})
 */
describe('RFC4512Parser - ObjectClasses pilotOrganization LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the pilotOrganization.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcObjectClasses/pilotOrganization.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the pilotOrganization objectClass LDIF file', () => {
    // Parse the schema definition
    const result = parser.parseSchema(ldifContent)

    // Verify that parsing succeeded
    expect(result).toBeDefined()
  })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the pilotOrganization objectClass definition
   */
  it('should correctly extract the OID from the pilotOrganization objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('0.9.2342.19200300.100.4.20')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the pilotOrganization objectClass definition
   */
  it('should correctly extract the NAME from the pilotOrganization objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('pilotOrganization')
  })

  /**
   * Test: SUP extraction with multiple inheritance
   * Verifies that the parser correctly extracts the superior classes
   * when multiple SUP values are specified
   */
  it('should correctly extract the SUP values from the pilotOrganization objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.sup).toEqual(['organization', 'organizationalUnit'])
  })

  /**
   * Test: ObjectClass type extraction
   * Verifies that the parser correctly identifies the objectClass type
   */
  it('should correctly extract the objectClass type as STRUCTURAL', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.objectClassType).toBe('STRUCTURAL')
  })

  /**
   * Test: MAY attributes extraction
   * Verifies that the parser correctly extracts the optional attributes
   */
  it('should correctly extract the MAY attributes from the pilotOrganization objectClass', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.may).toEqual(['buildingName'])
  })

  /**
   * Test: MUST attributes validation
   * Verifies that the parser correctly handles the absence of MUST attributes
   */
  it('should not have any MUST attributes for the pilotOrganization objectClass', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    expect(result.must).toBeNull()
  })

  /**
   * Test: Schema type validation
   * Verifies that the parser correctly identifies this as an objectClass schema
   */
  it('should correctly identify the schema type as objectClass', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.type).toBe('objectClass')
  })

  /**
   * Test: OpenLDAP prefix support
   * Verifies that the parser correctly handles the {10} prefix
   */
  it('should handle OpenLDAP prefix {10} correctly', () => {
    const result = parser.parseSchema(ldifContent)

    // The prefix should be ignored in the final result
    expect(result.oid).toBe('0.9.2342.19200300.100.4.20')
    expect(result.name).toBe('pilotOrganization')
  })

  /**
   * Test: Multiple SUP inheritance validation
   * Verifies that the parser correctly handles multiple superior classes
   */
  it('should correctly handle multiple SUP inheritance', () => {
    const result = parser.parseSchema(ldifContent)

    expect(Array.isArray(result.sup)).toBe(true)
    expect(result.sup).toHaveLength(2)
    expect(result.sup).toContain('organization')
    expect(result.sup).toContain('organizationalUnit')
  })

  /**
   * Test: Schema validation against RFC 4512
   * Verifies that the schema follows RFC 4512 guidelines
   */
  it('should validate against RFC 4512 specifications', () => {
    const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

    // OID should be a valid dotted decimal notation
    expect(result.oid).toMatch(/^\d+(\.\d+)*$/)

    // Name should follow naming conventions
    expect(result.name).toMatch(/^[a-zA-Z][a-zA-Z0-9-]*$/)

    // ObjectClass type should be one of the valid types
    expect(['STRUCTURAL', 'AUXILIARY', 'ABSTRACT']).toContain(result.objectClassType)
  })

  /**
   * Test: Error handling for malformed schema
   * Verifies that the parser properly handles syntax errors
   */
  it('should throw an error for malformed schema', () => {
    const malformedSchema = '{10}( 0.9.2342.19200300.100.4.20 NAME pilotOrganization INVALID_SYNTAX )'

    expect(() => {
      parser.parseSchema(malformedSchema)
    }).toThrow()
  })

  /**
   * Test: JSON serialization
   * Verifies that the parsed result can be properly serialized to JSON
   */
  it('should produce valid JSON serializable output', () => {
    const result = parser.parseSchema(ldifContent)

    expect(() => JSON.stringify(result)).not.toThrow()

    const json = JSON.stringify(result)
    const parsed = JSON.parse(json)

    expect(parsed.oid).toBe('0.9.2342.19200300.100.4.20')
    expect(parsed.name).toBe('pilotOrganization')
  })
})
