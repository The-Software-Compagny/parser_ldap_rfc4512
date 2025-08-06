import { describe, it, expect, beforeEach } from 'bun:test'
import { LDAPObjectClassInterface, RFC4512Parser } from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for RFC4512Parser - ObjectClass X-* Extensions Support
 *
 * This test suite validates the parser's ability to handle X-* extensions
 * in ObjectClass definitions.
 */
describe('RFC4512Parser - ObjectClass X-* Extensions Support', () => {
    let parser: RFC4512Parser
    let ldifContent: string

    /**
     * Set up test environment before each test
     */
    beforeEach(() => {
        parser = new RFC4512Parser()
        const ldifPath = join(__dirname, './samples/olcObjectClasses/testObjectClassExtensions.ldif')
        ldifContent = readFileSync(ldifPath, 'utf-8').trim()
    })

    /**
     * Test: Parse ObjectClass with X-* extensions
     */
    it('should successfully parse ObjectClass with X-* extensions', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result).toBeDefined()
        expect(result.type).toBe('objectClass')
        expect(result.oid).toBe('1.3.6.1.4.1.29426.2.6.1')
        expect(result.name).toBe('testObjectClassWithExtensions')
    })

    /**
     * Test: Extract ObjectClass X-* extensions
     */
    it('should extract X-* extensions from ObjectClass correctly', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.extensions).toBeDefined()
        expect(result.extensions?.['X-ORIGIN']).toBe('Test Organization')
        expect(result.extensions?.['X-SCHEMA-FILE']).toBe('99test.ldif')
    })

    /**
     * Test: ObjectClass standard attributes with extensions
     */
    it('should extract standard ObjectClass attributes when extensions are present', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.oid).toBe('1.3.6.1.4.1.29426.2.6.1')
        expect(result.name).toBe('testObjectClassWithExtensions')
        expect(result.desc).toBe('Test object class with X-* extensions')
        expect(result.sup).toBe('top')
        expect(result.objectClassType).toBe('STRUCTURAL')
        expect(result.must).toEqual(['cn'])
        expect(result.may).toEqual(['description'])
    })

    /**
     * Test: ObjectClass validation with extensions
     */
    it('should validate ObjectClass with X-* extensions', () => {
        const isValid = parser.isValidSchema(ldifContent)
        expect(isValid).toBe(true)
    })
})
