import { describe, it, expect, beforeEach } from 'bun:test'
import RFC4512Parser from '../src/rfc4512.parser'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - ObjectClasses LDIF parsing functionality
 * 
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP ObjectClass definitions in LDIF format, specifically
 * testing against the 'person' object class definition.
 * 
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Superior class (SUP) extraction
 * - ObjectClass type detection
 * - ObjectClass type classification (STRUCTURAL/AUXILIARY/ABSTRACT)
 * - Required attributes (MUST) extraction
 * - Optional attributes (MAY) extraction
 * - Schema validation
 * - Direct utility method testing
 * - Multiple schema parsing
 */
describe('RFC4512Parser - ObjectClasses LDIF', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the person.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcObjectClasses/person.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Basic parsing success
   * Verifies that the parser can successfully parse the LDIF file without errors
   */
  it('should successfully parse the sample-olcObjectClasses.ldif file', () => {
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
   * from the person objectClass definition
   */
  it('should correctly extract the OID from the person objectClass', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    expect(result.data?.oid).toBe('2.5.6.6')
  })

  /**
   * Test: NAME extraction
   * Verifies that the parser correctly extracts the name field
   * from the person objectClass definition
   */
  it('should correctly extract the NAME from the person objectClass', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('person')
  })

  /**
   * Test: DESCRIPTION extraction
   * Verifies that the parser correctly extracts the description field
   * from the person objectClass definition
   */
  it('should correctly extract the DESCRIPTION from the person objectClass', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    expect(result.data?.desc).toBe('RFC2256: a person')
  })

  /**
   * Test: Superior class (SUP) extraction
   * Verifies that the parser correctly extracts the superior class
   * from the person objectClass definition
   */
  it('should correctly extract the SUP (superior class)', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    expect(result.data?.sup).toBe('top')
  })

  /**
   * Test: ObjectClass type detection
   * Verifies that the parser correctly identifies the schema type
   * as an objectClass
   */
  it('should correctly detect the objectClass type', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    expect(result.data?.type).toBe('objectClass')
  })

  /**
   * Test: ObjectClass type classification
   * Verifies that the parser correctly extracts the STRUCTURAL type
   * from the person objectClass definition
   */
  it('should correctly extract the STRUCTURAL objectClass type', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    // Verify it's an objectClass and cast to access objectClassType
    if (result.data?.type === 'objectClass') {
      expect(result.data.objectClassType).toBe('STRUCTURAL')
    }
  })

  /**
   * Test: Required attributes (MUST) extraction
   * Verifies that the parser correctly extracts the mandatory attributes
   * from the person objectClass definition
   */
  it('should correctly extract the MUST attributes', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    if (result.data?.type === 'objectClass') {
      expect(result.data.must).toEqual(['sn', 'cn'])
    }
  })

  /**
   * Test: Optional attributes (MAY) extraction
   * Verifies that the parser correctly extracts the optional attributes
   * from the person objectClass definition
   */
  it('should correctly extract the MAY attributes', () => {
    const result = parser.parseSchema(ldifContent)
    
    expect(result.success).toBe(true)
    if (result.data?.type === 'objectClass') {
      expect(result.data.may).toEqual(['userPassword', 'telephoneNumber'])
    }
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
    
    expect(oid).toBe('2.5.6.6')
  })

  /**
   * Test: Direct name extraction utility
   * Verifies that the extractName utility method works correctly
   * for direct name extraction without full parsing
   */
  it('should use extractName to get the name directly', () => {
    const name = parser.extractName(ldifContent)
    
    expect(name).toBe('person')
  })

  /**
   * Test: Multiple schema parsing
   * Verifies that the parser can handle parsing multiple schemas
   * using the parseMultipleSchemas method
   */
  it('should parse multiple schemas with parseMultipleSchemas', () => {
    const results = parser.parseMultipleSchemas([ldifContent, ldifContent])
    
    expect(results).toHaveLength(2)
    expect(results[0].success).toBe(true)
    expect(results[1].success).toBe(true)
    expect(results[0].data?.name).toBe('person')
    expect(results[1].data?.name).toBe('person')
  })
})