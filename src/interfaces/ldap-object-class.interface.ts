import type { LDAPObjectClassType } from '../types'

/**
 * LDAP Object Class Definition Interface (RFC 4512)
 *
 * This interface represents an LDAP object class definition as specified in RFC 4512.
 * Object classes define the structural framework for LDAP entries, specifying which
 * attributes are required (MUST) and which are optional (MAY) for entries of this class.
 *
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.1} RFC 4512 Section 4.1.1
 */
export interface LDAPObjectClassInterface {
  /**
   * Definition type discriminator
   *
   * Always set to 'objectClass' to distinguish from attribute type definitions.
   * Used for type safety and runtime type checking.
   */
  type: 'objectClass'

  /**
   * Object Identifier (OID) - Unique numeric identifier
   *
   * The OID is a globally unique identifier for this object class.
   * It follows the dotted decimal notation as defined in ISO/IEC 8824-1.
   *
   * @example "2.5.6.6" // Person object class OID
   * @example "1.3.6.1.4.1.1466.101.120.111" // inetOrgPerson object class OID
   */
  oid: string

  /**
   * Name(s) of the object class
   *
   * Can contain multiple aliases. The first name is typically considered
   * the primary name. Names must be unique within the schema.
   *
   * @example "person" // Single name
   * @example "( 'inetOrgPerson' 'inetUser' )" // Multiple aliases
   */
  name: string

  /**
   * Optional textual description
   *
   * Human-readable description of the object class's purpose and usage.
   * Should be enclosed in single quotes in LDAP schema definitions.
   *
   * @example "RFC2256: a person"
   */
  desc?: string

  /**
   * Superior object class from which this inherits
   *
   * Specifies the parent object class from which this object class inherits
   * attributes and structural characteristics. Most object classes inherit
   * from 'top' either directly or indirectly.
   *
   * @example "top" // Root object class (most common)
   * @example "person" // Inherits from person object class
   */
  sup?: string

  /**
   * Object class type classification
   *
   * Defines the structural behavior and usage of the object class:
   * - STRUCTURAL: Can be instantiated as entries, represents real-world objects
   * - AUXILIARY: Provides additional attributes to structural classes
   * - ABSTRACT: Cannot be instantiated directly, used only for inheritance
   *
   * @default 'STRUCTURAL' if not specified
   * @example 'STRUCTURAL' // For classes like 'person', 'organizationalUnit'
   * @example 'AUXILIARY' // For classes like 'posixAccount', 'shadowAccount'
   * @example 'ABSTRACT' // For classes like 'top', 'alias'
   */
  objectClassType?: LDAPObjectClassType

  /**
   * Required attributes (MUST clause)
   *
   * List of attribute types that must be present in all entries of this object class.
   * These attributes are mandatory and cannot be omitted when creating entries.
   * Inherited MUST attributes from superior classes are also required.
   *
   * @example ['cn', 'sn'] // Common Name and Surname are required for person
   * @example ['ou'] // Organizational Unit name is required for organizationalUnit
   */
  must?: string[]

  /**
   * Optional attributes (MAY clause)
   *
   * List of attribute types that may be present in entries of this object class.
   * These attributes are optional and can be included based on specific needs.
   * Inherited MAY attributes from superior classes are also allowed.
   *
   * @example ['telephoneNumber', 'mail', 'description'] // Optional contact info
   * @example ['userPassword', 'seeAlso'] // Optional authentication and references
   */
  may?: string[]

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
