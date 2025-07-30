# RFC 4512 LDAP Schema Parser

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

To run the example:

```bash
bun run index.ts
```

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

```
src/
├── index.ts              # Main parser implementation
└── grammar/
    └── rfc4512.pegjs     # PEG.js grammar definition
test/
├── sample-olcAttributeTypes.ldif    # Sample attribute type definitions
└── sample-olcObjectClasses.ldif     # Sample object class definitions
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

## Development

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## License

See [LICENSE](LICENSE) file for details.
