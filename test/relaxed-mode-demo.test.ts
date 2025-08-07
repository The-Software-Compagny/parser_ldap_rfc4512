import { describe, it, expect } from 'bun:test'
import { RFC4512Parser, type LDAPAttributeTypeInterface } from '../src'

/**
 * Test suite for RFC4512Parser - Relaxed Mode Feature Demonstration
 *
 * This test suite demonstrates the practical usage of the relaxed mode
 * feature that enables parsing of OpenLDAP configuration schemas with
 * non-standard OID formats.
 */
describe('RFC4512Parser - Relaxed Mode Feature Demo', () => {
    describe('Standard RFC 4512 Schemas', () => {
        const standardSchema = `
      ( 2.5.4.3
        NAME 'cn'
        DESC 'Common Name'
        EQUALITY caseIgnoreMatch
        SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
        SINGLE-VALUE
      )
    `

        it('should parse standard schemas in both strict and relaxed modes', () => {
            const strictParser = new RFC4512Parser({ relaxedMode: false })
            const relaxedParser = new RFC4512Parser({ relaxedMode: true })

            const strictResult = strictParser.parseSchema<LDAPAttributeTypeInterface>(standardSchema)
            const relaxedResult = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(standardSchema)

            expect(strictResult.oid).toBe('2.5.4.3')
            expect(relaxedResult.oid).toBe('2.5.4.3')
            expect(strictResult.name).toBe(relaxedResult.name)
        })
    })

    describe('OpenLDAP Configuration Schemas', () => {
        const openldapSchema = `
      ( OLcfgOvAt:18.1
        NAME 'olcMemberOfDangling'
        DESC 'Behavior with respect to dangling members'
        SYNTAX OMsDirectoryString
        SINGLE-VALUE
      )
    `

        it('should reject OpenLDAP schemas in strict mode', () => {
            const strictParser = new RFC4512Parser({ relaxedMode: false })

            expect(() => {
                strictParser.parseSchema(openldapSchema)
            }).toThrow('OpenLDAP configuration OIDs are not supported in strict RFC 4512 mode')
        })

        it('should accept OpenLDAP schemas in relaxed mode', () => {
            const relaxedParser = new RFC4512Parser({ relaxedMode: true })

            expect(() => {
                relaxedParser.parseSchema<LDAPAttributeTypeInterface>(openldapSchema)
            }).not.toThrow()

            const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(openldapSchema)
            expect(result.oid).toBe('OLcfgOvAt:18.1')
            expect(result.name).toBe('olcMemberOfDangling')
            expect(result.syntax?.oid).toBe('OMsDirectoryString')
        })
    })

    describe('Multiple OpenLDAP OID Types', () => {
        const testCases = [
            {
                name: 'Overlay Attribute Type',
                oid: 'OLcfgOvAt:18.1',
                schema: `( OLcfgOvAt:18.1 NAME 'testOverlayAttr' DESC 'Test overlay attribute' SYNTAX OMsDirectoryString )`
            },
            {
                name: 'Database Attribute Type',
                oid: 'OLcfgDbAt:2.3',
                schema: `( OLcfgDbAt:2.3 NAME 'testDatabaseAttr' DESC 'Test database attribute' SYNTAX OMsInteger )`
            },
            {
                name: 'Global Attribute Type',
                oid: 'OLcfgGlAt:1.4',
                schema: `( OLcfgGlAt:1.4 NAME 'testGlobalAttr' DESC 'Test global attribute' SYNTAX OMsBoolean )`
            }
        ]

        testCases.forEach(({ name, oid, schema }) => {
            it(`should parse ${name} in relaxed mode`, () => {
                const relaxedParser = new RFC4512Parser({ relaxedMode: true })

                const result = relaxedParser.parseSchema<LDAPAttributeTypeInterface>(schema)
                expect(result.oid).toBe(oid)
                expect(result.type).toBe('attributeType')
            })
        })
    })

    describe('Parser Options', () => {
        it('should have correct default options', () => {
            const defaultParser = new RFC4512Parser()
            expect(defaultParser.options.relaxedMode).toBe(false)
        })

        it('should respect explicit options', () => {
            const strictParser = new RFC4512Parser({ relaxedMode: false })
            const relaxedParser = new RFC4512Parser({ relaxedMode: true })

            expect(strictParser.options.relaxedMode).toBe(false)
            expect(relaxedParser.options.relaxedMode).toBe(true)
        })
    })
})
