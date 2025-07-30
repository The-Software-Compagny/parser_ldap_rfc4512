import { generate, type Parser, type ParserBuildOptions } from 'peggy'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ParseResultInterface } from './interfaces'
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
export default class RFC4512Parser {
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
      throw new Error(`Error loading grammar: ${error}`)
    }
  }

  /**
   * Parse an LDAP schema definition
   *
   * @param schemaDefinition - The schema definition to parse
   * @returns Parse result with data or error
   */
  public parseSchema(schemaDefinition: string): ParseResultInterface {
    try {
      // Clean input by removing extra whitespace
      const cleanInput = schemaDefinition.trim()

      if (!cleanInput) {
        return {
          success: false,
          error: 'Schema definition cannot be empty'
        };
      }

      // Parse with PEG.js grammar
      const parsed: LDAPSchemaType = this._parser.parse(cleanInput)

      // Basic validation of parsed data
      if (!parsed.oid) {
        return {
          success: false,
          error: 'Missing OID in schema definition'
        }
      }

      if (!parsed.name) {
        return {
          success: false,
          error: 'Missing NAME in schema definition'
        }
      }

      // Additional validation for objectClasses
      if (parsed.type === 'objectClass') {
        const objectClass = parsed as any

        // RFC 4512: ObjectClass must specify exactly one type
        const hasValidType = objectClass.objectClassType === 'STRUCTURAL' ||
          objectClass.objectClassType === 'AUXILIARY' ||
          objectClass.objectClassType === 'ABSTRACT'

        if (!hasValidType) {
          return {
            success: false,
            error: 'ObjectClass must specify exactly one type: STRUCTURAL, AUXILIARY, or ABSTRACT (RFC 4512 Section 4.1.1)'
          }
        }

        // RFC 4512: Validate OID format (dotted decimal notation)
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        if (!oidPattern.test(objectClass.oid)) {
          return {
            success: false,
            error: `Invalid OID format: ${objectClass.oid}. Must follow dotted decimal notation (RFC 4512)`
          }
        }

        // RFC 4512: Validate SUP field constraints
        if (objectClass.sup && typeof objectClass.sup === 'string') {
          // SUP should not be an objectClass type keyword
          const reservedKeywords = ['STRUCTURAL', 'AUXILIARY', 'ABSTRACT', 'MUST', 'MAY', 'DESC', 'NAME', 'OBSOLETE']
          if (reservedKeywords.includes(objectClass.sup.toUpperCase())) {
            return {
              success: false,
              error: `Invalid SUP value: ${objectClass.sup}. SUP should reference a parent objectClass name, not a reserved keyword (RFC 4512)`
            }
          }

          // SUP should not be empty or contain invalid characters
          const supPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/
          if (!supPattern.test(objectClass.sup)) {
            return {
              success: false,
              error: `Invalid SUP format: ${objectClass.sup}. Must be a valid objectClass name (RFC 4512)`
            }
          }
        }

        // RFC 4512: Validate MUST and MAY attributes don't overlap
        if (objectClass.must && objectClass.may) {
          const mustSet = new Set(objectClass.must)
          const maySet = new Set(objectClass.may)
          const overlap = [...mustSet].filter(attr => maySet.has(attr))

          if (overlap.length > 0) {
            return {
              success: false,
              error: `Attributes cannot appear in both MUST and MAY: ${overlap.join(', ')} (RFC 4512 Section 4.1.1)`
            }
          }
        }

        // RFC 4512: Validate attribute name format in MUST/MAY
        const attributeNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/
        const validateAttributeNames = (attributes: string[], listType: string) => {
          for (const attr of attributes) {
            if (!attributeNamePattern.test(attr)) {
              return `Invalid attribute name in ${listType}: ${attr}. Must follow RFC 4512 naming conventions`
            }
          }
          return null
        }

        if (objectClass.must) {
          const mustError = validateAttributeNames(objectClass.must, 'MUST')
          if (mustError) {
            return { success: false, error: mustError }
          }
        }

        if (objectClass.may) {
          const mayError = validateAttributeNames(objectClass.may, 'MAY')
          if (mayError) {
            return { success: false, error: mayError }
          }
        }

        // Generic validation for unknown/invalid fields
        const validObjectClassFields = [
          'type', 'oid', 'name', 'desc', 'sup', 'objectClassType', 'must', 'may'
        ]

        for (const key of Object.keys(objectClass)) {
          if (!validObjectClassFields.includes(key)) {
            return {
              success: false,
              error: `Invalid field in objectClass definition: ${key}. Check RFC 4512 specification for valid fields`
            }
          }
        }
      }

      // Additional validation for attributeTypes
      if (parsed.type === 'attributeType') {
        const attributeType = parsed as any

        // RFC 4512: Validate OID format
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        if (!oidPattern.test(attributeType.oid)) {
          return {
            success: false,
            error: `Invalid OID format: ${attributeType.oid}. Must follow dotted decimal notation (RFC 4512)`
          }
        }

        // RFC 4512: Validate SUP field for attributeTypes
        if (attributeType.sup && typeof attributeType.sup === 'string') {
          const reservedKeywords = ['EQUALITY', 'ORDERING', 'SUBSTR', 'SYNTAX', 'SINGLE-VALUE', 'COLLECTIVE', 'NO-USER-MODIFICATION', 'USAGE']
          if (reservedKeywords.includes(attributeType.sup.toUpperCase())) {
            return {
              success: false,
              error: `Invalid SUP value: ${attributeType.sup}. SUP should reference a parent attributeType name, not a reserved keyword (RFC 4512)`
            }
          }
        }

        // RFC 4512: If no SUP, SYNTAX is required
        if (!attributeType.sup && !attributeType.syntax) {
          return {
            success: false,
            error: 'AttributeType must have either SUP (superior type) or SYNTAX defined (RFC 4512 Section 4.1.2)'
          }
        }

        // Generic validation for unknown/invalid fields
        const validAttributeTypeFields = [
          'type', 'oid', 'name', 'desc', 'sup', 'equality', 'ordering', 'substr',
          'syntax', 'singleValue', 'collective', 'noUserModification', 'usage'
        ]

        for (const key of Object.keys(attributeType)) {
          if (!validAttributeTypeFields.includes(key)) {
            return {
              success: false,
              error: `Invalid field in attributeType definition: ${key}. Check RFC 4512 specification for valid fields`
            }
          }
        }
      }

      return {
        success: true,
        data: parsed
      }

    } catch (error) {
      return {
        success: false,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
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
