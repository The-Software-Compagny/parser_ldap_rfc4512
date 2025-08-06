import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPAttributeTypeInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - Multiple X-* Extensions Support
 *
 * This test suite validates the parser's ability to handle multiple
 * vendor-specific X-* extensions in a single schema definition.
 */
describe('RFC4512Parser - Multiple X-* Extensions Support', () => {
  let parser: RFC4512Parser
  let ldifContent: string

  /**
   * Set up test environment before each test
   */
  beforeEach(() => {
    parser = new RFC4512Parser()
    const ldifPath = join(__dirname, './samples/olcAttributeTypes/testMultipleExtensions.ldif')
    ldifContent = readFileSync(ldifPath, 'utf-8').trim()
  })

  /**
   * Test: Parse schema with multiple X-* extensions
   */
  it('should successfully parse schema with multiple X-* extensions', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result).toBeDefined()
    expect(result.type).toBe('attributeType')
    expect(result.oid).toBe('1.3.6.1.4.1.29426.1.10.10')
    expect(result.name).toBe('testMultipleExtensions')
  })

  /**
   * Test: Extract all X-* extensions
   */
  it('should extract all X-* extensions correctly', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(result.extensions?.['X-ORIGIN']).toBe('Test Organization')
    expect(result.extensions?.['X-DEPRECATED']).toBe('false')
    expect(result.extensions?.['X-ORDERED']).toBe('VALUES')
  })

  /**
   * Test: Extension count validation
   */
  it('should have the correct number of extensions', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()
    expect(Object.keys(result.extensions!)).toHaveLength(3)
  })

  /**
   * Test: All extension keys follow X-* format
   */
  it('should have all extension keys in correct X-* format', () => {
    const result = parser.parseSchema<LDAPAttributeTypeInterface>(ldifContent)

    expect(result.extensions).toBeDefined()

    const extensionKeys = Object.keys(result.extensions!)
    for (const key of extensionKeys) {
      expect(key).toMatch(/^X-[A-Z0-9-]+$/)
    }
  })

  /**
   * Test: Schema validation with multiple extensions
   */
  it('should validate schema with multiple X-* extensions', () => {
    const isValid = parser.isValidSchema(ldifContent)
    expect(isValid).toBe(true)
  })
})
