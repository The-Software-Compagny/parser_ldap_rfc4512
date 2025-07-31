# RFC 4512 LDAP Schema Parser CLI

Ce projet inclut maintenant une interface en ligne de commande (CLI) pour parser les définitions de schéma LDAP selon RFC 4512.

## Installation

### Installation globale (recommandée)

```bash
# Depuis le répertoire du projet
npm link
# ou
bun link

# Maintenant vous pouvez utiliser la commande rfc4512-parser partout
rfc4512-parser --help
```

### Utilisation locale

```bash
# Build du projet
bun run build

# Utilisation directe
node dist/cli.js --help
```

## Utilisation

### Exemples de base

```bash
# Parser une définition depuis la ligne de commande
rfc4512-parser "( 2.5.6.6 NAME 'person' DESC 'RFC2256: a person' SUP top STRUCTURAL MUST ( sn $ cn ) MAY ( userPassword $ telephoneNumber ) )"

# Parser depuis un fichier
rfc4512-parser --input schema.ldif

# Output en format JSON
rfc4512-parser --input schema.ldif --format json

# Sauvegarder le résultat dans un fichier
rfc4512-parser --input schema.ldif --output result.json

# Mode verbose pour plus de détails
rfc4512-parser --input schema.ldif --verbose
```

### Options disponibles

- `--input, -i` : Fichier d'entrée contenant la définition de schéma
- `--output, -o` : Fichier de sortie pour les résultats
- `--format, -f` : Format de sortie (`json` ou `pretty`)
- `--verbose, -v` : Sortie détaillée
- `--help` : Afficher l'aide

### Exemples avec les fichiers de test

```bash
# Parser un objectClass
rfc4512-parser --input test/samples/olcObjectClasses/person.ldif

# Parser un attributeType
rfc4512-parser --input test/samples/olcAttributeTypes/cn.ldif --format json

# Parser avec mode verbose
rfc4512-parser --input test/samples/olcObjectClasses/inetOrgPerson.ldif --verbose
```

### Codes de sortie

- `0` : Parsing réussi
- `1` : Erreur de parsing ou erreur d'exécution

### Format de sortie

#### Format "pretty" (par défaut)
Affichage formaté et lisible avec des emojis et une structure claire.

#### Format "json"
Sortie JSON structurée compatible avec d'autres outils.

## Intégration dans d'autres projets

Le CLI peut être utilisé dans des scripts bash, des pipelines CI/CD, ou d'autres outils :

```bash
#!/bin/bash

# Valider tous les fichiers de schéma dans un répertoire
for file in schemas/*.ldif; do
    echo "Validating $file..."
    if rfc4512-parser --input "$file" --format json > /dev/null; then
        echo "✅ $file is valid"
    else
        echo "❌ $file has errors"
        exit 1
    fi
done
```
