/**
 * LDAP Substring Matching Rule Type Union (RFC 4512)
 * 
 * Defines the substring matching rules available for LDAP attribute types.
 * These rules determine how substring searches (initial, any, final) are performed
 * for attribute values during wildcard search operations.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4517} RFC 4517 - LDAP Syntaxes and Matching Rules
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.3} RFC 4512 Section 4.1.3
 */
export type LDAPSubstringMatchingRuleType = 
  /** 
   * Case Ignore Substrings Match
   * 
   * Performs case-insensitive substring matching. Supports initial (*value),
   * any (value), and final (value*) substring searches. Whitespace is
   * normalized before comparison.
   * 
   * @example "john*" matches "John Doe", "*doe" matches "Jane Doe", "*oh*" matches "John"
   */
  | 'caseIgnoreSubstringsMatch'
  
  /** 
   * Case Exact Substrings Match
   * 
   * Performs case-sensitive substring matching. All characters must match
   * exactly including case. Supports the same wildcard patterns as case
   * ignore matching but with strict case sensitivity.
   * 
   * @example "John*" matches "John Doe" but NOT "john doe"
   */
  | 'caseExactSubstringsMatch'
  
  /** 
   * Numeric String Substrings Match
   * 
   * Performs substring matching on numeric strings. Useful for searching
   * within numeric identifiers, codes, or other numeric string values.
   * Leading zeros may be normalized depending on implementation.
   * 
   * @example "123*" matches "12345", "*89" matches "6789"
   */
  | 'numericStringSubstringsMatch'
  
  /** 
   * Telephone Number Substrings Match
   * 
   * Performs substring matching on telephone numbers with normalization
   * of common formatting characters (spaces, hyphens, parentheses).
   * Useful for searching phone numbers regardless of formatting.
   * 
   * @example "555*" matches "+1 (555) 123-4567" and "555-1234"
   */
  | 'telephoneNumberSubstringsMatch'
  
  /** 
   * Custom substring matching rules
   * 
   * Allows for implementation-specific or extension substring matching rules
   * not covered by the standard RFC specifications.
   * 
   * @example Custom organizational substring rules, locale-specific matching
   */
  | string
