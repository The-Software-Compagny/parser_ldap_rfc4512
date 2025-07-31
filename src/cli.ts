#!/usr/bin/env node

/**
 * CLI for RFC 4512 LDAP Parser
 *
 * This module provides a command-line interface for parsing LDAP schema definitions
 * compliant with RFC 4512. It supports reading from files or command-line arguments,
 * and can produce output in JSON format or formatted for human readability.
 *
 * @example
 * ```bash
 * # Parse a schema definition from command line
 * rfc4512-parser "( 2.5.6.6 NAME 'person' SUP top STRUCTURAL )"
 *
 * # Parse from a file with JSON output
 * rfc4512-parser --input schema.ldif --format json
 *
 * # Parse and save to a file
 * rfc4512-parser --input schema.ldif --output result.json
 * ```
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { readFileSync, writeFileSync } from 'node:fs'
import { parseSchema } from './functions'
import type { LDAPSchemaType } from './types'
import { RFC4512ParserError } from './interfaces'
import { logger } from './logger'

/**
 * Interface defining the available CLI options
 */
interface CliOptions {
  /** Path to the input file containing the schema definition */
  input?: string
  /** Path to the output file for results */
  output?: string
  /** Output format for results */
  format: 'json' | 'pretty'
  /** Enable verbose mode for more details */
  verbose: boolean
}

/**
 * Format the parsing result for display
 *
 * This function takes the parsing result and formats it according to the requested format.
 * It handles both success and error cases, and can produce structured JSON output
 * or formatted display for human readability.
 *
 * @param result - The parsing result (null in case of error)
 * @param error - The error message (null in case of success)
 * @param format - The desired output format ('json' or 'pretty')
 * @returns The formatted string ready to be displayed or saved
 */
function formatResult(result: LDAPSchemaType | null, error: string | null, format: 'json' | 'pretty'): string {
  // JSON format: simple structure with success/error and data
  if (format === 'json') {
    if (error) {
      return JSON.stringify({ success: false, error }, null, 2)
    }
    return JSON.stringify({ success: true, data: result }, null, 2)
  }

  // Pretty format: formatted display for human readability
  if (error) {
    return `❌ Parse Error: ${error}`
  }

  const data = result!
  let output = `✅ Parse Success\n\n`

  // Basic schema information
  output += `📋 Schema Information:\n`
  output += `  OID: ${data.oid}\n`

  // Schema names (can be a single name or an array)
  if (data.name) {
    if (Array.isArray(data.name)) {
      output += `  Names: ${data.name.join(', ')}\n`
    } else {
      output += `  Name: ${data.name}\n`
    }
  }

  // Optional description
  if (data.desc) {
    output += `  Description: ${data.desc}\n`
  }

  // Schema element type
  if (data.type) {
    output += `  Type: ${data.type}\n`
  }

  // Superior class(es) for object classes
  if ('superior' in data && data.superior) {
    output += `  Superior: ${Array.isArray(data.superior) ? data.superior.join(', ') : data.superior}\n`
  }

  // Required attributes (MUST) for object classes
  if ('must' in data && data.must && data.must.length > 0) {
    output += `  MUST: ${data.must.join(', ')}\n`
  }

  // Optional attributes (MAY) for object classes
  if ('may' in data && data.may && data.may.length > 0) {
    output += `  MAY: ${data.may.join(', ')}\n`
  }

  // Syntax for attribute types
  if ('syntax' in data && data.syntax) {
    output += `  Syntax: ${typeof data.syntax === 'object' ? JSON.stringify(data.syntax) : data.syntax}\n`
  }

  // Attribute usage
  if ('usage' in data && data.usage) {
    output += `  Usage: ${data.usage}\n`
  }

  // Matching rules
  if ('equality' in data && data.equality) {
    output += `  Equality: ${data.equality}\n`
  }

  if ('ordering' in data && data.ordering) {
    output += `  Ordering: ${data.ordering}\n`
  }

  if ('substring' in data && data.substring) {
    output += `  Substring: ${data.substring}\n`
  }

  return output
}

