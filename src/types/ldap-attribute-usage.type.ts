/**
 * LDAP Attribute Usage Type Union (RFC 4512)
 * 
 * Defines the usage classification for LDAP attribute types as specified in RFC 4512.
 * This determines how and where an attribute can be used within the directory.
 * 
 * @see {@link https://tools.ietf.org/html/rfc4512#section-4.1.2} RFC 4512 Section 4.1.2
 */
export type LDAPAttributeUsageType = 
  /** 
   * User Applications (default)
   * 
   * Standard user data attributes that can be modified by users and applications.
   * This is the default usage if not specified. Most common attributes like 'cn',
   * 'mail', 'telephoneNumber' fall into this category.
   * 
   * @example 'cn', 'mail', 'givenName', 'sn'
   */
  | 'userApplications' 
  
  /** 
   * Directory Operation
   * 
   * Operational attributes used by the directory server for its internal operations.
   * These are typically maintained automatically by the server and may not be
   * directly modifiable by users.
   * 
   * @example 'createTimestamp', 'modifyTimestamp', 'creatorsName'
   */
  | 'directoryOperation' 
  
  /** 
   * Distributed Operation
   * 
   * Operational attributes used for distributed directory operations and replication.
   * These support multi-master replication and distributed directory services.
   * 
   * @example Replication metadata, conflict resolution attributes
   */
  | 'distributedOperation' 
  
  /** 
   * DSA Operation
   * 
   * Attributes specific to Directory System Agent (DSA) operations.
   * These are used for DSA-specific functionality and server administration.
   * 
   * @example DSA configuration attributes, server-specific operational data
   */
  | 'dSAOperation'
