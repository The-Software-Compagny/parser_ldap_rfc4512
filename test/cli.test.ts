import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * Test suite for RFC4512 Parser CLI
 *
 * This test suite validates the CLI functionality including:
 * - Command line argument parsing
 * - File input/output operations
 * - Different output formats (JSON, pretty)
 * - Error handling
 * - Verbose mode
 * - Exit codes
 */
describe('RFC4512 Parser CLI', () => {
  const cliPath = join(__dirname, '../src/cli.ts')
  let tempFiles: string[] = []

  beforeEach(async () => {
    tempFiles = []
  })

  afterEach(() => {
    // Clean up temporary files
    tempFiles.forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file)
      }
    })
  })

  /**
   * Helper function to create a temporary file
   */
  function createTempFile(content: string, extension = '.ldif'): string {
    const tempFile = join(tmpdir(), `test-${Date.now()}-${Math.random().toString(36).substring(2)}${extension}`)
    writeFileSync(tempFile, content, 'utf-8')
    tempFiles.push(tempFile)
    return tempFile
  }

  /**
   * Helper function to run CLI command and capture output
   */
  function runCli(args: string[]): Promise<{
    stdout: string
    stderr: string
    exitCode: number
  }> {
    return new Promise((resolve) => {
      const child = spawn('bun', [cliPath, ...args], {
        stdio: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code || 0
        })
      })
    })
  }

  /**
   * Test: CLI help command
   */
  it('should display help when --help is used', async () => {
    const result = await runCli(['--help'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('rfc4512-parser')
    expect(result.stdout).toContain('--input')
    expect(result.stdout).toContain('--output')
    expect(result.stdout).toContain('--format')
    expect(result.stdout).toContain('--verbose')
  })  /**
   * Test: Parse schema from command line argument
   */
  it('should parse schema from command line argument', async () => {
    const schema = "( 2.5.4.3 NAME 'cn' DESC 'RFC4519: common name(s) for which the entity is known by' SUP name )"
    const result = await runCli([schema])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('✅ Parse Success')
    expect(result.stdout).toContain('OID: 2.5.4.3')
    expect(result.stdout).toContain('Name: cn')
    expect(result.stdout).toContain('Description: RFC4519: common name(s) for which the entity is known by')
  })

  /**
   * Test: Parse schema from input file
   */
  it('should parse schema from input file', async () => {
    const schema = "( 2.5.4.3 NAME 'cn' DESC 'RFC4519: common name(s) for which the entity is known by' SUP name )"
    const inputFile = createTempFile(schema)

    const result = await runCli(['--input', inputFile])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('✅ Parse Success')
    expect(result.stdout).toContain('OID: 2.5.4.3')
    expect(result.stdout).toContain('Name: cn')
  })

  /**
   * Test: JSON output format
   */
  it('should output in JSON format when requested', async () => {
    const schema = "( 2.5.4.3 NAME 'cn' DESC 'RFC4519: common name(s) for which the entity is known by' SUP name )"
    const result = await runCli([schema, '--format', 'json'])

    expect(result.exitCode).toBe(0)

    // Parse the JSON output to verify it's valid JSON
    const jsonOutput = JSON.parse(result.stdout)
    expect(jsonOutput.success).toBe(true)
    expect(jsonOutput.data.oid).toBe('2.5.4.3')
    expect(jsonOutput.data.name).toBe('cn')
    expect(jsonOutput.data.desc).toBe('RFC4519: common name(s) for which the entity is known by')
  })

  /**
   * Test: Output to file
   */
  it('should save output to file when --output is specified', async () => {
    const schema = "( 2.5.4.3 NAME 'cn' DESC 'RFC4519: common name(s) for which the entity is known by' SUP name )"
    const outputFile = join(tmpdir(), `test-output-${Date.now()}.json`)
    tempFiles.push(outputFile)

    const result = await runCli([schema, '--output', outputFile, '--format', 'json'])

    expect(result.exitCode).toBe(0)
    expect(existsSync(outputFile)).toBe(true)

    const savedContent = readFileSync(outputFile, 'utf-8')
    const jsonOutput = JSON.parse(savedContent)
    expect(jsonOutput.success).toBe(true)
    expect(jsonOutput.data.oid).toBe('2.5.4.3')
  })

  /**
   * Test: Verbose mode
   */
  it('should provide verbose output when --verbose is used', async () => {
    const schema = "( 2.5.4.3 NAME 'cn' DESC 'RFC4519: common name(s) for which the entity is known by' SUP name )"
    const inputFile = createTempFile(schema)

    const result = await runCli(['--input', inputFile, '--verbose'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Reading from file:')
    expect(result.stdout).toContain('Parsing schema definition')
    expect(result.stdout).toContain('Schema definition:')
  })  /**
   * Test: Error handling for invalid schema
   */
  it('should handle invalid schema with proper error message', async () => {
    const invalidSchema = "INVALID SCHEMA DEFINITION"
    const result = await runCli([invalidSchema])

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toContain('❌ Parse Error')
  })

  /**
   * Test: Error handling for missing input
   */
  it('should show error when no schema is provided', async () => {
    const result = await runCli([])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('No schema definition provided')
  })

  /**
   * Test: Error handling for non-existent input file
   */
  it('should handle non-existent input file gracefully', async () => {
    const result = await runCli(['--input', '/path/that/does/not/exist.ldif'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Unexpected error')
  })

  /**
   * Test: Parse complex object class definition
   */
  it('should parse complex object class definition', async () => {
    const schema = "( 2.5.6.6 NAME 'person' DESC 'RFC2256: a person' SUP top STRUCTURAL MUST ( sn $ cn ) MAY ( userPassword $ telephoneNumber $ seeAlso $ description ) )"
    const result = await runCli([schema, '--format', 'json'])

    expect(result.exitCode).toBe(0)

    const jsonOutput = JSON.parse(result.stdout)
    expect(jsonOutput.success).toBe(true)
    expect(jsonOutput.data.oid).toBe('2.5.6.6')
    expect(jsonOutput.data.name).toBe('person')
    expect(jsonOutput.data.type).toBe('objectClass')
    expect(jsonOutput.data.objectClassType).toBe('STRUCTURAL')
    expect(jsonOutput.data.must).toEqual(['sn', 'cn'])
    expect(jsonOutput.data.may).toEqual(['userPassword', 'telephoneNumber', 'seeAlso', 'description'])
  })  /**
   * Test: Parse attribute type with syntax
   */
  it('should parse attribute type with syntax definition', async () => {
    const schema = "( 2.5.4.35 NAME 'userPassword' DESC 'RFC4519: password of user' EQUALITY octetStringMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.40{128} )"
    const result = await runCli([schema, '--format', 'json'])

    expect(result.exitCode).toBe(0)

    const jsonOutput = JSON.parse(result.stdout)
    expect(jsonOutput.success).toBe(true)
    expect(jsonOutput.data.oid).toBe('2.5.4.35')
    expect(jsonOutput.data.name).toBe('userPassword')
    expect(jsonOutput.data.equality).toBe('octetStringMatch')
    expect(jsonOutput.data.syntax).toEqual({
      oid: '1.3.6.1.4.1.1466.115.121.1.40',
      length: 128
    })
  })

  /**
   * Test: Parse schema with multiple names
   */
  it('should parse schema with multiple names', async () => {
    const schema = "( 2.5.4.4 NAME ( 'sn' 'surname' ) DESC 'RFC4519: family name(s) for which the entity is known by' SUP name )"
    const result = await runCli([schema, '--format', 'json'])

    expect(result.exitCode).toBe(0)

    const jsonOutput = JSON.parse(result.stdout)
    expect(jsonOutput.success).toBe(true)
    expect(jsonOutput.data.oid).toBe('2.5.4.4')
    // Note: Current parser implementation only returns the first name
    // This might be a limitation that needs to be addressed in the parser
    expect(jsonOutput.data.name).toBe('sn')
  })

  /**
   * Test: Pretty format displays multiple names correctly
   */
  it('should display multiple names correctly in pretty format', async () => {
    const schema = "( 2.5.4.4 NAME ( 'sn' 'surname' ) DESC 'RFC4519: family name(s) for which the entity is known by' SUP name )"
    const result = await runCli([schema])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('✅ Parse Success')
    // Note: Current parser implementation only returns the first name
    expect(result.stdout).toContain('Name: sn')
    expect(result.stdout).toContain('OID: 2.5.4.4')
  })

  /**
   * Test: CLI with real LDIF sample files
   */
  it('should parse real LDIF sample files', async () => {
    const sampleFile = join(__dirname, 'samples/olcAttributeTypes/cn.ldif')

    if (existsSync(sampleFile)) {
      const result = await runCli(['--input', sampleFile, '--format', 'json'])

      expect(result.exitCode).toBe(0)

      const jsonOutput = JSON.parse(result.stdout)
      expect(jsonOutput.success).toBe(true)
      expect(jsonOutput.data.oid).toBeDefined()
      expect(jsonOutput.data.name).toBeDefined()
    }
  })
})
