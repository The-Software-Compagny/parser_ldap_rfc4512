import { describe, test, beforeEach, expect } from 'bun:test'
import { RFC4512Parser } from '../src'
import { RFC4512ParserError, RFC4512ErrorType } from '../src/interfaces'

/**
 * Test suite for RFC4512ParserError - Error Handling and Custom Exception Testing
 *
 * This test suite validates the custom RFC4512ParserError class functionality,
 * including error type classification, detailed error messages, position tracking,
 * and the strict parsing method that throws exceptions instead of returning results.
 */
describe('RFC4512ParserError', () => {
  let parser: RFC4512Parser

  beforeEach(() => {
    parser = new RFC4512Parser()
  })

  describe('parseSchemaStrict method', () => {
    test('should throw RFC4512ParserError for empty input', () => {
      // Test that empty input triggers EMPTY_INPUT error type
      expect(() => {
        parser.parseSchemaStrict('')
      }).toThrow(RFC4512ParserError)

      try {
        parser.parseSchemaStrict('')
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.EMPTY_INPUT)
        expect((error as RFC4512ParserError).schemaDefinition).toBe('')
      }
    })

    test('should throw RFC4512ParserError for invalid objectClass with missing type', () => {
      // RFC 4512 requires objectClass to have exactly one type (STRUCTURAL/AUXILIARY/ABSTRACT)
      // This schema is parsed as objectClass (because of MUST) but has no STRUCTURAL/AUXILIARY/ABSTRACT
      const schema = "( 2.5.6.6 NAME 'test' DESC 'Test objectClass without type' SUP top MUST ( cn ) )"

      expect(() => {
        parser.parseSchemaStrict(schema)
      }).toThrow(RFC4512ParserError)

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.OBJECTCLASS_ERROR)
        expect((error as RFC4512ParserError).message).toContain('must specify exactly one type')
        expect((error as RFC4512ParserError).schemaDefinition).toBe(schema)
      }
    })

    test('should throw RFC4512ParserError for MUST/MAY overlap', () => {
      // RFC 4512 prohibits the same attribute from appearing in both MUST and MAY lists
      const schema = "( 2.5.6.6 NAME 'test' DESC 'Test overlap' STRUCTURAL MUST ( cn ) MAY ( cn ) )"

      expect(() => {
        parser.parseSchemaStrict(schema)
      }).toThrow(RFC4512ParserError)

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.VALIDATION_ERROR)
        expect((error as RFC4512ParserError).message).toContain('cannot appear in both MUST and MAY')
      }
    })

    test('should throw RFC4512ParserError for invalid SUP value in objectClass', () => {
      // Test validation of SUP field - should contain valid objectClass name, not keywords
      const schema = "( 2.5.6.6 NAME 'test' DESC 'Test invalid SUP' SUP STRUCTURAL STRUCTURAL )"

      expect(() => {
        parser.parseSchemaStrict(schema)
      }).toThrow(RFC4512ParserError)

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.INVALID_FIELD)
        expect((error as RFC4512ParserError).message).toContain('Invalid SUP value')
      }
    })

    test('should throw RFC4512ParserError for syntax error with position', () => {
      // Test that syntax errors include position information for debugging
      const schema = "( 2.5.6.6 NAME 'test' invalid-syntax )"

      expect(() => {
        parser.parseSchemaStrict(schema)
      }).toThrow(RFC4512ParserError)

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        expect((error as RFC4512ParserError).errorType).toBe(RFC4512ErrorType.SYNTAX_ERROR)
        expect((error as RFC4512ParserError).position).toBeDefined()
        expect((error as RFC4512ParserError).position?.line).toBe(1)
      }
    })

    test('should provide detailed error message', () => {
      // Test that the custom error class provides comprehensive error details
      const schema = "( 2.5.6.6 NAME 'test' STRUCTURAL MUST ( cn ) MAY ( cn ) )"

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        const detailedMessage = (error as RFC4512ParserError).getDetailedMessage()
        expect(detailedMessage).toContain(RFC4512ErrorType.VALIDATION_ERROR)
        expect(detailedMessage).toContain('Context:')
        expect(detailedMessage).toContain('Schema:')
      }
    })

    test('should serialize to JSON correctly', () => {
      // Test that RFC4512ParserError can be serialized to JSON for logging/debugging
      const schema = "( 2.5.6.6 NAME 'test' STRUCTURAL MUST ( cn ) MAY ( cn ) )"

      try {
        parser.parseSchemaStrict(schema)
      } catch (error) {
        expect(error).toBeInstanceOf(RFC4512ParserError)
        const json = (error as RFC4512ParserError).toJSON()
        expect(json.name).toBe('RFC4512ParserError')
        expect(json.errorType).toBe(RFC4512ErrorType.VALIDATION_ERROR)
        expect(json.schemaDefinition).toBe(schema)
        expect(json.message).toContain('cannot appear in both MUST and MAY')
      }
    })
  })

  describe('parseSchema method (backward compatibility)', () => {
    test('should return ParseResultInterface with detailed error for empty input', () => {
      // Test that the original parseSchema method still works and provides detailed errors
      const result = parser.parseSchema('')

      expect(result.success).toBe(false)
      expect(result.error).toContain(RFC4512ErrorType.EMPTY_INPUT)
      expect(result.error).toContain('Schema definition cannot be empty')
    })

    test('should return ParseResultInterface with detailed error for validation error', () => {
      // Test backward compatibility with detailed error messages in ParseResultInterface
      const schema = "( 2.5.6.6 NAME 'test' STRUCTURAL MUST ( cn ) MAY ( cn ) )"
      const result = parser.parseSchema(schema)

      expect(result.success).toBe(false)
      expect(result.error).toContain(RFC4512ErrorType.VALIDATION_ERROR)
      expect(result.error).toContain('cannot appear in both MUST and MAY')
      expect(result.error).toContain('Context:')
    })

    test('should return ParseResultInterface with detailed error for syntax error', () => {
      // Test that syntax errors include position information in ParseResultInterface
      const schema = "( 2.5.6.6 NAME 'test' invalid-syntax )"
      const result = parser.parseSchema(schema)

      expect(result.success).toBe(false)
      expect(result.error).toContain(RFC4512ErrorType.SYNTAX_ERROR)
      expect(result.error).toContain('at line 1, column')
    })
  })

  describe('RFC4512ParserError static methods', () => {
    test('should create error from generic Error', () => {
      // Test the static factory method for creating RFC4512ParserError from generic errors
      const originalError = new Error('Original error message')
      const schema = '( test schema )'

      const rfc4512Error = RFC4512ParserError.fromError(
        originalError,
        RFC4512ErrorType.SYNTAX_ERROR,
        schema,
        { context: 'Test context' }
      )

      expect(rfc4512Error).toBeInstanceOf(RFC4512ParserError)
      expect(rfc4512Error.errorType).toBe(RFC4512ErrorType.SYNTAX_ERROR)
      expect(rfc4512Error.schemaDefinition).toBe(schema)
      expect(rfc4512Error.context).toBe('Test context')
      expect(rfc4512Error.cause).toBe(originalError)
      expect(rfc4512Error.message).toBe('Original error message')
    })
  })
})
