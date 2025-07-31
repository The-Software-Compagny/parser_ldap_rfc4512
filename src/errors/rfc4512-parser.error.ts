import { RFC4512ErrorType } from './rfc4512-error-type.enum'
import type { RFC4512ParserErrorInterface } from './rfc4512-parser-error.interface'

/**
 * RFC4512 Parser Error Class
 *
 * A specialized error class for handling RFC4512 LDAP schema parsing failures.
 * This class extends the standard JavaScript Error with additional context
 * information specific to LDAP schema parsing operations.
 *
 * RFC4512 defines the LDAP Directory Information Models, and this error class
 * provides comprehensive error reporting for parsing failures including:
 * - Categorized error types for programmatic handling
 * - Position information for precise error location
 * - Original schema context for debugging
 * - Error chaining for underlying parser failures
 * - Serialization support for logging and reporting
 *
 * @example
 * ```typescript
 * try {
 *   parseSchema(schemaDefinition);
 * } catch (error) {
 *   if (error instanceof RFC4512ParserError) {
 *     console.log(`Error type: ${error.errorType}`)
 *     console.log(`Position: Line ${error.position?.line}, Column ${error.position?.column}`)
 *     console.log(error.getDetailedMessage())
 *   }
 * }
 * ```
 */
export class RFC4512ParserError extends Error {
  /**
   * The categorized type of parsing error that occurred.
   * Used for programmatic error handling and filtering specific error categories.
   * Maps to the RFC4512ErrorType enumeration for consistent error classification.
   */
  public readonly errorType: RFC4512ErrorType

  /**
   * The original LDAP schema definition string that failed to parse.
   * Preserved for debugging purposes, error reproduction, and context analysis.
   * Contains the complete schema text as provided to the parser.
   */
  public readonly schemaDefinition: string

  /**
   * Optional precise location information where the parsing error occurred.
   * Provides line, column, and character offset details to help developers
   * quickly identify the exact position of syntax or grammar errors in the schema.
   */
  public readonly position?: {
    /** Line number where the error occurred (1-based indexing) */
    line: number
    /** Column number where the error occurred (1-based indexing) */
    column: number
    /** Character offset from the beginning of the schema (0-based indexing) */
    offset: number
  }

  /**
   * Optional additional contextual information about the error.
   * May include surrounding text, parser state information, expected values,
   * or other diagnostic details that help understand the error condition.
   */
  public readonly context?: string

  /**
   * Optional reference to the underlying error that caused this parsing failure.
   * Used for error chaining when wrapping lower-level errors (e.g., from PEG.js)
   * while preserving the original error information for debugging.
   */
  public readonly cause?: Error

