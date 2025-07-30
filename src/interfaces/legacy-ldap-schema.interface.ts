/**
 * Legacy LDAP Schema Interface
 * 
 * This interface provides backward compatibility with older versions of the LDAP schema parser.
 * It combines both object class and attribute type definitions in a single interface.
 * 
 * @deprecated Use LDAPObjectClassDefinition or LDAPAttributeTypeDefinition instead
 * @see {@link LDAPObjectClassDefinition} For object class definitions
 * @see {@link LDAPAttributeTypeDefinition} For attribute type definitions
 */
export interface LegacyLDAPSchemaInterface {
  /** 
   * Object Identifier (OID) - Unique numeric identifier
   * 
   * The OID is a globally unique identifier for LDAP schema elements.
   * It follows the dotted decimal notation (e.g., "1.3.6.1.4.1.1466.101.120.111").
   * 
   * @example "2.5.6.6" // Person object class OID
   */
  oid: string

  /** 
   * Name(s) of the schema element
   * 
   * Can contain multiple aliases separated by spaces or as an array.
   * The first name is typically considered the primary name.
   * 
   * @example "person" or "( 'person' 'personalData' )"
   */
  name: string

  /** 
   * Optional textual description
   * 
   * Human-readable description of what this schema element represents.
   * Should be enclosed in single quotes in LDAP schema definitions.
   * 
   * @example "RFC2256: a person"
   */
  desc?: string

  /** 
   * Superior class from which this definition inherits
   * 
   * For object classes: specifies the parent object class.
   * For attribute types: specifies the parent attribute type.
   * 
   * @example "top" // Most object classes inherit from 'top'
   */
  sup?: string

  /** 
   * Object class type classification
   * 
   * Defines the structural behavior of the object class:
   * - STRUCTURAL: Can be instantiated as entries (e.g., person, organizationalUnit)
   * - AUXILIARY: Provides additional attributes to structural classes (e.g., posixAccount)
   * - ABSTRACT: Cannot be instantiated directly, used for inheritance (e.g., top)
   * 
   * @default 'STRUCTURAL' if not specified
   */
  type?: 'STRUCTURAL' | 'AUXILIARY' | 'ABSTRACT'

  /** 
   * Required attributes (MUST clause)
   * 
   * List of attribute types that must be present in entries of this object class.
   * These are mandatory attributes that cannot be omitted.
   * 
   * @example ['cn', 'sn'] // Common Name and Surname are required
   */
  must?: string[]
  
  /** 
   * Optional attributes (MAY clause)
   * 
   * List of attribute types that may be present in entries of this object class.
   * These are optional attributes that can be included but are not required.
   * 
   * @example ['telephoneNumber', 'mail', 'description']
   */
  may?: string[]
}
