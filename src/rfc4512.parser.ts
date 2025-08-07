import { generate, type Parser, type ParserBuildOptions } from 'peggy'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { RFC4512ParserError, RFC4512ErrorType, type RFC4512ParserOptions } from './interfaces'
import type { LDAPSchemaType } from './types'

/**
 * RFC 4512 LDAP Schema Parser
 *
 * This class uses a PEG.js grammar to parse LDAP schema definitions
 * for object classes and attribute types according to RFC 4512.
 * It also supports OpenLDAP cn=config format with optional index prefixes.
 *
 * In relaxed mode, it can also parse OpenLDAP-specific OID formats like
 * 'OLcfgOvAt:18.1' which are commonly used in OpenLDAP cn=config schemas
 * but are not compliant with RFC 4512.
 *
 * @example
 * ```typescript
 * // Strict RFC 4512 mode (default)
 * const parser = new RFC4512Parser()
 *
 * // Relaxed mode supporting OpenLDAP OIDs
 * const relaxedParser = new RFC4512Parser({ relaxedMode: true })
 *
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
  private readonly _options: RFC4512ParserOptions

  /**
   * Constructor - loads and compiles the PEG.js grammar
   *
   * @param options - Parser configuration options
   * @param pegOptions - PEG.js specific build options
   */
  public constructor(options?: RFC4512ParserOptions, pegOptions?: ParserBuildOptions) {
    this._options = {
      relaxedMode: false,
      ...options
    }
    try {
      const grammarPath = path.join(__dirname, './_grammars/rfc4512.pegjs')
      const grammar = readFileSync(grammarPath, 'utf-8')
      this._parser = generate(grammar, pegOptions)
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
   * Remove OpenLDAP cn=config index prefixes from schema definitions
   *
   * This method handles index prefixes like {0}, {57}, etc. that are used
   * in OpenLDAP's cn=config format to maintain ordering of multi-valued
   * attributes like olcAttributeTypes and olcObjectClasses.
   *
   * @private
   * @param schemaDefinition - The raw schema definition that may contain OpenLDAP prefixes
   * @returns Cleaned schema definition without OpenLDAP prefixes
   *
   * @example
   * Input: "{57}( 1.3.6.1.4.1.7165.2.1.80 NAME 'test' ... )"
   * Output: "( 1.3.6.1.4.1.7165.2.1.80 NAME 'test' ... )"
   */
  private removeOpenLDAPPrefix(schemaDefinition: string): string {
    // Pattern to match OpenLDAP index prefix: {number} at the start of the definition
    // The pattern allows for optional whitespace before and after the prefix
    const openLdapPrefixPattern = /^\s*\{\d+\}\s*/

    return schemaDefinition.replace(openLdapPrefixPattern, '').trim()
  }

  /**
   * Transform OpenLDAP OIDs to a format acceptable by the grammar in relaxed mode
   *
   * @private
   * @param schemaDefinition - The schema definition that may contain OpenLDAP OIDs
   * @returns Schema definition with transformed OIDs if in relaxed mode
   */
  private transformOpenLDAPOids(schemaDefinition: string): string {
    if (!this._options.relaxedMode) {
      return schemaDefinition
    }

    // Pattern to match OpenLDAP configuration OIDs
    // Matches: OLcfgOvAt:18.1, OLcfgDbAt:2.3, etc.
    const openldapOidPattern = /\b(OLcfg(?:Ov|Db|Gl)(?:At|Oc)):([\d.]+)\b/g

    return schemaDefinition.replace(openldapOidPattern, (match, prefix, suffix) => {
      // In relaxed mode, we keep the OpenLDAP format as-is since our grammar now supports it
      return match
    })
  }

  /**
   * Parse an LDAP schema definition
   *
   * @param schemaDefinition - The schema definition to parse (supports both RFC 4512 format and OpenLDAP cn=config format with index prefixes)
   * @returns Parsed schema data
   * @throws {RFC4512ParserError} When parsing fails with detailed error information
   */
  public parseSchema<T extends LDAPSchemaType>(schemaDefinition: string): T {
    try {
      // Clean input by removing OpenLDAP prefixes and extra whitespace
      let cleanInput = this.removeOpenLDAPPrefix(schemaDefinition).trim()

      // Transform OpenLDAP OIDs if in relaxed mode
      cleanInput = this.transformOpenLDAPOids(cleanInput)

      if (!cleanInput) {
        throw new RFC4512ParserError(
          'Schema definition cannot be empty',
          RFC4512ErrorType.EMPTY_INPUT,
          schemaDefinition
        )
      }

      // Check for OpenLDAP OIDs in strict mode
      if (!this._options.relaxedMode) {
        const openldapOidPattern = /\b(OLcfg(?:Ov|Db|Gl)(?:At|Oc)):([\d.]+)\b/
        if (openldapOidPattern.test(cleanInput)) {
          throw new RFC4512ParserError(
            'OpenLDAP configuration OIDs are not supported in strict RFC 4512 mode. Use relaxedMode: true to enable support.',
            RFC4512ErrorType.SYNTAX_ERROR,
            schemaDefinition
          )
        }
      }

      // Parse with PEG.js grammar
      const parsed: T = this._parser.parse(cleanInput)

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
        // In relaxed mode, also allow OpenLDAP configuration OIDs
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        const openldapOidPattern = /^OLcfg(?:Ov|Db|Gl)(?:At|Oc):[0-9]+(\.[0-9]+)*$/

        const isValidOid = this._options.relaxedMode
          ? (oidPattern.test(objectClass.oid) || openldapOidPattern.test(objectClass.oid))
          : oidPattern.test(objectClass.oid)

        if (!isValidOid) {
          const validFormats = this._options.relaxedMode
            ? 'dotted decimal notation (e.g., 2.5.6.6) or OpenLDAP configuration format (e.g., OLcfgOvAt:18.1)'
            : 'dotted decimal notation (e.g., 2.5.6.6)'

          throw new RFC4512ParserError(
            `Invalid OID format: ${objectClass.oid}. Must follow ${validFormats}`,
            RFC4512ErrorType.INVALID_OID,
            schemaDefinition,
            { context: `RFC 4512 - OID validation (relaxedMode: ${this._options.relaxedMode})` }
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
          'type', 'oid', 'name', 'desc', 'sup', 'objectClassType', 'must', 'may', 'extensions'
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
        // In relaxed mode, also allow OpenLDAP configuration OIDs
        const oidPattern = /^[0-9]+(\.[0-9]+)*$/
        const openldapOidPattern = /^OLcfg(?:Ov|Db|Gl)(?:At|Oc):[0-9]+(\.[0-9]+)*$/

        const isValidOid = this._options.relaxedMode
          ? (oidPattern.test(attributeType.oid) || openldapOidPattern.test(attributeType.oid))
          : oidPattern.test(attributeType.oid)

        if (!isValidOid) {
          const validFormats = this._options.relaxedMode
            ? 'dotted decimal notation (e.g., 2.5.4.3) or OpenLDAP configuration format (e.g., OLcfgOvAt:18.1)'
            : 'dotted decimal notation (e.g., 2.5.4.3)'

          throw new RFC4512ParserError(
            `Invalid OID format: ${attributeType.oid}. Must follow ${validFormats}`,
            RFC4512ErrorType.INVALID_OID,
            schemaDefinition,
            { context: `RFC 4512 - OID validation (relaxedMode: ${this._options.relaxedMode})` }
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

        // Validate SYNTAX field format in strict mode
        if (attributeType.syntax && !this._options.relaxedMode) {
          const syntaxOid = attributeType.syntax.oid
          const standardOidPattern = /^[0-9]+(\.[0-9]+)*$/

          if (!standardOidPattern.test(syntaxOid)) {
            throw new RFC4512ParserError(
              `Invalid SYNTAX OID format: ${syntaxOid}. In strict mode, SYNTAX must use standard numeric OID format (e.g., '1.3.6.1.4.1.1466.115.121.1.15'). Use relaxedMode: true to support OpenLDAP syntax names.`,
              RFC4512ErrorType.INVALID_FIELD,
              schemaDefinition,
              { context: `RFC 4512 - SYNTAX validation (relaxedMode: ${this._options.relaxedMode})` }
            )
          }
        }

        // Generic validation for unknown/invalid fields
        const validAttributeTypeFields = [
          'type', 'oid', 'name', 'desc', 'sup', 'equality', 'ordering', 'substr',
          'syntax', 'singleValue', 'collective', 'noUserModification', 'usage', 'extensions'
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

      return parsed

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
   * @returns Array of parsed schema data
   * @throws {RFC4512ParserError} When any parsing fails with detailed error information
   */
  public parseMultipleSchemas(schemaDefinitions: string[]): LDAPSchemaType[] {
    return schemaDefinitions.map(schema => this.parseSchema(schema))
  }

  /**
   * Validate that a schema definition is syntactically correct
   *
   * @param schemaDefinition - The definition to validate
   * @returns true if valid, false otherwise
   */
  public isValidSchema(schemaDefinition: string): boolean {
    try {
      this.parseSchema(schemaDefinition)
      return true
    } catch {
      return false
    }
  }

  /**
   * Extract only the OID from a schema definition
   *
   * @param schemaDefinition - The schema definition
   * @returns The OID or null if not found
   */
  public extractOID(schemaDefinition: string): string | null {
    try {
      const result = this.parseSchema(schemaDefinition);
      return result.oid;
    } catch {
      return null;
    }
  }

  /**
   * Extract only the name from a schema definition
   *
   * @param schemaDefinition - The schema definition
   * @returns The name or null if not found
   */
  public extractName(schemaDefinition: string): string | null {
    try {
      const result = this.parseSchema(schemaDefinition);
      return result.name;
    } catch {
      return null;
    }
  }

  /**
   * Get current parser options
   */
  public get options(): RFC4512ParserOptions {
    return { ...this._options }
  }
}

export default RFC4512Parser
