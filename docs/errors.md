# Códigos de error

Los códigos son **del validador**, no códigos normativos UBL. Cada issue incluye `stage`, `source` y `severity`.

## Parse / detección

| Código | Descripción |
|--------|-------------|
| `XML_PARSE` | XML mal formado |
| `JSON_PARSE` | JSON inválido |
| `UNSUPPORTED` | Tipo o formato no soportado |

## IND (OASIS)

| Código | Stage | Descripción |
|--------|-------|-------------|
| `IND2_ENCODING_REQUIRED` | ind | Falta `encoding` en declaración XML |
| `IND3_ENCODING_SHOULD_UTF8` | ind | Encoding distinto de UTF-8 (warning) |
| `IND5_EMPTY_ELEMENT` | ind | Elemento vacío no permitido |
| `IND7_DUPLICATE_LANGUAGE_ID` | ind | `languageID` duplicado entre hermanos |
| `IND8_MISSING_LANGUAGE_ID` | ind | Falta `languageID` en hermanos Text |

## Perfil

| Código | Stage | Descripción |
|--------|-------|-------------|
| `PROFILE_ARTIFACTS_MISSING` | profile | XSD/Schematron del perfil no instalados |
| `PROFILE_SCHEMATRON` | profile | Regla Schematron fallida |
| `PROFILE_XSD` | profile | Validación XSD de extensión fallida |
| `PROFILE_UNKNOWN` | profile | ID de perfil desconocido |

Sources habituales: `dian-schematron`, `peppol-schematron`, `dian-xsd`, `profile`.

## Crypto (opt-in)

| Código | Stage | Descripción |
|--------|-------|-------------|
| `CRYPTO_MODULE_UNAVAILABLE` | crypto | Módulo no cargado |
| `CRYPTO_NOTHING_TO_VERIFY` | crypto | Sin datos criptográficos (warning) |
| `CRYPTO_SKIPPED_NO_DIAN` | crypto | Perfil DIAN sin `DianExtensions` (warning) |
| `CUFE_MISMATCH` | crypto | CUFE no coincide |
| `SOFTWARE_SECURITY_MISMATCH` | crypto | `SoftwareSecurityCode` incorrecto |

## Motor XSD / JSON Schema

Errores del motor (`xml-xsd-engine`, Ajv) conservan reglas como `cvc-*` o keywords JSON Schema (`required`, `type`, etc.) con `stage: "schema"`.
