import { describe, it, expect } from 'bun:test'
import { parseSchema, RFC4512ParserError } from '../src'
import type { ParserBuildOptions } from 'peggy'

/**
 * Test suite for parseSchema utility function
 *
 * This test suite validates the standalone parseSchema function that provides
 * a convenient shortcut for creating a parser instance and parsing schema definitions.
 *
 * The tests cover:
 * - Basic parsing functionality without options
 * - Parsing with PEG.js parser options
 * - Error handling and propagation
 * - Return type validation
 */
describe('parseSchema utility function', () => {
  describe('Basic functionality', () => {
    it('should parse a valid objectClass schema without options', () => {
      const schema = `
        ( 2.5.6.6
          NAME 'person'
          DESC 'RFC2256: a person'
          SUP top
          STRUCTURAL
          MUST ( sn $ cn )
          MAY ( userPassword $ telephoneNumber )
        )
      `

      const result = parseSchema(schema)

      expect(result).toBeDefined()
      expect(result.type).toBe('objectClass')
      expect(result.oid).toBe('2.5.6.6')
      expect(result.name).toBe('person')
      expect(result.desc).toBe('RFC2256: a person')
    })

    it('should parse a valid attributeType schema without options', () => {
      const schema = `
        ( 2.5.4.3
          NAME 'cn'
          DESC 'RFC2256: common name(s) for which the entity is known by'
          SUP name
        )
      `

      const result = parseSchema(schema)

      expect(result).toBeDefined()
      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('2.5.4.3')
      expect(result.name).toBe('cn')
      expect(result.desc).toBe('RFC2256: common name(s) for which the entity is known by')
    })
  })

  describe('With parser options', () => {
    it('should parse schema with PEG.js parser options', () => {
      const schema = `
        ( 2.5.6.6
          NAME 'person'
          DESC 'RFC2256: a person'
          SUP top
          STRUCTURAL
          MUST ( sn $ cn )
          MAY ( userPassword $ telephoneNumber )
        )
      `

      // Test with cache option (lines 13-14 coverage)
      const options: ParserBuildOptions = {
        cache: true,
        trace: false
      }

      const result = parseSchema(schema, options)

      expect(result).toBeDefined()
      expect(result.type).toBe('objectClass')
      expect(result.oid).toBe('2.5.6.6')
      expect(result.name).toBe('person')
    })

    it('should parse schema with trace option enabled', () => {
      const schema = `
        ( 2.5.4.3
          NAME 'cn'
          DESC 'RFC2256: common name(s) for which the entity is known by'
          SUP name
        )
      `

      const options: ParserBuildOptions = {
        trace: true
      }

      const result = parseSchema(schema, options)

      expect(result).toBeDefined()
      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('2.5.4.3')
      expect(result.name).toBe('cn')
    })

    it('should parse schema with optimization options', () => {
      const schema = `
        ( 2.5.6.0
          NAME 'top'
          DESC 'top of the superclass chain'
          ABSTRACT
          MUST objectClass
        )
      `

      const options: ParserBuildOptions = {
        optimize: 'speed',
        cache: false
      }

      const result = parseSchema(schema, options)

      expect(result).toBeDefined()
      expect(result.type).toBe('objectClass')
      expect(result.oid).toBe('2.5.6.0')
      expect(result.name).toBe('top')
    })
  })

  describe('Error handling', () => {
    it('should propagate RFC4512ParserError for empty input', () => {
      expect(() => {
        parseSchema('')
      }).toThrow(RFC4512ParserError)

      expect(() => {
        parseSchema('')
      }).toThrow('Schema definition cannot be empty')
    })

    it('should propagate RFC4512ParserError for invalid syntax', () => {
      const invalidSchema = 'invalid schema definition'

      expect(() => {
        parseSchema(invalidSchema)
      }).toThrow(RFC4512ParserError)
    })

    it('should propagate RFC4512ParserError for missing required fields', () => {
      const schemaWithoutOID = `
        (
          NAME 'person'
          DESC 'RFC2256: a person'
          SUP top
          STRUCTURAL
        )
      `

      expect(() => {
        parseSchema(schemaWithoutOID)
      }).toThrow(RFC4512ParserError)
    })

    it('should propagate RFC4512ParserError with options', () => {
      const options: ParserBuildOptions = {
        trace: true
      }

      expect(() => {
        parseSchema('', options)
      }).toThrow(RFC4512ParserError)

      expect(() => {
        parseSchema('', options)
      }).toThrow('Schema definition cannot be empty')
    })
  })

  describe('Return type validation', () => {
    it('should return LDAPSchemaType with correct structure for objectClass', () => {
      const schema = `
        ( 2.5.6.6
          NAME 'person'
          DESC 'RFC2256: a person'
          SUP top
          STRUCTURAL
          MUST ( sn $ cn )
          MAY ( userPassword $ telephoneNumber )
        )
      `

      const result = parseSchema(schema)

      // Verify the result has the expected LDAPSchemaType structure
      expect(typeof result.type).toBe('string')
      expect(typeof result.oid).toBe('string')
      expect(typeof result.name).toBe('string')
      expect(typeof result.desc).toBe('string')
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('oid')
      expect(result).toHaveProperty('name')
    })

    it('should return LDAPSchemaType with correct structure for attributeType', () => {
      const schema = `
        ( 2.5.4.3
          NAME 'cn'
          DESC 'RFC2256: common name(s) for which the entity is known by'
          SUP name
        )
      `

      const result = parseSchema(schema)

      // Verify the result has the expected LDAPSchemaType structure
      expect(typeof result.type).toBe('string')
      expect(typeof result.oid).toBe('string')
      expect(typeof result.name).toBe('string')
      expect(typeof result.desc).toBe('string')
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('oid')
      expect(result).toHaveProperty('name')
    })
  })

  describe('Edge cases', () => {
    it('should handle whitespace-only input', () => {
      expect(() => {
        parseSchema('   \n   \t   ')
      }).toThrow(RFC4512ParserError)
    })

    it('should work with minimal valid objectClass', () => {
      const schema = `
        ( 2.5.6.0
          NAME 'minimal'
          ABSTRACT
        )
      `

      const result = parseSchema(schema)

      expect(result).toBeDefined()
      expect(result.type).toBe('objectClass')
      expect(result.oid).toBe('2.5.6.0')
      expect(result.name).toBe('minimal')
    })

    it('should work with complex parser options', () => {
      const schema = `
        ( 2.5.4.35
          NAME 'userPassword'
          DESC 'RFC2256/2307: password of user'
          EQUALITY octetStringMatch
          SYNTAX 1.3.6.1.4.1.1466.115.121.1.40{128}
        )
      `

      const options: ParserBuildOptions = {
        cache: true,
        trace: false,
        optimize: 'size'
      }

      const result = parseSchema(schema, options)

      expect(result).toBeDefined()
      expect(result.type).toBe('attributeType')
      expect(result.oid).toBe('2.5.4.35')
      expect(result.name).toBe('userPassword')
    })
  })
})
