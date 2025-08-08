import { describe, it, expect } from 'bun:test'
import { RFC4512Parser, LDAPObjectClassInterface } from '../src'

/**
 * Test suite for RFC4512Parser - allowMustMayOverlap Option
 *
 * This test suite validates the parser's ability to handle schemas where
 * the same attribute appears in both MUST and MAY lists when the
 * allowMustMayOverlap option is enabled.
 */
describe('RFC4512Parser - allowMustMayOverlap Option', () => {
    const schemaWithOverlap = `
    ( 1.3.6.1.1.1.2.4 NAME 'ipProtocol' DESC 'Abstraction of an IP protocol'
      SUP top STRUCTURAL
      MUST ( cn $ ipProtocolNumber $ description )
      MAY description )
  `

    /**
     * Test: Default behavior should reject MUST/MAY overlap
     */
    it('should reject MUST/MAY overlap by default', () => {
        const parser = new RFC4512Parser()

        expect(() => {
            parser.parseSchema<LDAPObjectClassInterface>(schemaWithOverlap)
        }).toThrow('Attributes cannot appear in both MUST and MAY: description')
    })

    /**
     * Test: Explicit strict mode should reject MUST/MAY overlap
     */
    it('should reject MUST/MAY overlap when allowMustMayOverlap is false', () => {
        const parser = new RFC4512Parser({ allowMustMayOverlap: false })

        expect(() => {
            parser.parseSchema<LDAPObjectClassInterface>(schemaWithOverlap)
        }).toThrow('Attributes cannot appear in both MUST and MAY: description')
    })

    /**
     * Test: Permissive mode should allow MUST/MAY overlap
     */
    it('should allow MUST/MAY overlap when allowMustMayOverlap is true', () => {
        const parser = new RFC4512Parser({ allowMustMayOverlap: true })

        expect(() => {
            parser.parseSchema<LDAPObjectClassInterface>(schemaWithOverlap)
        }).not.toThrow()

        const result = parser.parseSchema<LDAPObjectClassInterface>(schemaWithOverlap)
        expect(result).toBeDefined()
        expect(result.type).toBe('objectClass')
        expect(result.must).toContain('description')
        expect(result.may).toContain('description')
    })

    /**
     * Test: Combination with relaxedMode option
     */
    it('should work with both allowMustMayOverlap and relaxedMode options', () => {
        const parser = new RFC4512Parser({
            allowMustMayOverlap: true,
            relaxedMode: true
        })

        const result = parser.parseSchema<LDAPObjectClassInterface>(schemaWithOverlap)
        expect(result).toBeDefined()
        expect(result.name).toBe('ipProtocol')
        expect(result.must).toEqual(['cn', 'ipProtocolNumber', 'description'])
        expect(result.may).toEqual(['description'])
    })

    /**
     * Test: Multiple overlapping attributes
     */
    it('should handle multiple overlapping attributes', () => {
        const schemaWithMultipleOverlap = `
      ( 1.2.3.4.5 NAME 'testClass' DESC 'Test class with multiple overlaps'
        SUP top STRUCTURAL
        MUST ( cn $ attr1 $ attr2 )
        MAY ( attr1 $ attr2 $ attr3 ) )
    `

        const strictParser = new RFC4512Parser({ allowMustMayOverlap: false })
        expect(() => {
            strictParser.parseSchema<LDAPObjectClassInterface>(schemaWithMultipleOverlap)
        }).toThrow('Attributes cannot appear in both MUST and MAY: attr1, attr2')

        const permissiveParser = new RFC4512Parser({ allowMustMayOverlap: true })
        const result = permissiveParser.parseSchema<LDAPObjectClassInterface>(schemaWithMultipleOverlap)
        expect(result.must).toEqual(['cn', 'attr1', 'attr2'])
        expect(result.may).toEqual(['attr1', 'attr2', 'attr3'])
    })

    /**
     * Test: Schema validation with overlap allowed
     */
    it('should validate schema correctly when overlap is allowed', () => {
        const parser = new RFC4512Parser({ allowMustMayOverlap: true })

        const isValid = parser.isValidSchema(schemaWithOverlap)
        expect(isValid).toBe(true)
    })
})
