# RFC 4512 LDAP Schema Parser

[![CI](https://github.com/The-Software-Compagny/parser_ldap_rfc4512/actions/workflows/ci.yml/badge.svg)](https://github.com/The-Software-Compagny/parser_ldap_rfc4512/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/The-Software-Compagny/parser_ldap_rfc4512/branch/main/graph/badge.svg)](https://codecov.io/gh/The-Software-Compagny/parser_ldap_rfc4512)
[![npm version](https://badge.fury.io/js/@the-software-compagny%2Fparser_ldap_rfc4512.svg)](https://badge.fury.io/js/@the-software-compagny%2Fparser_ldap_rfc4512)

A TypeScript parser for LDAP schema definitions based on RFC 4512, using PEG.js grammar.

## Overview

This project provides a parser for LDAP (Lightweight Directory Access Protocol) schema definitions according to RFC 4512. It can parse object class and attribute type definitions with their various components such as OID, NAME, DESC, SUP, MUST, MAY, and object class types (STRUCTURAL, AUXILIARY, ABSTRACT).

## Features

- **RFC 4512 Compliance**: Follows the official LDAP schema definition format
- **PEG.js Grammar**: Uses a robust parsing expression grammar for accurate parsing
- **TypeScript Support**: Written in TypeScript with proper type definitions
- **Object Class Parsing**: Supports STRUCTURAL, AUXILIARY, and ABSTRACT object classes
- **Attribute Lists**: Handles both required (MUST) and optional (MAY) attribute lists
- **Multiple Names**: Supports single and multiple NAME definitions

## Installation

To install dependencies:

```bash
bun install
```

## Usage

### As a Library

```typescript
import { parseSchema } from '@the-software-compagny/parser_ldap_rfc4512'

const result = parseSchema(`
  ( 2.5.6.6
    NAME 'person'
    DESC 'RFC2256: a person'
    SUP top
    STRUCTURAL
    MUST ( sn $ cn )
    MAY ( userPassword $ telephoneNumber )
  )
`)

if (result.success) {
  console.log('Parsed schema:', result.data)
} else {
  console.error('Parse error:', result.error)
}
```

### As a CLI Tool

This package includes a command-line interface for parsing LDAP schema definitions.

#### Installation

```bash
# Install globally
npm install -g @the-software-compagny/parser_ldap_rfc4512

# Or use locally after building
bun run build
```

#### CLI Usage

```bash
# Parse from command line
rfc4512-parser "( 2.5.6.6 NAME 'person' SUP top STRUCTURAL )"

# Parse from file
rfc4512-parser --input schema.ldif

# Output as JSON
rfc4512-parser --input schema.ldif --format json

# Save to file
rfc4512-parser --input schema.ldif --output result.json

# Verbose mode
rfc4512-parser --input schema.ldif --verbose
```

[CLI Usage](CLI_USAGE.md) provides detailed instructions on how to use the command-line interface, including installation and examples.

### Example Schema Definition

The parser can handle LDAP schema definitions like this:

```ldap
( 2.5.6.6
  NAME 'person'
  DESC 'RFC2256: a person'
  SUP top
  STRUCTURAL
  MUST ( sn $ cn )
  MAY ( userPassword $ telephoneNumber )
)
```

This will be parsed into a structured object:

```javascript
{
  oid: '2.5.6.6',
  name: 'person',
  desc: 'RFC2256: a person',
  sup: 'top',
  type: 'STRUCTURAL',
  must: ['sn', 'cn'],
  may: ['userPassword', 'telephoneNumber']
}
```

## Project Structure

```bash
.
├── .vscode/                               # VS Code workspace settings and tasks configuration
├── dist/                                  # Build output directory containing compiled JavaScript files
├── src/                                   # Source code directory
│   ├── _grammars/                         # PEG.js grammar definitions for parsing RFC 4512
│   ├── errors/                            # Error handling classes, interfaces and enumerations
│   ├── functions/                         # Utility functions including the main schema parsing logic
│   ├── interfaces/                        # TypeScript interfaces for LDAP schema components
│   └── types/                             # TypeScript type definitions for LDAP structures
├── test/                                  # Test files and test data
└── [configuration files]                  # Various config files (.editorconfig, .eslintrc.js, etc.)
```

## Grammar Components

The PEG.js grammar supports the following LDAP schema components:

- **OID**: Numeric object identifier (e.g., `2.5.6.6`)
- **NAME**: Single or multiple names in quotes
- **DESC**: Description string
- **SUP**: Superior object class or attribute type
- **Object Class Types**: STRUCTURAL, AUXILIARY, or ABSTRACT
- **MUST**: Required attributes list
- **MAY**: Optional attributes list

## License

See [LICENSE](LICENSE) file for details.
