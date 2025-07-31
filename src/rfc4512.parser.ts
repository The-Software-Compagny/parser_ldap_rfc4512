import { generate, type Parser, type ParserBuildOptions } from 'peggy'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ParseResultInterface } from './interfaces'
import { RFC4512ParserError, RFC4512ErrorType } from './interfaces'
import type { LDAPSchemaType } from './types'

/**
 * RFC 4512 LDAP Schema Parser
 *
 * This class uses a PEG.js grammar to parse LDAP schema definitions
 * for object classes and attribute types according to RFC 4512.
 *
 * @example
 * ```typescript
 * const parser = new RFC4512Parser()
 * const result = parser.parseSchema(`
 *   ( 2.5.6.6
 *     NAME 'person'
 *     DESC 'RFC2256: a person'
 *     SUP top
 *     STRUCTURAL
 *     MUST ( sn $ cn )
 *     MAY ( userPassword $ telephoneNumber )
 *   )
 * `)
 *
 * if (result.success) {
 *   console.log('OID:', result.data.oid)
 *   console.log('Name:', result.data.name)
 * }
 * ```
 */
export class RFC4512Parser {
  private readonly _parser: Parser

  /**
   * Constructor - loads and compiles the PEG.js grammar
   */
  public constructor(options?: ParserBuildOptions) {
    try {
      const grammarPath = path.join(__dirname, './_grammars/rfc4512.pegjs')
      const grammar = readFileSync(grammarPath, 'utf-8')
      this._parser = generate(grammar, options)
    } catch (error) {
      throw new RFC4512ParserError(
        `Error loading grammar: ${error instanceof Error ? error.message : 'Unknown error'}`,
        RFC4512ErrorType.GRAMMAR_LOAD_ERROR,
        '',
        { cause: error instanceof Error ? error : undefined }
      )
    }
  }

