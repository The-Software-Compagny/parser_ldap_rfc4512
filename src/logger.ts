/**
 * Simplified logger module for RFC 4512 parser CLI
 *
 * This module provides a lightweight console-based logging system with emoji
 * indicators for better user experience. It replaces the previous pino-based
 * implementation to reduce dependencies and complexity.
 */

/**
 * Configuration interface for logger creation
 *
 * @interface LoggerConfig
 * @property {boolean} [verbose] - Enable verbose output (currently unused for simplicity)
 * @property {boolean} [pretty] - Enable pretty formatting (currently unused for simplicity)
 */
export interface LoggerConfig {
  verbose?: boolean
  pretty?: boolean
}

/**
 * Creates a logger instance with the specified configuration
 *
 * For simplicity, this function always returns the same logger instance
 * regardless of configuration. This maintains backward compatibility while
 * simplifying the implementation.
 *
 * @param {LoggerConfig} config - Logger configuration options
 * @returns {typeof logger} The logger instance
 */
export function createLogger(config: LoggerConfig = {}) {
  return logger
}

/**
 * Main logger instance with CLI-focused methods
 *
 * This logger provides specific methods for common CLI operations with
 * emoji indicators to enhance user experience. All methods use the standard
 * console API for maximum compatibility.
 */
export const logger = {
  /**
   * Logs a file reading operation
   *
   * Displays a message indicating that a file is being read, typically used
   * when the CLI loads schema definitions from input files.
   *
   * @param {string} filePath - The absolute or relative path to the file being read
   * @example
   * logger.readingFile('/path/to/schema.ldif')
   * // Output: 📖 Reading from file: /path/to/schema.ldif
   */
  readingFile: (filePath: string) => console.log(`📖 Reading from file: ${filePath}`),

  /**
   * Logs the start of a parsing operation
   *
   * Indicates that the parser is beginning to process a schema definition.
   * Used to provide feedback during potentially time-consuming operations.
   *
   * @example
   * logger.parsing()
   * // Output: 🔍 Parsing schema definition...
   */
  parsing: () => console.log('🔍 Parsing schema definition...'),

  /**
   * Displays the schema definition being parsed
   *
   * Shows the actual schema definition text to the user, typically in verbose mode.
   * Includes proper spacing for readability.
   *
   * @param {string} schema - The schema definition string to display
   * @example
   * logger.schemaDefinition('( 2.5.6.6 NAME "person" SUP top STRUCTURAL )')
   * // Output:
   * // 📄 Schema definition:
   * // ( 2.5.6.6 NAME "person" SUP top STRUCTURAL )
   * //
   */
  schemaDefinition: (schema: string) => {
    console.log('📄 Schema definition:')
    console.log(schema)
    console.log()
  },

  /**
   * Confirms successful file output operation
   *
   * Notifies the user that parsing results have been successfully written
   * to the specified output file.
   *
   * @param {string} outputPath - The path where results were saved
   * @example
   * logger.resultsSaved('/path/to/output.json')
   * // Output: 💾 Results saved to: /path/to/output.json
   */
  resultsSaved: (outputPath: string) => console.log(`💾 Results saved to: ${outputPath}`),

  /**
   * Logs error messages with optional additional data
   *
   * Displays error messages with an error emoji. Handles various types of
   * additional data including Error objects, objects with stack traces,
   * and arbitrary data objects.
   *
   * @param {string} message - The main error message
   * @param {Error | { stack?: string } | any} [errorOrData] - Optional error object or additional data
   * @example
   * logger.error('Parse failed')
   * // Output: ❌ Parse failed
   *
   * @example
   * logger.error('Unexpected error', new Error('Something went wrong'))
   * // Output:
   * // ❌ Unexpected error
   * //    Something went wrong
   *
   * @example
   * logger.error('Stack trace', { stack: 'Error: ...\n  at ...' })
   * // Output:
   * // ❌ Stack trace
   * //    Stack: Error: ...
   * //      at ...
   */
  error: (message: string, errorOrData?: Error | { stack?: string } | any) => {
    console.error(`❌ ${message}`)
    if (errorOrData) {
      if (errorOrData instanceof Error && errorOrData.message) {
        console.error(`   ${errorOrData.message}`)
      } else if (errorOrData.stack) {
        console.error(`   Stack: ${errorOrData.stack}`)
      } else if (typeof errorOrData === 'object') {
        console.error('   Data:', errorOrData)
      }
    }
  }
}
