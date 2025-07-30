/**
 * LDAP Object Class Type Union (RFC 4512)
 * 
 * Defines the structural classification of LDAP object classes as specified in RFC 4512.
 * This determines how object classes can be used and instantiated within the directory.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.1} RFC 4512 Section 4.1.1
 */
export type LDAPObjectClassType = 
  /** 
   * Structural Object Class
   * 
   * Represents real-world objects and can be instantiated as directory entries.
   * Each entry must have exactly one structural object class. These classes
   * define the primary structure and required attributes for entries.
   * 
   * @example 'person', 'organizationalUnit', 'country', 'organization'
   * @default This is the default type if not specified
   */
  | 'STRUCTURAL' 
  
  /** 
   * Auxiliary Object Class
   * 
   * Provides additional attributes that can be added to structural object classes.
   * Multiple auxiliary classes can be applied to a single entry to extend its
   * functionality without changing its primary structure.
   * 
   * @example 'posixAccount', 'shadowAccount', 'mailAccount', 'groupOfNames'
   */
  | 'AUXILIARY' 
  
  /** 
   * Abstract Object Class
   * 
   * Defines common attributes and behavior for inheritance purposes only.
   * Cannot be instantiated directly but serves as a base class for other
   * object classes. Used to establish inheritance hierarchies.
   * 
   * @example 'top', 'alias', 'referral'
   */
  | 'ABSTRACT'