  /**
   * Parse an LDAP schema definition
   *
   * @param schemaDefinition - The schema definition to parse
   * @returns Parse result with data or error
   * @throws {RFC4512ParserError} When parsing fails with detailed error information
   */
  public parseSchema(schemaDefinition: string): ParseResultInterface {
    try {
      return this.parseSchemaStrict(schemaDefinition)
    } catch (error) {
      if (error instanceof RFC4512ParserError) {
        return {
          success: false,
          error: error.getDetailedMessage()
        }
      }
      return {
        success: false,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Parse an LDAP schema definition with strict error handling (throws exceptions)
   *
   * @param schemaDefinition - The schema definition to parse
   * @returns Parsed schema data
   * @throws {RFC4512ParserError} When parsing fails with detailed error information
   */
  public parseSchemaStrict(schemaDefinition: string): ParseResultInterface {
    try {
      // Clean input by removing extra whitespace
      const cleanInput = schemaDefinition.trim()

      if (!cleanInput) {
        throw new RFC4512ParserError(
          'Schema definition cannot be empty',
          RFC4512ErrorType.EMPTY_INPUT,
          schemaDefinition
        )
      }

      // Parse with PEG.js grammar
      const parsed: LDAPSchemaType = this._parser.parse(cleanInput)

      // Basic validation of parsed data
      if (!parsed.oid) {
        throw new RFC4512ParserError(
          'Missing OID in schema definition',
          RFC4512ErrorType.MISSING_FIELD,
          schemaDefinition,
          { context: 'OID field is required for all LDAP schema definitions' }
        )
      }

      if (!parsed.name) {
        throw new RFC4512ParserError(
          'Missing NAME in schema definition',
          RFC4512ErrorType.MISSING_FIELD,
          schemaDefinition,
          { context: 'NAME field is required for all LDAP schema definitions' }
        )
      }

      // Additional validation for objectClasses
      if (parsed.type === 'objectClass') {
        const objectClass = parsed as any

        // RFC 4512: ObjectClass must specify exactly one type
        const hasValidType = objectClass.objectClassType === 'STRUCTURAL' ||
          objectClass.objectClassType === 'AUXILIARY' ||
          objectClass.objectClassType === 'ABSTRACT'

        if (!hasValidType) {
          throw new RFC4512ParserError(
            'ObjectClass must specify exactly one type: STRUCTURAL, AUXILIARY, or ABSTRACT',
            RFC4512ErrorType.OBJECTCLASS_ERROR,
            schemaDefinition,
            { context: 'RFC 4512 Section 4.1.1 - ObjectClass type validation' }
          )
        }

        // RFC 4512: Validate OID format (dotted decimal notation)
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        if (!oidPattern.test(objectClass.oid)) {
          throw new RFC4512ParserError(
            `Invalid OID format: ${objectClass.oid}. Must follow dotted decimal notation`,
            RFC4512ErrorType.INVALID_OID,
            schemaDefinition,
            { context: 'RFC 4512 - OID must use dotted decimal notation (e.g., 2.5.6.6)' }
          )
        }

        // RFC 4512: Validate SUP field constraints
        if (objectClass.sup && typeof objectClass.sup === 'string') {
          // SUP should not be an objectClass type keyword
          const reservedKeywords = ['STRUCTURAL', 'AUXILIARY', 'ABSTRACT', 'MUST', 'MAY', 'DESC', 'NAME', 'OBSOLETE']
          if (reservedKeywords.includes(objectClass.sup.toUpperCase())) {
            throw new RFC4512ParserError(
              `Invalid SUP value: ${objectClass.sup}. SUP should reference a parent objectClass name, not a reserved keyword`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: 'RFC 4512 - SUP must reference a valid parent objectClass' }
            )
          }

          // SUP should not be empty or contain invalid characters
          const supPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/
          if (!supPattern.test(objectClass.sup)) {
            throw new RFC4512ParserError(
              `Invalid SUP format: ${objectClass.sup}. Must be a valid objectClass name`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: 'RFC 4512 - SUP must follow objectClass naming conventions' }
            )
          }
        }

        // RFC 4512: Validate MUST and MAY attributes don't overlap
        if (objectClass.must && objectClass.may) {
          const mustSet = new Set(objectClass.must)
          const maySet = new Set(objectClass.may)
          const overlap = [...mustSet].filter(attr => maySet.has(attr))

          if (overlap.length > 0) {
            throw new RFC4512ParserError(
              `Attributes cannot appear in both MUST and MAY: ${overlap.join(', ')}`,
              RFC4512ErrorType.VALIDATION_ERROR,
              schemaDefinition,
              { context: 'RFC 4512 Section 4.1.1 - MUST and MAY attributes must be mutually exclusive' }
            )
          }
        }

        // RFC 4512: Validate attribute name format in MUST/MAY
        const attributeNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/
        const validateAttributeNames = (attributes: string[], listType: string) => {
          for (const attr of attributes) {
            if (!attributeNamePattern.test(attr)) {
              throw new RFC4512ParserError(
                `Invalid attribute name in ${listType}: ${attr}. Must follow RFC 4512 naming conventions`,
                RFC4512ErrorType.INVALID_NAME,
                schemaDefinition,
                { context: `${listType} attribute names must start with a letter and contain only letters, numbers, hyphens, and underscores` }
              )
            }
          }
        }

        if (objectClass.must) {
          validateAttributeNames(objectClass.must, 'MUST')
        }

        if (objectClass.may) {
          validateAttributeNames(objectClass.may, 'MAY')
        }

        // Generic validation for unknown/invalid fields
        const validObjectClassFields = [
          'type', 'oid', 'name', 'desc', 'sup', 'objectClassType', 'must', 'may'
        ]

        for (const key of Object.keys(objectClass)) {
          if (!validObjectClassFields.includes(key)) {
            throw new RFC4512ParserError(
              `Invalid field in objectClass definition: ${key}. Check RFC 4512 specification for valid fields`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: `Valid objectClass fields are: ${validObjectClassFields.join(', ')}` }
            )
          }
        }
      }

      // Additional validation for attributeTypes
      if (parsed.type === 'attributeType') {
        const attributeType = parsed as any

        // RFC 4512: Validate OID format
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        if (!oidPattern.test(attributeType.oid)) {
          throw new RFC4512ParserError(
            `Invalid OID format: ${attributeType.oid}. Must follow dotted decimal notation`,
            RFC4512ErrorType.INVALID_OID,
            schemaDefinition,
            { context: 'RFC 4512 - OID must use dotted decimal notation (e.g., 2.5.4.3)' }
          )
        }

        // RFC 4512: Validate SUP field for attributeTypes
        if (attributeType.sup && typeof attributeType.sup === 'string') {
          const reservedKeywords = ['EQUALITY', 'ORDERING', 'SUBSTR', 'SYNTAX', 'SINGLE-VALUE', 'COLLECTIVE', 'NO-USER-MODIFICATION', 'USAGE']
          if (reservedKeywords.includes(attributeType.sup.toUpperCase())) {
            throw new RFC4512ParserError(
              `Invalid SUP value: ${attributeType.sup}. SUP should reference a parent attributeType name, not a reserved keyword`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: 'RFC 4512 - SUP must reference a valid parent attributeType' }
            )
          }
        }

        // RFC 4512: If no SUP, SYNTAX is required
        if (!attributeType.sup && !attributeType.syntax) {
          throw new RFC4512ParserError(
            'AttributeType must have either SUP (superior type) or SYNTAX defined',
            RFC4512ErrorType.ATTRIBUTETYPE_ERROR,
            schemaDefinition,
            { context: 'RFC 4512 Section 4.1.2 - AttributeType must inherit from superior or define syntax' }
          )
        }

        // Generic validation for unknown/invalid fields
        const validAttributeTypeFields = [
          'type', 'oid', 'name', 'desc', 'sup', 'equality', 'ordering', 'substr',
          'syntax', 'singleValue', 'collective', 'noUserModification', 'usage'
        ]

        for (const key of Object.keys(attributeType)) {
          if (!validAttributeTypeFields.includes(key)) {
            throw new RFC4512ParserError(
              `Invalid field in attributeType definition: ${key}. Check RFC 4512 specification for valid fields`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: `Valid attributeType fields are: ${validAttributeTypeFields.join(', ')}` }
            )
          }
        }
      }

