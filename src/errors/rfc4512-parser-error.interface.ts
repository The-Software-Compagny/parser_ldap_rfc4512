import type { RFC4512ErrorType } from './rfc4512-error-type.enum'

/**
 * Interface representing an RFC4512 parser error with detailed context information.
 *
 * This interface provides a structured representation of errors that occur during
 * the parsing and validation of LDAP schema definitions according to RFC4512.
 * It includes comprehensive error details, position information, and context
 * to help developers identify and resolve schema parsing issues.
 *
 * This interface is primarily used for error serialization and detailed
 * error reporting in RFC4512 schema parsing operations.
 */
export interface RFC4512ParserErrorInterface {
  /**
   * The name/type identifier of the error.
   * Typically matches the class name (e.g., "RFC4512ParserError")
   * and provides a quick way to identify the error category.
   */
  name: string

  /**
   * Human-readable error message describing what went wrong.
   * Contains specific details about the parsing failure, including
   * references to the problematic schema elements when applicable.
   */
  message: string

  /**
   * Categorized error type from the RFC4512ErrorType enumeration.
   * Allows programmatic handling of different error categories
   * such as syntax errors, validation errors, or grammar parsing failures.
   */
  errorType: RFC4512ErrorType

  /**
   * The original LDAP schema definition string that caused the error.
   * Provides the complete context of the schema being parsed when
   * the error occurred, useful for debugging and error reproduction.
   */
  schemaDefinition: string

  /**
   * Optional position information indicating where the error occurred in the schema.
   * Provides precise location details to help pinpoint the exact source of the error.
   */
  position?: {
    /** Line number where the error occurred (1-based indexing) */
    line: number

    /** Column number where the error occurred (1-based indexing) */
    column: number

    /** Character offset from the beginning of the schema string (0-based indexing) */
    offset: number
  }

  /**
   * Optional additional context information about the error.
   * May include surrounding text, parsing state information,
   * or other relevant details that help understand the error condition.
   */
  context?: string

  /**
   * Optional stack trace showing the call hierarchy when the error occurred.
   * Useful for debugging internal parser issues and understanding
   * the execution flow that led to the error.
   */
  stack?: string

  /**
   * Optional information about the underlying cause of the error.
   * When the RFC4512 parser error is wrapping another error (e.g., from PEG.js),
   * this property contains details about the original error that triggered
   * the RFC4512 parsing failure.
   */
  cause?: {
    /** Name/type of the underlying error that caused this RFC4512 error */
    name: string

    /** Message from the underlying error */
    message: string

    /** Optional stack trace from the underlying error */
    stack?: string
  }
}
