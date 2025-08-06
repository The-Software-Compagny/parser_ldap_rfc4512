import type {
  LDAPAttributeUsageType,
  LDAPEqualityMatchingRuleType,
  LDAPOrderingMatchingRuleType,
  LDAPSubstringMatchingRuleType,
  LDAPSyntaxOIDType,
} from '../types'

/**
 * LDAP Attribute Type Definition Interface (RFC 4512)
 *
 * This interface represents an LDAP attribute type definition as specified in RFC 4512.
 * Attribute types define the characteristics and behavior of attributes that can be used
 * in LDAP entries, including their syntax, matching rules, and usage constraints.
 *
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.2} RFC 4512 Section 4.1.2
 */
export interface LDAPAttributeTypeInterface {
  /**
   * Definition type discriminator
   *
   * Always set to 'attributeType' to distinguish from object class definitions.
   * Used for type safety and runtime type checking.
   */
  type: 'attributeType'

  /**
   * Object Identifier (OID) - Unique numeric identifier
   *
   * The OID is a globally unique identifier for this attribute type.
   * It follows the dotted decimal notation as defined in ISO/IEC 8824-1.
   *
   * @example "2.5.4.3" // Common Name (cn) attribute OID
   * @example "1.3.6.1.4.1.1466.101.120.5" // Custom organization attribute
   */
  oid: string

  /**
   * Name(s) of the attribute type
   *
   * Can contain multiple aliases. The first name is typically considered
   * the primary name. Names must be unique within the schema.
   *
   * @example "cn" // Single name
   * @example "( 'commonName' 'cn' )" // Multiple aliases
   */
  name: string

  /**
   * Optional textual description
   *
   * Human-readable description of the attribute type's purpose and usage.
   * Should be enclosed in single quotes in LDAP schema definitions.
   *
   * @example "RFC2256: common name(s) for which the entity is known by"
   */
  desc?: string

  /**
   * Superior attribute type from which this inherits
   *
   * Specifies the parent attribute type from which this attribute inherits
   * characteristics like syntax and matching rules. If not specified,
   * the attribute must define its own syntax.
   *
   * @example "name" // Inherits from the 'name' attribute type
   */
  sup?: string

  /**
   * Equality matching rule
   *
   * Defines how equality comparisons are performed for this attribute.
   * If not specified, it may be inherited from the superior attribute type.
   *
   * @example "caseIgnoreMatch" // Case-insensitive string matching
   * @example "integerMatch" // Integer comparison
   */
  equality?: LDAPEqualityMatchingRuleType

  /**
   * Ordering matching rule
   *
   * Defines how ordering comparisons (less than, greater than) are performed.
   * Used for sorting and range queries. Not all attribute types support ordering.
   *
   * @example "caseIgnoreOrderingMatch" // Case-insensitive string ordering
   * @example "integerOrderingMatch" // Numeric ordering
   */
  ordering?: LDAPOrderingMatchingRuleType

  /**
   * Substring matching rule
   *
   * Defines how substring searches are performed (initial, any, final).
   * Used for wildcard searches and partial matching operations.
   *
   * @example "caseIgnoreSubstringsMatch" // Case-insensitive substring matching
   */
  substr?: LDAPSubstringMatchingRuleType

  /**
   * Attribute syntax specification
   *
   * Defines the data type and format constraints for attribute values.
   * The OID identifies the syntax type, and length provides an optional
   * maximum length constraint.
   */
  syntax?: {
    /**
     * Syntax OID identifying the data type
     *
     * @example "1.3.6.1.4.1.1466.115.121.1.15" // Directory String syntax
     * @example "1.3.6.1.4.1.1466.115.121.1.27" // Integer syntax
     */
    oid: LDAPSyntaxOIDType

    /**
     * Optional maximum length constraint
     *
     * Specifies the maximum number of characters or bytes allowed
     * for values of this attribute type.
     *
     * @example 256 // Maximum 256 characters
     */
    length?: number
  }

  /**
   * Single value constraint
   *
   * When true, indicates that this attribute can have at most one value
   * per entry. When false or undefined, multiple values are allowed.
   *
   * @default false // Multiple values allowed by default
   * @example true // For attributes like 'userPassword' or 'employeeID'
   */
  singleValue?: boolean

  /**
   * Collective attribute indicator
   *
   * When true, indicates this is a collective attribute that can be
   * shared across multiple entries in a subtree. Collective attributes
   * are managed differently from regular attributes.
   *
   * @default false
   * @see {@link https://tools.ietf.org/html/rfc3671} RFC 3671 - Collective Attributes
   */
  collective?: boolean

  /**
   * User modification restriction
   *
   * When true, indicates that this attribute cannot be modified by
   * regular users and is maintained by the directory server itself.
   *
   * @default false
   * @example true // For operational attributes like 'createTimestamp'
   */
  noUserModification?: boolean

  /**
   * Attribute usage classification
   *
   * Defines how and where the attribute can be used:
   * - userApplications: Normal user data attributes (default)
   * - directoryOperation: Operational attributes for directory operations
   * - distributedOperation: Attributes for distributed directory operations
   * - dSAOperation: Attributes specific to Directory System Agent operations
   *
   * @default 'userApplications'
   * @example 'directoryOperation' // For attributes like 'createTimestamp'
   */
  usage?: LDAPAttributeUsageType

  /**
   * Vendor-specific extensions
   *
   * Contains any X-* extensions defined in the schema. These are vendor-specific
   * extensions that provide additional metadata or functionality beyond the RFC 4512 standard.
   * Common examples include X-ORIGIN, X-DEPRECATED, X-ORDERED, etc.
   *
   * @example { 'X-ORIGIN': 'Sun ONE Messaging Server' }
   * @example { 'X-DEPRECATED': 'true', 'X-ORIGIN': 'Custom Application' }
   */
  extensions?: Record<string, string>
}
