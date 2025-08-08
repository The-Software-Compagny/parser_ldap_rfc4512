/**
 * Configuration options for RFC4512Parser
 */
export interface RFC4512ParserOptions {
  /**
   * Enable relaxed parsing mode to support OpenLDAP-specific OID formats
   *
   * When enabled, the parser will accept OpenLDAP configuration OIDs like:
   * - OLcfgOvAt:18.1 (overlay attribute types)
   * - OLcfgDbAt:1.2 (database attribute types)
   * - OLcfgGlAt:3.4 (global attribute types)
   *
   * These formats are not compliant with RFC 4512 but are commonly used
   * in OpenLDAP cn=config schemas.
   *
   * @default false - strict RFC 4512 compliance
   */
  relaxedMode?: boolean

  /**
   * Allow attributes to appear in both MUST and MAY lists
   *
   * When enabled, the parser will not throw an error if the same attribute
   * appears in both MUST and MAY lists. This is useful for legacy schemas
   * or specific schema definitions that may have this pattern.
   *
   * Note: This violates RFC 4512 Section 4.1.1 which states that MUST and MAY
   * attributes must be mutually exclusive.
   *
   * @default false - enforce RFC 4512 compliance (MUST and MAY are mutually exclusive)
   */
  allowMustMayOverlap?: boolean
}