  /**
   * Creates a new RFC4512ParserError instance with detailed error information.
   *
   * @param message - Human-readable error message describing the parsing failure
   * @param errorType - Categorized error type from RFC4512ErrorType enumeration
   * @param schemaDefinition - The original schema definition that failed to parse
   * @param options - Optional additional error details
   * @param options.position - Precise location where the error occurred
   * @param options.context - Additional contextual information about the error
   * @param options.cause - The underlying error that triggered this parsing failure
   *
   * @example
   * ```typescript
   * const error = new RFC4512ParserError(
   *   'Invalid OID format',
   *   RFC4512ErrorType.INVALID_OID,
   *   'olcAttributeTypes: ( invalid.oid NAME "test" )',
   *   {
   *     position: { line: 1, column: 20, offset: 19 },
   *     context: 'Expected dotted decimal notation'
   *   }
   * );
   * ```
   */
  constructor(
    message: string,
    errorType: RFC4512ErrorType,
    schemaDefinition: string,
    options?: {
      position?: { line: number; column: number; offset: number }
      context?: string
      cause?: Error
    }
  ) {
    super(message)
    this.name = 'RFC4512ParserError'
    this.errorType = errorType
    this.schemaDefinition = schemaDefinition
    this.position = options?.position
    this.context = options?.context
    this.cause = options?.cause

    // Maintain proper stack trace for V8 (Chrome, Node.js)
    // This ensures the stack trace points to the actual error location
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RFC4512ParserError)
    }
  }

  /**
   * Generates a comprehensive error message with all available context information.
   *
   * This method creates a detailed, multi-line error message that includes:
   * - The error type and primary message
   * - Position information (line and column) if available
   * - Additional context details if provided
   * - A preview of the problematic schema definition
   * - Information about the underlying cause if present
   *
   * @returns A formatted, detailed error message suitable for logging or debugging
   *
   * @example
   * ```typescript
   * const error = new RFC4512ParserError(
   *   'Missing closing parenthesis',
   *   RFC4512ErrorType.SYNTAX_ERROR,
   *   'olcAttributeTypes: ( 1.2.3.4 NAME "test"',
   *   { position: { line: 1, column: 35, offset: 34 } }
   * );
   *
   * console.log(error.getDetailedMessage());
   * // Output:
   * // SYNTAX_ERROR: Missing closing parenthesis at line 1, column 35
   * // Schema: olcAttributeTypes: ( 1.2.3.4 NAME "test"
   * ```
   */
  public getDetailedMessage(): string {
    let message = `${this.errorType}: ${this.message}`

    if (this.position) {
      message += ` at line ${this.position.line}, column ${this.position.column}`
    }

    if (this.context) {
      message += `\nContext: ${this.context}`
    }

    if (this.schemaDefinition) {
      const preview = this.schemaDefinition.length > 100
        ? this.schemaDefinition.substring(0, 100) + '...'
        : this.schemaDefinition
      message += `\nSchema: ${preview}`
    }

    if (this.cause) {
      message += `\nCaused by: ${this.cause.message}`
    }

    return message
  }

  /**
   * Serializes the error instance to a JSON-compatible object.
   *
   * Converts the RFC4512ParserError instance to a plain object that conforms
   * to the RFC4512ParserErrorInterface. This is useful for:
   * - Logging error details in structured formats
   * - Transmitting error information over network APIs
   * - Storing error information in databases
   * - Creating error reports and analytics
   *
   * The serialized object includes all error properties, including nested
   * cause information if present. Stack traces are preserved for debugging.
   *
   * @returns A plain object representation of the error conforming to RFC4512ParserErrorInterface
   *
   * @example
   * ```typescript
   * const error = new RFC4512ParserError(
   *   'Invalid syntax',
   *   RFC4512ErrorType.SYNTAX_ERROR,
   *   'olcAttributeTypes: ( malformed )'
   * );
   *
   * const serialized = error.toJSON();
   * console.log(JSON.stringify(serialized, null, 2));
   * // Outputs structured JSON with all error details
   * ```
   */
  public toJSON(): RFC4512ParserErrorInterface {
    return {
      name: this.name,
      message: this.message,
      errorType: this.errorType,
      schemaDefinition: this.schemaDefinition,
      position: this.position,
      context: this.context,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : undefined
    }
  }

  /**
   * Creates an RFC4512ParserError instance from a generic JavaScript Error.
   *
   * This static factory method is useful for wrapping lower-level errors
   * (such as those from PEG.js grammar parsing) into RFC4512-specific
   * error instances while preserving the original error information.
   *
   * The original error is stored in the `cause` property, allowing for
   * proper error chaining and debugging of the complete error hierarchy.
   *
   * @param error - The original error to wrap
   * @param errorType - The RFC4512-specific error type to assign
   * @param schemaDefinition - The schema definition that was being parsed
   * @param options - Optional additional error context
   * @param options.position - Position information if available
   * @param options.context - Additional context about the error
   * @returns A new RFC4512ParserError instance wrapping the original error
   *
   * @example
   * ```typescript
   * try {
   *   // Some low-level parsing operation that throws a generic error
   *   pegParser.parse(schemaText);
   * } catch (originalError) {
   *   // Wrap it in an RFC4512-specific error
   *   const rfc4512Error = RFC4512ParserError.fromError(
   *     originalError,
   *     RFC4512ErrorType.GRAMMAR_ERROR,
   *     schemaText,
   *     { context: 'Failed during PEG.js grammar parsing' }
   *   );
   *   throw rfc4512Error;
   * }
   * ```
   */
  public static fromError(
    error: Error,
    errorType: RFC4512ErrorType,
    schemaDefinition: string,
    options?: {
      position?: { line: number; column: number; offset: number }
      context?: string
    }
  ): RFC4512ParserError {
    return new RFC4512ParserError(
      error.message,
      errorType,
      schemaDefinition,
      {
        ...options,
        cause: error
      }
    )
  }
}
