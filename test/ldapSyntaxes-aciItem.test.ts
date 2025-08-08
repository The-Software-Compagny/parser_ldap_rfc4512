import { describe, it, expect } from 'bun:test'
import { RFC4512Parser, type LDAPSyntaxInterface } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for LDAP Syntax definitions (olcLdapSyntaxes) using sample file.
 */
describe('RFC4512Parser - LDAP Syntax definitions (sample file)', () => {
  const samplePath = join(__dirname, 'samples/olcLdapSyntaxes/aciItem.ldif')
  const syntaxDefinition = readFileSync(samplePath, 'utf-8').trim()

  it('should parse (ldapSyntax always supported)', () => {
    const parser = new RFC4512Parser()
    const result = parser.parseSchema<LDAPSyntaxInterface>(syntaxDefinition)
    expect(result.type).toBe('ldapSyntax')
    expect(result.oid).toBe('1.3.6.1.4.1.1466.115.121.1.1')
  })

  it('should parse with explicit config (backward compatibility)', () => {
    const parser = new RFC4512Parser({ enableSyntaxParsing: true })
    const result = parser.parseSchema<LDAPSyntaxInterface>(syntaxDefinition)
    expect(result.type).toBe('ldapSyntax')
    expect(result.desc).toBe('ACI Item')
    expect(result.extensions?.['X-BINARY-TRANSFER-REQUIRED']).toBe('TRUE')
    expect(result.extensions?.['X-NOT-HUMAN-READABLE']).toBe('TRUE')
  })
})
