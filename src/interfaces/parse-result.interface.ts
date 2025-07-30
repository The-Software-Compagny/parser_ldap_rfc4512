import type { LDAPSchemaType } from '../types/ldap-schema.type'

/**
 * Parse Result Interface with error handling
 * 
 * Represents the result of parsing an LDAP schema definition.
 * Contains either the parsed data on success or an error message on failure.
 */
export interface ParseResultInterface {
  /** Indicates whether parsing succeeded */
  success: boolean

  /** Parsed data if successful */
  data?: LDAPSchemaType
  
  /** Error message if parsing failed */
  error?: string
}
