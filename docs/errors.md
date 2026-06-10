# Códigos de error y avisos

Los códigos son **del validador** (`@prodaric/ubl-validator`), no códigos normativos UBL. Constantes públicas en `ErrorCodes` (`src/errors/codes.ts`).

Cada issue incluye:

| Campo | Uso |
|-------|-----|
| `rule` | Identificador estable (p. ej. `IND5_EMPTY_ELEMENT`) |
| `code` | Igual que `rule` en issues propios; motor XSD/Ajv usa su propio valor |
| `message` | Texto legible |
| `severity` | `error` (invalida) o `warning` |
| `stage` | Etapa del pipeline |
| `source` | Subsistema (`oasis-ind5`, `dian-schematron`, `ajv`, …) |
| `path` | Ruta lógica o XPath simplificado |

`result.valid === false` solo cuando hay al menos un issue con `severity: "error"`.

## Parse y detección

| Código | Stage | Descripción |
|--------|-------|-------------|
| `DETECT` | parse | Fallo al detectar tipo o formato |
| `XML_PARSE` | parse | XML mal formado (motor XSD) |
| `JSON_PARSE` | schema | JSON inválido |
| `UNSUPPORTED` | parse | Tipo o formato no soportado |

## Schema (IND1)

Errores del motor **no unificados** en un solo código:

- **XML:** prefijos `cvc-*` (W3C XSD), mapeados desde `xml-xsd-engine`
- **JSON:** keywords Ajv (`required`, `type`, `additionalProperties`, …)

Siempre `stage: "schema"`.

## IND (OASIS, XML)

| Código | Severidad | Descripción |
|--------|-----------|-------------|
| `IND2_ENCODING_REQUIRED` | error | Falta `encoding` en `<?xml …?>` |
| `IND3_ENCODING_SHOULD_UTF8` | warning | Encoding distinto de UTF-8 |
| `IND5_EMPTY_ELEMENT` | error | Elemento vacío (`<tag/>` o `<tag></tag>`) |
| `IND7_DUPLICATE_LANGUAGE_ID` | error | `languageID` duplicado entre hermanos Text |
| `IND8_MISSING_LANGUAGE_ID` | error | Hermanos Text sin `languageID` cuando hay >1 |

## Perfil

| Código | Severidad | Descripción |
|--------|-----------|-------------|
| `PROFILE_UNKNOWN` | error | ID de perfil inexistente en registry |
| `PROFILE_ARTIFACTS_MISSING` | error | XSD/Schematron no instalados |
| `PROFILE_SCHEMATRON` | error / warning | Regla Schematron fallida |
| `PROFILE_XSD` | error | Validación XSD extensión (reservado; **pendiente**) |
| `PROFILE_DOCUMENT_TYPE` | warning | Perfil no definido para ese `documentType` |
| `PROFILE_JSON` | warning | Perfil detectado en JSON; Schematron solo XML |

Sources habituales: `dian-schematron`, `peppol-schematron`, `dian-xsd`, `profile`.

## Codelist (opt-in, stub)

| Código | Severidad | Descripción |
|--------|-----------|-------------|
| `CODELIST_SKIPPED` | warning | XSLT DefaultDTQ no encontrado |
| `CODELIST_STUB` | warning | Etapa registrada; evaluación XSLT no ejecutada |

## Crypto (opt-in)

| Código | Severidad | Descripción |
|--------|-----------|-------------|
| `CRYPTO_MODULE_UNAVAILABLE` | error | No se pudo cargar módulo crypto |
| `CRYPTO_NOTHING_TO_VERIFY` | warning | Sin datos criptográficos en el documento |
| `CRYPTO_SKIPPED_NO_DIAN` | warning | Scope DIAN sin `DianExtensions` |
| `CUFE_MISMATCH` | error | CUFE calculado ≠ UUID (reservado; verificación completa **pendiente**) |
| `SOFTWARE_SECURITY_MISMATCH` | error | `SoftwareSecurityCode` inconsistente |
| `XADES_VERIFY_STUB` | warning | Firma presente; cadena de certificados no verificada |

## Ejemplo de lectura programática

```ts
const result = await validate(xml);

for (const issue of result.errors) {
  console.log(issue.stage, issue.code, issue.path, issue.message);
}

if (result.stages?.profile && !result.stages.profile.valid) {
  // fallos Schematron DIAN/Peppol
}
```

## Pendiente

- Mensajes localizados (`locale: "es" | "en"`) — opción en API sin implementar
- Enriquecimiento uniforme de errores XSD/Ajv con `code` estable propio

Ver [roadmap.md](./roadmap.md).