/**
 * Main CLI function
 *
 * This function configures and executes the command-line interface for the RFC 4512 parser.
 * It handles option configuration with yargs, reading schema definitions from various sources
 * (arguments or files), the actual parsing, and outputting results in the requested format.
 *
 * The function also handles parsing errors and provides detailed error messages in verbose mode.
 * It returns an appropriate exit code: 0 for success, 1 for error.
 */
async function main() {
  // Configure yargs for command-line argument handling
  const argv = await yargs(hideBin(process.argv))
    .scriptName('rfc4512-parser')
    .usage('$0 [options] [schema-definition]')
    .command(
      '$0 [schema]',
      'Parse an LDAP RFC 4512 schema definition',
      (yargs) => {
        return yargs.positional('schema', {
          describe: 'Schema definition to parse (can also be provided via --input)',
          type: 'string'
        })
      }
    )
    .option('input', {
      alias: 'i',
      describe: 'Input file containing schema definition',
      type: 'string'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output file for results',
      type: 'string'
    })
    .option('format', {
      alias: 'f',
      describe: 'Output format',
      choices: ['json', 'pretty'] as const,
      default: 'pretty' as const
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Verbose output',
      type: 'boolean',
      default: false
    })
    .example('$0 "( 2.5.6.6 NAME \'person\' SUP top STRUCTURAL )"', 'Parse a schema definition from command line')
    .example('$0 --input schema.ldif --format json', 'Parse from file and output as JSON')
    .example('$0 --input schema.ldif --output result.json', 'Parse from file and save to output file')
    .help()
    .argv

  const options = argv as CliOptions & { schema?: string }

  try {
    let schemaDefinition: string

    // Get schema definition from various sources
    if (options.schema) {
      // Source 1: Positional argument from command line
      schemaDefinition = options.schema
    } else if (options.input) {
      // Source 2: File specified by --input option
      if (options.verbose) {
        logger.readingFile(options.input)
      }
      schemaDefinition = readFileSync(options.input, 'utf-8')
    } else {
      // No source provided: display error
      logger.error('No schema definition provided. Use positional argument or --input option.')
      process.exit(1)
    }

    // Verbose mode logging
    if (options.verbose) {
      logger.parsing()
      logger.schemaDefinition(schemaDefinition.trim())
    }

    // Parse the schema with error handling
    let result: LDAPSchemaType | null = null
    let parseError: string | null = null

    try {
      result = parseSchema(schemaDefinition.trim())
    } catch (error) {
      // Specific handling for RFC4512ParserError with detailed messages
      if (error instanceof RFC4512ParserError) {
        parseError = error.getDetailedMessage()
      } else {
        parseError = error instanceof Error ? error.message : 'Unknown parse error'
      }
      if (options.verbose) {
        logger.error('Parse failed', error instanceof Error ? error : new Error(String(error)))
      }
    }

    // Format the result according to the requested format
    const formattedResult = formatResult(result, parseError, options.format)

    // Output the result (file or console)
    if (options.output) {
      // Save to file
      writeFileSync(options.output, formattedResult, 'utf-8')
      if (options.verbose) {
        logger.resultsSaved(options.output)
      }
    } else {
      // Display on console
      console.log(formattedResult)
    }

    // Exit code: 0 if success, 1 if parsing error
    process.exit(result ? 0 : 1)

  } catch (error) {
    // Handle unexpected errors
    logger.error('Unexpected error', error instanceof Error ? error : new Error('Unknown error'))
    if (options.verbose && error instanceof Error && error.stack) {
      logger.error('Stack trace', { stack: error.stack })
    }
    process.exit(1)
  }
}

// Handle unhandled promise rejections
// This allows capturing asynchronous errors that haven't been handled
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)))
  process.exit(1)
})

// Handle uncaught exceptions
// This allows capturing synchronous errors that haven't been handled
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

// Main entry point: execute CLI only if this file is called directly
// (not when imported as a module)
if (require.main === module) {
  main()
}
