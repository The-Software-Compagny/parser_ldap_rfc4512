/**
 * LDAP Equality Matching Rule Type Union (RFC 4512)
 * 
 * Defines the equality matching rules available for LDAP attribute types.
 * These rules determine how equality comparisons are performed for attribute values
 * during search operations and other directory operations.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4517} RFC 4517 - LDAP Syntaxes and Matching Rules
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.3} RFC 4512 Section 4.1.3
 */
export type LDAPEqualityMatchingRuleType = 
  /** 
   * Case Ignore Match
   * 
   * Performs case-insensitive string comparison. Leading and trailing whitespace
   * is ignored, and multiple consecutive whitespace characters are treated as a single space.
   * 
   * @example "John Doe" matches "JOHN DOE" and "  john   doe  "
   */
  | 'caseIgnoreMatch'
  
  /** 
   * Case Exact Match
   * 
   * Performs case-sensitive string comparison. All characters must match exactly,
   * but leading and trailing whitespace is normalized.
   * 
   * @example "John Doe" does NOT match "john doe"
   */
  | 'caseExactMatch'
  
  /** 
   * Numeric String Match
   * 
   * Compares numeric strings by their numeric value, ignoring leading zeros
   * and whitespace normalization.
   * 
   * @example "007" matches "7" and " 07 "
   */
  | 'numericStringMatch'
  
  /** 
   * Integer Match
   * 
   * Compares integer values numerically. The comparison is based on the
   * mathematical value rather than string representation.
   * 
   * @example 42 matches 42, but not "42" (string)
   */
  | 'integerMatch'
  
  /** 
   * Bit String Match
   * 
   * Compares bit strings by their binary representation.
   * Both quoted bit strings and hex representations are supported.
   * 
   * @example "'1010'B" matches "'1010'B"
   */
  | 'bitStringMatch'
  
  /** 
   * Boolean Match
   * 
   * Compares boolean values. Only TRUE and FALSE are valid values.
   * Case-insensitive comparison is performed.
   * 
   * @example "TRUE" matches "true" and "True"
   */
  | 'booleanMatch'
  
  /** 
   * Case Ignore IA5 Match
   * 
   * Case-insensitive matching for IA5 (ASCII) strings.
   * Similar to caseIgnoreMatch but restricted to ASCII characters.
   * 
   * @example Used for email addresses, URLs
   */
  | 'caseIgnoreIA5Match'
  
  /** 
   * Case Exact IA5 Match
   * 
   * Case-sensitive matching for IA5 (ASCII) strings.
   * All ASCII characters must match exactly.
   * 
   * @example Used for case-sensitive identifiers
   */
  | 'caseExactIA5Match'
  
  /** 
   * Octet String Match
   * 
   * Performs exact binary comparison of octet strings.
   * Each byte must match exactly.
   * 
   * @example Used for binary data, certificates, passwords
   */
  | 'octetStringMatch'
  
  /** 
   * Telephone Number Match
   * 
   * Compares telephone numbers by ignoring whitespace and common
   * formatting characters like hyphens and parentheses.
   * 
   * @example "+1 (555) 123-4567" matches "+15551234567"
   */
  | 'telephoneNumberMatch'
  
  /** 
   * Unique Member Match
   * 
   * Compares uniqueMember attribute values, which consist of a
   * distinguished name optionally followed by a unique identifier.
   * 
   * @example Used in groupOfUniqueNames object class
   */
  | 'uniqueMemberMatch'
  
  /** 
   * Distinguished Name Match
   * 
   * Compares LDAP distinguished names by their normalized form.
   * Attribute type names and values are normalized according to their
   * respective matching rules.
   * 
   * @example "cn=John Doe,ou=People,dc=example,dc=com"
   */
  | 'distinguishedNameMatch'
  
  /** 
   * Generalized Time Match
   * 
   * Compares generalized time values by their chronological order.
   * Supports various time formats and timezone specifications.
   * 
   * @example "20240730120000Z" (UTC time format)
   */
  | 'generalizedTimeMatch'
  
  /** 
   * Object Identifier Match
   * 
   * Compares object identifiers (OIDs) by their numeric representation.
   * Leading zeros in arc values are ignored.
   * 
   * @example "1.2.3.4" matches "01.02.03.04"
   */
  | 'objectIdentifierMatch'
  
  /** 
   * Custom matching rules
   * 
   * Allows for implementation-specific or extension matching rules
   * not covered by the standard RFC specifications.
   * 
   * @example Custom organizational matching rules
   */
  | string
