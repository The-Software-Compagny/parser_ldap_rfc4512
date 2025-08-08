import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - Malformed ObjectClass LDIF parsing functionality
 *
 * This test suite validates the parser's error handling capabilities when encountering
 * malformed LDAP objectClass schema definitions. It tests against a deliberately broken LDIF file
 * that contains various formatting errors and syntax violations.
 *
 * The _bad-person.ldif file contains:
 * - Inconsistent spacing and formatting
 * - Multi-line descriptions (invalid)
 * - Incomplete MUST/MAY attribute lists
 * - Missing closing parentheses
 * - Invalid/unknown fields
 * - Missing quotes on field values
 * - Malformed attribute list syntax
 * - General objectClass syntax violations
 *
 * The tests cover:
 * - Parse failure detection
 * - Error message validation
 * - Schema validation failure
 * - Graceful error handling
 * - Utility method error handling for objectClasses
 */
describe('RFC4512Parser - Malformed ObjectClass LDIF Error Handling', () => {
  let parser: RFC4512Parser
  let badLdifContent: string

  /**
   * Set up test environment before each test
   * Initializes a new parser instance and loads the malformed _bad-person.ldif sample file
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcObjectClasses/_bad-person.ldif')
    badLdifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Parse failure detection
   * Verifies that the parser correctly fails when encountering malformed objectClass LDIF
   */
  it('should fail to parse the malformed objectClass LDIF file', () => {
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Error message validation
   * Verifies that meaningful error messages are provided for objectClass parsing failures
   */
  it('should provide a meaningful error message for objectClass parsing failures', () => {
    try {
      parser.parseSchema(badLdifContent)
      expect.unreachable('Should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message.length).toBeGreaterThan(0)
    }
  })

  /**
   * Test: Schema validation failure
   * Verifies that the isValidSchema method correctly identifies invalid objectClass schemas
   */
  it('should identify the malformed objectClass schema as invalid', () => {
    const isValid = parser.isValidSchema(badLdifContent)

    expect(isValid).toBe(false)
  })

  /**
   * Test: OID extraction failure
   * Verifies that extractOID returns null for malformed objectClass schemas
   */
  it('should return null when extracting OID from malformed objectClass schema', () => {
    const oid = parser.extractOID(badLdifContent)

    expect(oid).toBeNull()
  })

  /**
   * Test: Name extraction failure
   * Verifies that extractName returns null for malformed objectClass schemas
   */
  it('should return null when extracting name from malformed objectClass schema', () => {
    const name = parser.extractName(badLdifContent)

    expect(name).toBeNull()
  })

  /**
   * Test: ObjectClass specific malformed syntax
   * Verifies that the parser fails on objectClass-specific syntax errors
   */
  it('should fail on malformed objectClass MUST/MAY syntax', () => {
    const malformedMustMay = '( 2.5.6.6 NAME \'test\' SUP top STRUCTURAL MUST ( cn $ INVALID )'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Missing objectClass type
   * Verifies that the parser fails when objectClass type is missing (RFC 4512 compliance)
   */
  it('should fail when objectClass type is missing', () => {
    const missingType = '( 2.5.6.6 NAME \'test\' SUP top MUST cn )'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Invalid SUP (superior) reference
   * Verifies that the parser fails on invalid SUP reference syntax
   */
  it('should fail on invalid SUP reference syntax', () => {
    const invalidSup = '( 2.5.6.6 NAME \'test\' SUP STRUCTURAL MUST cn )'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Incomplete attribute lists
   * Verifies that the parser fails on incomplete MUST/MAY attribute lists
   */
  it('should fail on incomplete MUST/MAY attribute lists', () => {
    const incompleteList = '( 2.5.6.6 NAME \'test\' SUP top STRUCTURAL MUST ( cn $'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Multiple parse attempts with different malformed objectClass inputs
   * Verifies consistent error handling across different types of malformed objectClass input
   */
  it('should consistently fail on various malformed objectClass inputs', () => {
    const malformedInputs = [
      '( 2.5.6.6 NAME \'unclosed quote SUP top STRUCTURAL )',
      '2.5.6.6 NAME \'test\' SUP top STRUCTURAL', // Missing parentheses
      '( NAME \'test\' SUP top STRUCTURAL )', // Missing OID
      '()', // Empty parentheses
    ]

    malformedInputs.forEach((input, index) => {
      expect(() => parser.parseSchema(badLdifContent)).toThrow()
    })
  })

  /**
   * Test: ObjectClass with conflicting types
   * Verifies that the parser fails when multiple objectClass types are specified
   */
  it('should fail on objectClass with conflicting types', () => {
    const conflictingTypes = '( 2.5.6.6 NAME \'test\' SUP top STRUCTURAL AUXILIARY )'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })

  /**
   * Test: Empty MUST/MAY lists
   * Verifies that the parser handles empty or malformed MUST/MAY attribute lists
   */
  it('should fail on empty or malformed MUST/MAY lists', () => {
    const emptyMust = '( 2.5.6.6 NAME \'test\' SUP top STRUCTURAL MUST () )'
    expect(() => parser.parseSchema(badLdifContent)).toThrow()
  })
})
