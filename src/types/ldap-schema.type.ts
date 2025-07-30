import type { LDAPObjectClassInterface } from '../interfaces/ldap-object-class.interface'
import type { LDAPAttributeTypeInterface } from '../interfaces/ldap-attribute-type.interface'

/**
 * LDAP Schema Type Union (RFC 4512)
 * 
 * Union type representing all possible LDAP schema definition types.
 * This type discriminates between object class and attribute type definitions,
 * providing type safety when working with parsed LDAP schema elements.
 * 
 * The type system allows for proper type checking and IntelliSense support
 * when processing different kinds of LDAP schema definitions.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4512} RFC 4512 - LDAP Directory Information Models
 * @see {@link LDAPObjectClassInterface} For object class definitions
 * @see {@link LDAPAttributeTypeInterface} For attribute type definitions
 * 
 * @example
 * ```typescript
 * function processSchema(schema: LDAPSchemaType) {
 *   if (schema.type === 'objectClass') {
 *     // TypeScript now knows this is LDAPObjectClassInterface
 *     console.log('Object class:', schema.name)
 *     console.log('Must attributes:', schema.must)
 *   } else if (schema.type === 'attributeType') {
 *     // TypeScript now knows this is LDAPAttributeTypeInterface  
 *     console.log('Attribute type:', schema.name)
 *     console.log('Syntax:', schema.syntax?.oid)
 *   }
 * }
 * ```
 */
export type LDAPSchemaType = LDAPObjectClassInterface | LDAPAttributeTypeInterface
