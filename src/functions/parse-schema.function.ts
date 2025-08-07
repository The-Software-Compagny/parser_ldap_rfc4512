import type { ParserBuildOptions } from 'peggy'
import RFC4512Parser from '../rfc4512.parser'
import type { LDAPSchemaType } from '../types'
import { RFC4512ParserOptions } from '../interfaces'

/**
 * Utility function to parse a schema definition
 * (shortcut for creating an instance and parsing)
 *
 * @param schemaDefinition - The definition to parse
 * @returns Parsed schema data
 * @throws {RFC4512ParserError} When parsing fails with detailed error information
 */
export function parseSchema<T extends LDAPSchemaType>(
  schemaDefinition: string,
  options?: RFC4512ParserOptions,
  pegOptions?: ParserBuildOptions,
): T {
  const parser = new RFC4512Parser(options, pegOptions)
  return parser.parseSchema(schemaDefinition)
}
