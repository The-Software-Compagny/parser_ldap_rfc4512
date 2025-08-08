import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LDAPObjectClassInterface } from '../src/interfaces'

describe('RFC4512Parser - ObjectClasses labeledURIObject', () => {
    let parser: RFC4512Parser
    let ldifContent: string

    beforeEach(() => {
        parser = new RFC4512Parser()
        const samplePath = join(__dirname, 'samples', 'olcObjectClasses', 'labeledURIObject.ldif')
        ldifContent = readFileSync(samplePath, 'utf8')
    })

    it('should parse labeledURIObject object class correctly', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.name).toBe('labeledURIObject')
        expect(result.oid).toBe('1.3.6.1.4.1.250.3.15')
        expect(result.desc).toBe('RFC2079: object that contains the URI attribute type')
        expect(result.may).toEqual(['labeledURI'])
        expect(result.sup).toEqual(['top'])
        expect(result.objectClassType).toBe('AUXILIARY')
        expect(result.must).toBeNull()
        expect(result.type).toBe('objectClass')
    })

    it('should handle the numbered prefix {23} correctly', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        // The parser should handle the {23} prefix without issues
        expect(result.name).toBe('labeledURIObject')
        expect(result.oid).toBe('1.3.6.1.4.1.250.3.15')
    })
})
