import { describe, it, expect, beforeEach } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { RFC4512Parser, RFC4512ErrorType } from '../src'

/**
 * Test suite for RFC4512Parser - Malformed LDIF parsing functionality
 *
 * This test suite validates the parser's error handling capabilities when encountering
 * malformed LDAP schema definitions. It tests against a deliberately broken LDIF file
 * that contains various formatting errors and syntax violations.
 *
 * The _bad-cn.ldif file contains:
 * - Inconsistent spacing and formatting
 * - Multi-line descriptions (invalid)
 * - Incomplete syntax length specification
 * - Invalid/unknown fields
 * - Missing quotes on field values
 * - General syntax violations
 *
 * The tests cover:
 * - Parse failure detection
 * - Error message validation
 * - Schema validation failure
 * - Graceful error handling
 * - Utility method error handling
 */
describe('RFC4512Parser - Malformed LDIF Error Handling', () => {
  let parser: RFC4512Parser
  let badLdifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the malformed _bad-cn.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/_bad-cn.ldif')
    badLdifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Parse failure detection
   * Verifies that the parser correctly fails when encountering malformed LDIF
   */
  it('should fail to parse the malformed LDIF file', () => {
    const result = parser.parseSchema(badLdifContent)

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
  })

  /**
   * Test: Error message validation
   * Verifies that meaningful error messages are provided for parsing failures
   */
  it('should provide a meaningful error message for parsing failures', () => {
    const result = parser.parseSchema(badLdifContent)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(typeof result.error).toBe('string')
    expect(result.error!.length).toBeGreaterThan(0)
  })

  /**
   * Test: Schema validation failure
   * Verifies that the isValidSchema method correctly identifies invalid schemas
   */
  it('should identify the malformed schema as invalid', () => {
    const isValid = parser.isValidSchema(badLdifContent)

    expect(isValid).toBe(false)
  })

  /**
   * Test: OID extraction failure
   * Verifies that extractOID returns null for malformed schemas
   */
  it('should return null when extracting OID from malformed schema', () => {
    const oid = parser.extractOID(badLdifContent)

    expect(oid).toBeNull()
  })

  /**
   * Test: Name extraction failure
   * Verifies that extractName returns null for malformed schemas
   */
  it('should return null when extracting name from malformed schema', () => {
    const name = parser.extractName(badLdifContent)

    expect(name).toBeNull()
  })

  /**
   * Test: Empty input handling
   * Verifies that the parser gracefully handles empty input
   */
  it('should handle empty schema definition gracefully', () => {
    const result = parser.parseSchema('')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Schema definition cannot be empty')
  })

  /**
   * Test: Whitespace-only input handling
   * Verifies that the parser gracefully handles whitespace-only input
   */
  it('should handle whitespace-only schema definition gracefully', () => {
    const result = parser.parseSchema('   \n\t  \r\n  ')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Schema definition cannot be empty')
  })

  /**
   * Test: Partial schema handling
   * Verifies that the parser fails gracefully on incomplete schemas
   */
  it('should fail on incomplete schema definitions', () => {
    const incompleteSchema = '( 2.5.4.3 NAME'
    const result = parser.parseSchema(incompleteSchema)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
  })

  /**
   * Test: Invalid OID format handling
   * Verifies that the parser fails on invalid OID formats
   */
  it('should fail on invalid OID format', () => {
    const invalidOidSchema = '( abc.def NAME \'test\' )'
    const result = parser.parseSchema(invalidOidSchema)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  /**
   * Test: Missing required fields
   * Verifies that the parser fails when required fields are missing
   */
  it('should fail when required fields are missing', () => {
    // Schema with OID but no NAME
    const missingNameSchema = '( 2.5.4.3 DESC \'test description\' )'
    const result = parser.parseSchema(missingNameSchema)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  /**
   * Test: Multiple parse attempts with different malformed inputs
   * Verifies consistent error handling across different types of malformed input
   */
  it('should consistently fail on various malformed inputs', () => {
    const malformedInputs = [
      '( 2.5.4.3 NAME \'unclosed quote )',
      '( 2.5.4.3 NAME \'test\' INVALID_SYNTAX )',
      '2.5.4.3 NAME \'test\'', // Missing parentheses
      '( NAME \'test\' )', // Missing OID
      '()', // Empty parentheses
    ]

    malformedInputs.forEach((input, index) => {
      const result = parser.parseSchema(input)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
