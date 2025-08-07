/**
 * RFC 4512 LDAP Schema Parser Grammar
 *
 * This PEG.js grammar parses LDAP schema definitions according to RFC 4512.
 * It handles both object class and attribute type definitions with their various
 * components like OID, NAME, DESC, SUP, MUST, MAY, EQUALITY, SYNTAX, etc.
 */

// Entry point - parses either an AttributeType or ObjectClass definition
start
  = attributeTypeDefinition / objectClassDefinition

// ObjectClass definition
// Format: ( <oid> NAME <name> DESC <desc> SUP <sup> STRUCTURAL|AUXILIARY|ABSTRACT MUST <attrs> MAY <attrs> )
objectClassDefinition
  = _ "(" _ oid:oid _ name:name _ desc:desc? _ sup:sup? _ kind:kind? _ must:must? _ may:may? _ extensions:extension* _ ")" _ {
    const extensionsObj = extensions.length > 0 ? Object.fromEntries(extensions) : undefined;
    return {
      type: 'objectClass',
      oid,
      name,
      desc,
      sup,
      objectClassType: kind,
      must,
      may,
      extensions: extensionsObj
    };
  }

// AttributeType definition
// Format: ( <oid> NAME <name> DESC <desc> EQUALITY <equality> SYNTAX <syntax> SINGLE-VALUE? )
attributeTypeDefinition
  = _ "(" _ oid:oid _ name:name _ desc:desc? _ sup:attributeSup? _ equality:equality? _ ordering:ordering? _ substr:substr? _ syntax:syntax? _ singleValue:singleValue? _ collective:collective? _ noUserModification:noUserModification? _ usage:usage? _ extensions:extension* _ ")" _ {
    const extensionsObj = extensions.length > 0 ? Object.fromEntries(extensions) : undefined;
    return {
      type: 'attributeType',
      oid,
      name,
      desc,
      sup,
      equality,
      ordering,
      substr,
      syntax,
      singleValue: singleValue !== null && singleValue !== undefined ? singleValue : false,
      collective,
      noUserModification,
      usage,
      extensions: extensionsObj
    };
  }

// Numeric OID (Object Identifier) - e.g., 2.5.6.6
// Also accepts OpenLDAP configuration OIDs like OLcfgOvAt:18.1 (validation happens in parser)
oid
  = openldapOid / numericOid

// Standard RFC 4512 numeric OID
numericOid
  = digits:[0-9.]+ { return digits.join(""); }

// OpenLDAP configuration OID
// Examples: OLcfgOvAt:18.1, OLcfgDbAt:2.3, OLcfgGlAt:1.4
openldapOid
  = prefix:("OLcfgOvAt" / "OLcfgDbAt" / "OLcfgGlAt" / "OLcfgOvOc" / "OLcfgDbOc" / "OLcfgGlOc") ":" suffix:[0-9.]+ {
      return prefix + ":" + suffix.join("");
    }

// NAME field - can be a single quoted string or multiple quoted strings in parentheses
// Examples: NAME 'person' or NAME ( 'alias1' 'alias2' )
name
  = _ "NAME" _ val:(quotedString / multiQuotedStrings) {
      return Array.isArray(val) ? val[0] : val;
  }

// DESC field - description as a quoted string
// Example: DESC 'RFC2256: a person'
desc
  = _ "DESC" _ str:quotedString { return str; }

// SUP field for ObjectClass - superior object class
// Example: SUP top
sup
  = _ "SUP" _ val:word { return val; }

// SUP field for AttributeType - superior attribute type
attributeSup
  = _ "SUP" _ val:word { return val; }

// Object class kind - one of STRUCTURAL, AUXILIARY, or ABSTRACT
kind
  = _ val:("STRUCTURAL" / "AUXILIARY" / "ABSTRACT") { return val; }

// MUST field - required attributes list
// Example: MUST ( cn $ sn $ objectClass )
must
  = _ "MUST" _ val:attrList { return val; }

// MAY field - optional attributes list
// Example: MAY ( description $ telephoneNumber )
may
  = _ "MAY" _ val:attrList { return val; }

// EQUALITY field - equality matching rule
// Example: EQUALITY caseIgnoreMatch
equality
  = _ "EQUALITY" _ val:word { return val; }

// ORDERING field - ordering matching rule
// Example: ORDERING caseIgnoreOrderingMatch
ordering
  = _ "ORDERING" _ val:word { return val; }

// SUBSTR field - substring matching rule
// Example: SUBSTR caseIgnoreSubstringsMatch
substr
  = _ "SUBSTR" _ val:word { return val; }

// SYNTAX field - syntax OID with optional length
// Example: SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{256}
syntax
  = _ "SYNTAX" _ val:syntaxValue { return val; }

syntaxValue
  = oid:(oid / openldapSyntaxName) length:("{" [0-9]+ "}")? {
    return {
      oid,
      length: length ? parseInt(length[1].join("")) : undefined
    };
  }

// OpenLDAP syntax names (in addition to standard OIDs)
openldapSyntaxName
  = "OMsDirectoryString" / "OMsInteger" / "OMsOctetString" / "OMsBoolean" / [a-zA-Z][a-zA-Z0-9_-]*

// SINGLE-VALUE - indicates single value attribute
singleValue
  = _ "SINGLE-VALUE" { return true; }

// COLLECTIVE - indicates collective attribute
collective
  = _ "COLLECTIVE" { return true; }

// NO-USER-MODIFICATION - indicates system-only attribute
noUserModification
  = _ "NO-USER-MODIFICATION" { return true; }

// USAGE field - attribute usage
// Example: USAGE userApplications
usage
  = _ "USAGE" _ val:("userApplications" / "directoryOperation" / "distributedOperation" / "dSAOperation") {
    return val;
  }

// Attribute list - can be with or without parentheses
// Examples: ( a $ b $ c ) or just a single attribute
attrList
  = "(" _ items:wordList _ ")" { return items; }
  / wordList

// Word list separated by $ (dollar sign)
// Example: cn $ sn $ objectClass
wordList
  = head:word tail:(_ "$" _ word)* {
      return [head, ...tail.map(t => t[3])];
  }

// Quoted string - single-quoted content
// Example: 'RFC2256: a person'
quotedString
  = "'" chars:quotedChar* "'" { return chars.join(""); }

// Characters allowed inside quoted strings (excluding quotes and newlines)
quotedChar
  = !("'" / "\n" / "\r") . { return text(); }

// Multiple quoted strings in parentheses
// Example: ( 'alias1' 'alias2' )
multiQuotedStrings
  = "(" _ head:quotedString tail:(_ quotedString)* _ ")" {
    return [head, ...tail.map(t => t[1])];
  }

// Simple word - alphanumeric characters, underscores, and hyphens
// Used for attribute names, object class names, etc.
word
  = chars:[a-zA-Z0-9_-]+ { return chars.join(""); }

// X-* extension support
// Format: X-EXTENSION-NAME 'value' or X-EXTENSION-NAME value
extension
  = _ key:extensionKey _ value:extensionValue { return [key, value]; }

// Extension key must start with X- followed by alphanumeric and hyphens
extensionKey
  = "X-" chars:[A-Z0-9-]+ { return "X-" + chars.join(""); }

// Extension value can be quoted string or simple word
extensionValue
  = quotedString / word

// Whitespace - spaces, tabs, carriage returns, and newlines
_ "whitespace"
  = [ \t\r\n]*
