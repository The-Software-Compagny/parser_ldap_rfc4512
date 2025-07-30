/**
 * LDAP Ordering Matching Rule Type Union (RFC 4512)
 * 
 * Defines the ordering matching rules available for LDAP attribute types.
 * These rules determine how ordering comparisons (less than, greater than)
 * are performed for attribute values during search operations and sorting.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4517} RFC 4517 - LDAP Syntaxes and Matching Rules
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.3} RFC 4512 Section 4.1.3
 */
export type LDAPOrderingMatchingRuleType = 
  /** 
   * Case Ignore Ordering Match
   * 
   * Performs case-insensitive lexicographical ordering of string values.
   * Whitespace is normalized before comparison. Commonly used for sorting
   * names and textual data where case should be ignored.
   * 
   * @example "apple" < "Banana" < "cherry"
   */
  | 'caseIgnoreOrderingMatch'
  
  /** 
   * Case Exact Ordering Match
   * 
   * Performs case-sensitive lexicographical ordering of string values.
   * All characters are compared exactly as they appear, with uppercase
   * letters typically sorting before lowercase in ASCII ordering.
   * 
   * @example "Apple" < "Banana" < "apple" < "banana"
   */
  | 'caseExactOrderingMatch'
  
  /** 
   * Numeric String Ordering Match
   * 
   * Orders numeric strings by their mathematical value rather than
   * lexicographical order. Leading zeros are ignored in the comparison.
   * 
   * @example "2" < "10" < "100" (not "10" < "100" < "2")
   */
  | 'numericStringOrderingMatch'
  
  /** 
   * Integer Ordering Match
   * 
   * Orders integer values by their mathematical value. Supports both
   * positive and negative integers with proper numerical ordering.
   * 
   * @example -10 < -5 < 0 < 5 < 10
   */
  | 'integerOrderingMatch'
  
  /** 
   * Octet String Ordering Match
   * 
   * Orders octet strings by comparing their binary representation
   * byte by byte. Uses lexicographical ordering of the byte values.
   * 
   * @example Used for binary data, certificates, hash values
   */
  | 'octetStringOrderingMatch'
  
  /** 
   * Generalized Time Ordering Match
   * 
   * Orders generalized time values chronologically. Handles various
   * time formats and timezone conversions for proper temporal ordering.
   * 
   * @example "20240101120000Z" < "20240730120000Z" < "20241231235959Z"
   */
  | 'generalizedTimeOrderingMatch'
  
  /** 
   * Custom ordering rules
   * 
   * Allows for implementation-specific or extension ordering rules
   * not covered by the standard RFC specifications.
   * 
   * @example Custom organizational ordering rules, locale-specific sorting
   */
  | string
