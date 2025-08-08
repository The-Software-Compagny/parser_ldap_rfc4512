import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - AttributeTypes LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP AttributeType definitions in LDIF format, specifically
 * testing against the 'title' attribute type definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Superior (SUP) extraction
 * - Schema type detection
 * - Schema validation
 * - Direct utility method testing
 */
describe('RFC4512Parser - title AttributeType LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the title.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/title.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the title attributeType LDIF file', () => {
    const result = parser.parseSchema(ldifContent)

        expect(result).toBeDefined()
    })

  /**
   * Test: OID extraction
   * Verifies that the parser correctly extracts the Object Identifier (OID)
   * from the title attributeType definition
   */
  it('should correctly extract the OID from the title attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.oid).toBe('2.5.4.12')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the title attributeType definition
   */
  it('should correctly extract the NAME from the title attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.name).toBe('title')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the title attributeType definition
   */
  it('should correctly extract the DESCRIPTION from the title attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.desc).toBe('RFC2256: title associated with the entity')
  })

  /**
   * Test: SUP (Superior) extraction
   * Verifies that the parser correctly extracts the superior attribute type
   * from the title attributeType definition
   */
  it('should correctly extract the SUP from the title attributeType', () => {
    const result = parser.parseSchema(ldifContent)

    expect(result.sup).toBe('name')
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

    expect(oid).toBe('2.5.4.12')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)

    expect(name).toBe('title')
  })
})