      return {
        success: true,
        data: parsed
      }

    } catch (error) {
      // If it's already an RFC4512ParserError, re-throw it
      if (error instanceof RFC4512ParserError) {
        throw error
      }

      // For PEG.js parsing errors, extract position information if available
      const pegError = error as any
      const position = pegError.location ? {
        line: pegError.location.start.line,
        column: pegError.location.start.column,
        offset: pegError.location.start.offset
      } : undefined

      // Create a new RFC4512ParserError for grammar/syntax errors
      throw RFC4512ParserError.fromError(
        error instanceof Error ? error : new Error(String(error)),
        pegError.location ? RFC4512ErrorType.SYNTAX_ERROR : RFC4512ErrorType.UNKNOWN_ERROR,
        schemaDefinition,
        { position }
      )
    }
  }

  /**
   * Parse multiple schema definitions
   *
   * @param schemaDefinitions - Array of definitions to parse
   * @returns Array of parse results
   */
  public parseMultipleSchemas(schemaDefinitions: string[]): ParseResultInterface[] {
    return schemaDefinitions.map(schema => this.parseSchema(schema))
  }

  /**
   * Validate that a schema definition is syntactically correct
   *
   * @param schemaDefinition - The definition to validate
   * @returns true if valid, false otherwise
   */
  public isValidSchema(schemaDefinition: string): boolean {
    const result = this.parseSchema(schemaDefinition)
    return result.success
  }

  /**
   * Extract only the OID from a schema definition
   *
   * @param schemaDefinition - The schema definition
   * @returns The OID or null if not found
   */
  public extractOID(schemaDefinition: string): string | null {
    const result = this.parseSchema(schemaDefinition);
    return result.success ? result.data!.oid : null;
  }

  /**
   * Extract only the name from a schema definition
   *
   * @param schemaDefinition - The schema definition
   * @returns The name or null if not found
   */
  public extractName(schemaDefinition: string): string | null {
    const result = this.parseSchema(schemaDefinition);
    return result.success ? result.data!.name : null;
  }
}

export default RFC4512Parser
