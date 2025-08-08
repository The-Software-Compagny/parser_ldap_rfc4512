import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser, RFC4512ParserError, RFC4512ErrorType, type LDAPAttributeTypeInterface } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - OpenLDAP-specific OID format support
 *
 * This test suite validates the parser's ability to handle OpenLDAP
 * AttributeType definitions with configuration OID formats in both
 * strict RFC 4512 mode and relaxed mode.
 *
 * OpenLDAP cn=config uses named OID prefixes in its configuration schema:
 * - 'OLcfgOvAt:18.1' (overlay attribute types)
 * - 'OLcfgDbAt:' (database attribute types)
 * - 'OLcfgGlAt:' (global attribute types)
 *
 * RFC 4512 Section 1.4 specifies that OIDs must follow the format:
 * numericoid = number 1*( DOT number )
 * Examples: '2.5.4.3', '1.3.6.1.4.1.1466.115.121.1.15'
 *
 * Test coverage:
 * - Strict mode: Rejection of OpenLDAP OIDs with appropriate error messages
 * - Relaxed mode: Acceptance and proper parsing of OpenLDAP OIDs
 * - Error type classification and context preservation
 * - Both modes working with standard RFC 4512 OIDs
 */
describe('RFC4512Parser - OpenLDAP OID format support', () => {
  let strictParser: RFC4512Parser
  let relaxedParser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   * Initializes both strict and relaxed parser instances and loads the test file
   */
  beforeEach(() => {
    strictParser = new RFC4512Parser({ relaxedMode: false })
    relaxedParser = new RFC4512Parser({ relaxedMode: true })
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/olcMemberOfDangling.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  describe('Strict RFC 4512 Mode (default)', () => {
    /**
     * Test: OpenLDAP OID rejection in strict mode
     * Verifies that the parser correctly rejects OpenLDAP configuration OIDs in strict mode
     */
    it('should reject OpenLDAP configuration OID format and throw RFC4512ParserError', () => {
      expect(() => {
        strictParser.parseSchema(ldifContent)
      }).toThrow(RFC4512ParserError)
    })

    /**
     * Test: Error type verification in strict mode
     * Verifies that the parser throws the correct error type for unsupported OID formats
     */
    it('should throw RFC4512ParserError with SYNTAX_ERROR type', () => {
      try {
        strictParser.parseSchema(ldifContent)
        // Should not reach this line
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.SYNTAX_ERROR)
      }
    })

    /**
     * Test: Error message content in strict mode
     * Verifies that the error message mentions relaxed mode as a solution
     */
    it('should provide helpful error message suggesting relaxed mode', () => {
      try {
        strictParser.parseSchema(ldifContent)
        // Should not reach this line
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        const rfc4512Error = error as RFC4512ParserError
        expect(rfc4512Error.message).toContain('relaxedMode: true')
        expect(rfc4512Error.message).toContain('OpenLDAP configuration OIDs')
      }
    })

    /**
     * Test: Schema definition preservation in strict mode
     * Verifies that the original schema definition is preserved in the error context
     */
    it('should preserve the original schema definition in error context', () => {
      try {
        strictParser.parseSchema(ldifContent)
        // Should not reach this line
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        const rfc4512Error = error as RFC4512ParserError
        expect(rfc4512Error.schemaDefinition).toBe(ldifContent)
      }
    })
  })

  describe('Relaxed Mode (OpenLDAP support)', () => {
    /**
     * Test: OpenLDAP OID acceptance in relaxed mode
     * Verifies that the parser successfully parses OpenLDAP configuration OIDs in relaxed mode
     */
    it('should successfully parse OpenLDAP configuration OID in relaxed mode', () => {
      expect(() => {
        relaxedParser.parseSchema(ldifContent)
      }).not.toThrow()
    })

    /**
     * Test: Correct OID extraction in relaxed mode
     * Verifies that the parser correctly extracts OpenLDAP OIDs
     */
    it('should correctly extract OpenLDAP OID in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.oid).toBe('OLcfgOvAt:18.1')
    })

    /**
     * Test: Correct attribute name extraction in relaxed mode
     * Verifies that the parser correctly extracts the attribute name
     */
    it('should correctly extract attribute name in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.name).toBe('olcMemberOfDangling')
    })

    /**
     * Test: Correct description extraction in relaxed mode
     * Verifies that the parser correctly extracts the description
     */
    it('should correctly extract description in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.desc).toBe('Behavior with respect to dangling members, constrained to ignore, drop, error')
    })

    /**
     * Test: Correct syntax extraction in relaxed mode
     * Verifies that the parser correctly extracts the syntax
     */
    it('should correctly extract syntax in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.syntax?.oid).toBe('OMsDirectoryString')
    })

    /**
     * Test: Correct single-value flag detection in relaxed mode
     * Verifies that the parser correctly detects the SINGLE-VALUE flag
     */
    it('should correctly detect SINGLE-VALUE flag in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.singleValue).toBe(true)
    })

    /**
     * Test: Type detection in relaxed mode
     * Verifies that the parser correctly identifies this as an attributeType
     */
    it('should correctly identify schema type as attributeType in relaxed mode', () => {
      const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)
      expect(result.type).toBe('attributeType')
    })
  })

  describe('Parser Options', () => {
    /**
     * Test: Parser options verification
     * Verifies that parser options are correctly set and accessible
     */
    it('should correctly report parser options', () => {
      expect(strictParser.options.relaxedMode).toBe(false)
      expect(relaxedParser.options.relaxedMode).toBe(true)
    })
  })

  describe('File Content Verification', () => {
    /**
     * Test: Test file content verification
     * Verifies that the test file contains the expected OpenLDAP configuration elements
     */
    it('should contain the expected OpenLDAP configuration elements in test file', () => {
      expect(ldifContent).toContain('OLcfgOvAt:18.1')
      expect(ldifContent).toContain('olcMemberOfDangling')
      expect(ldifContent).toContain('OMsDirectoryString')
      expect(ldifContent).toContain('SINGLE-VALUE')
    })
  })
})
