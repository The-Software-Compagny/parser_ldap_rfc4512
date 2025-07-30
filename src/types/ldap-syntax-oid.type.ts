/**
 * LDAP Syntax OID Type Union (RFC 4512)
 * 
 * Defines the most commonly used LDAP syntax Object Identifiers (OIDs) as specified
 * in RFC 4517 and other LDAP standards. These OIDs identify the data type and format
 * constraints for LDAP attribute values.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4517} RFC 4517 - LDAP Syntaxes and Matching Rules
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.2} RFC 4512 Section 4.1.2
 */
export type LDAPSyntaxOIDType = 
  /** 
   * Directory String (UTF-8)
   * 
   * Unicode string encoded in UTF-8. This is the most common syntax for
   * textual data in LDAP. Supports international characters and is used
   * for names, descriptions, and other human-readable text.
   * 
   * @example Common Name (cn), Description, Display Name
   */
  | '1.3.6.1.4.1.1466.115.121.1.15'
  
  /** 
   * Integer
   * 
   * Signed integer values. Can represent both positive and negative whole numbers.
   * Used for numeric identifiers, counts, and other integer data.
   * 
   * @example Employee ID, Version Numbers, Counts
   */
  | '1.3.6.1.4.1.1466.115.121.1.27'
  
  /** 
   * Boolean
   * 
   * Boolean values represented as "TRUE" or "FALSE" (case-insensitive).
   * Used for binary flags and yes/no type attributes.
   * 
   * @example Account Enabled, Password Required flags
   */
  | '1.3.6.1.4.1.1466.115.121.1.7'
  
  /** 
   * Octet String
   * 
   * Binary data or arbitrary byte sequences. Used for storing binary content
   * such as certificates, images, or encrypted data.
   * 
   * @example User Certificates, Binary Documents, Encrypted Passwords
   */
  | '1.3.6.1.4.1.1466.115.121.1.40'
  
  /** 
   * Distinguished Name
   * 
   * LDAP Distinguished Name format (DN). Represents the full path to an
   * entry in the directory tree using comma-separated attribute-value pairs.
   * 
   * @example "cn=John Doe,ou=People,dc=example,dc=com"
   */
  | '1.3.6.1.4.1.1466.115.121.1.12'
  
  /** 
   * Generalized Time
   * 
   * Timestamp format following ISO 8601 with optional timezone information.
   * Used for storing date and time values with precise temporal information.
   * 
   * @example "20240730120000Z", "20240730140000+0200"
   */
  | '1.3.6.1.4.1.1466.115.121.1.24'
  
  /** 
   * IA5 String (ASCII)
   * 
   * ASCII character string (International Alphabet 5). Limited to 7-bit
   * ASCII characters. Commonly used for email addresses and URLs.
   * 
   * @example Email addresses, DNS names, URLs
   */
  | '1.3.6.1.4.1.1466.115.121.1.26'
  
  /** 
   * Telephone Number
   * 
   * Telephone number format with flexible formatting. Allows various
   * international formats with spaces, hyphens, and parentheses.
   * 
   * @example "+1 (555) 123-4567", "555-1234", "+33 1 23 45 67 89"
   */
  | '1.3.6.1.4.1.1466.115.121.1.50'
  
  /** 
   * Numeric String
   * 
   * String containing only numeric digits (0-9) and spaces. Used for
   * numeric identifiers that need to be stored as strings.
   * 
   * @example Social Security Numbers, Account Numbers, Postal Codes
   */
  | '1.3.6.1.4.1.1466.115.121.1.36'
  
  /** 
   * Bit String
   * 
   * String of binary digits (bits) represented in various formats.
   * Can be expressed as quoted bit strings or hexadecimal notation.
   * 
   * @example "'1010110'B", "'ABCD'H" (hex format)
   */
  | '1.3.6.1.4.1.1466.115.121.1.6'
  
  /** 
   * Custom or Extension Syntaxes
   * 
   * Allows for implementation-specific or vendor-specific syntax OIDs
   * not covered by the standard RFC specifications.
   * 
   * @example Organization-specific data formats, proprietary syntaxes
   */
  | string
