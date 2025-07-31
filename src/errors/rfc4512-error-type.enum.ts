/**
 * Enumeration of error types that can occur during RFC4512 LDAP schema parsing.
 *
 * RFC4512 defines the LDAP Directory Information Models, including the syntax
 * and semantics of LDAP schema definitions for attribute types and object classes.
 * This enum categorizes the various types of parsing and validation errors that
 * may occur when processing LDAP schema definitions according to RFC4512 standards.
 */
export enum RFC4512ErrorType {
  /**
   * Syntax error in the schema definition.
   * Occurs when the schema definition does not conform to the expected
   * RFC4512 syntax rules, such as malformed parentheses, missing quotes,
   * or invalid character sequences.
   */
  SYNTAX_ERROR = 'SYNTAX_ERROR',

  /**
   * Grammar parsing error.
   * Indicates that the PEG.js grammar parser failed to parse the schema
   * definition, typically due to structural issues in the schema text
   * that violate the RFC4512 grammar rules.
   */
  GRAMMAR_ERROR = 'GRAMMAR_ERROR',

  /**
   * Missing required field error.
   * Occurs when a mandatory field or attribute in an RFC4512 schema
   * definition is absent, such as missing OID in an attribute type
   * or object class definition.
   */
  MISSING_FIELD = 'MISSING_FIELD',

  /**
   * Invalid field value error.
   * Indicates that a field contains a value that does not meet the
   * RFC4512 specification requirements, such as invalid syntax values
   * or unsupported matching rule references.
   */
  INVALID_FIELD = 'INVALID_FIELD',

  /**
   * Invalid Object Identifier (OID) format error.
   * Occurs when an OID does not conform to the dotted decimal notation
   * specified in RFC4512, such as "1.2.3.4" format violations or
   * non-numeric components in the OID string.
   */
  INVALID_OID = 'INVALID_OID',

  /**
   * Invalid name format error.
   * Indicates that an attribute type or object class name does not
   * conform to RFC4512 naming conventions, such as containing invalid
   * characters or not following the proper case-insensitive format.
   */
  INVALID_NAME = 'INVALID_NAME',

  /**
   * Schema validation error.
   * General validation error that occurs when the parsed schema
   * definition fails semantic validation checks beyond basic syntax,
   * such as referencing non-existent superior object classes.
   */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  /**
   * Empty or null input error.
   * Occurs when the parser receives null, undefined, or empty string
   * input where a valid RFC4512 schema definition is expected.
   */
  EMPTY_INPUT = 'EMPTY_INPUT',

  /**
   * Object class specific parsing error.
   * Indicates errors specific to parsing LDAP object class definitions,
   * such as invalid structural/auxiliary/abstract classifications or
   * malformed MUST/MAY attribute lists.
   */
  OBJECTCLASS_ERROR = 'OBJECTCLASS_ERROR',

  /**
   * Attribute type specific parsing error.
   * Indicates errors specific to parsing LDAP attribute type definitions,
   * such as invalid syntax references, malformed equality matching rules,
   * or incorrect usage specifications (userApplications, directoryOperation, etc.).
   */
  ATTRIBUTETYPE_ERROR = 'ATTRIBUTETYPE_ERROR',

  /**
   * Grammar file loading error.
   * Occurs when the PEG.js grammar file cannot be loaded or parsed,
   * typically indicating a configuration or file system issue rather
   * than a problem with the input schema definition.
   */
  GRAMMAR_LOAD_ERROR = 'GRAMMAR_LOAD_ERROR',

  /**
   * Unknown or unexpected error.
   * Catch-all error type for unexpected exceptions or errors that
   * don't fit into other specific categories. This typically indicates
   * an internal parser error or unforeseen edge case.
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
