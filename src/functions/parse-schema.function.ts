import type { ParserBuildOptions } from 'peggy'
import RFC4512Parser from '../rfc4512.parser'
import type { ParseResultInterface } from '../interfaces'

/**
 * Utility function to parse a schema definition
 * (shortcut for creating an instance and parsing)
 * 
 * @param schemaDefinition - The definition to parse
 * @returns Parse result
 */
export function parseSchema(schemaDefinition: string, options?: ParserBuildOptions): ParseResultInterface {
    const parser = new RFC4512Parser(options)
    return parser.parseSchema(schemaDefinition)
  }