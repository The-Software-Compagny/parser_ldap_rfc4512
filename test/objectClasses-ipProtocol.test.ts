import { describe, it, expect, beforeEach } from 'bun:test'
import { RFC4512Parser, LDAPObjectClassInterface } from '../src'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test suite for RFC4512Parser - ObjectClass ipProtocol LDIF parsing functionality
 *
 * This test suite validates the parser's ability to correctly parse and extract
 * information from LDAP ObjectClass definitions in LDIF format, specifically
 * testing against the 'ipProtocol' object class definition.
 *
 * The tests cover:
 * - Basic parsing success validation
 * - OID extraction
 * - Name extraction
 * - Description extraction
 * - Superior class (SUP) extraction
 * - ObjectClass type detection
 * - ObjectClass type classification (STRUCTURAL/AUXILIARY/ABSTRACT)
 * - Required attributes (MUST) extraction
 * - Optional attributes (MAY) extraction
 * - Schema validation
 */
describe('RFC4512Parser - ObjectClass ipProtocol LDIF Parsing', () => {
    let parser: RFC4512Parser
    let ldifContent: string

    /**
     * Set up test environment before each test
     */
    beforeEach(() => {
        parser = new RFC4512Parser({ allowMustMayOverlap: true })
        const ldifPath = join(__dirname, './samples/olcObjectClasses/ipProtocol.ldif')
        ldifContent = readFileSync(ldifPath, 'utf-8').trim()
    })

    /**
     * Test: Parse schema successfully
     */
    it('should successfully parse ipProtocol objectClass schema', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result).toBeDefined()
        expect(result.type).toBe('objectClass')
    })

    /**
     * Test: Extract OID correctly
     */
    it('should extract the correct OID', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.oid).toBe('1.3.6.1.1.1.2.4')
    })

    /**
     * Test: Extract name correctly
     */
    it('should extract the correct name', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.name).toBe('ipProtocol')
    })

    /**
     * Test: Extract description correctly
     */
    it('should extract the correct description', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.desc).toBe('Abstraction of an IP protocol')
    })

    /**
     * Test: Extract superior class correctly
     */
    it('should extract the correct superior class', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.sup).toEqual(['top'])
    })

    /**
     * Test: Detect objectClass type as STRUCTURAL
     */
    it('should detect objectClass type as STRUCTURAL', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.objectClassType).toBe('STRUCTURAL')
    })

    /**
     * Test: Extract required attributes (MUST)
     */
    it('should extract the correct required attributes', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.must).toBeDefined()
        expect(Array.isArray(result.must)).toBe(true)
        expect(result.must).toContain('cn')
        expect(result.must).toContain('ipProtocolNumber')
        expect(result.must).toContain('description')
        expect(result.must?.length).toBe(3)
    })

    /**
     * Test: Extract optional attributes (MAY)
     */
    it('should extract the correct optional attributes', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.may).toBeDefined()
        expect(Array.isArray(result.may)).toBe(true)
        expect(result.may).toContain('description')
        expect(result.may?.length).toBe(1)
    })

    /**
     * Test: Validate schema
     */
    it('should validate the schema as correct', () => {
        const isValid = parser.isValidSchema(ldifContent)
        expect(isValid).toBe(true)
    })

    /**
     * Test: Parse without errors
     */
    it('should parse without throwing errors', () => {
        expect(() => {
            parser.parseSchema<LDAPObjectClassInterface>(ldifContent)
        }).not.toThrow()
    })

    /**
     * Test: Schema contains required elements
     */
    it('should contain all required schema elements', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        // OID is required
        expect(result.oid).toBeDefined()
        expect(result.oid).toBeTruthy()

        // Name is required
        expect(result.name).toBeDefined()
        expect(result.name).toBeTruthy()

        // Type should be objectClass
        expect(result.type).toBe('objectClass')
    })

    /**
     * Test: ObjectClass classification
     */
    it('should correctly classify as STRUCTURAL objectClass', () => {
        const result = parser.parseSchema<LDAPObjectClassInterface>(ldifContent)

        expect(result.objectClassType).toBe('STRUCTURAL')
        expect(result.sup).toEqual(['top'])
    })

    /**
     * Test: Parser with allowMustMayOverlap disabled should throw error
     */
    it('should throw error when allowMustMayOverlap is disabled', () => {
        const strictParser = new RFC4512Parser({ allowMustMayOverlap: false })

        expect(() => {
            strictParser.parseSchema<LDAPObjectClassInterface>(ldifContent)
        }).toThrow('Attributes cannot appear in both MUST and MAY: description')
    })

    /**
     * Test: Parser with allowMustMayOverlap enabled should not throw error
     */
    it('should not throw error when allowMustMayOverlap is enabled', () => {
        const permissiveParser = new RFC4512Parser({ allowMustMayOverlap: true })

        expect(() => {
            permissiveParser.parseSchema<LDAPObjectClassInterface>(ldifContent)
        }).not.toThrow()
    })
})
