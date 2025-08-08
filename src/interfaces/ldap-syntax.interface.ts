/**
 * LDAP Syntax Definition Interface
 * Represents entries from olcLdapSyntaxes.
 */
export interface LDAPSyntaxInterface {
  type: 'ldapSyntax'
  oid: string
  name?: string
  desc?: string
  extensions?: Record<string, string>
}
