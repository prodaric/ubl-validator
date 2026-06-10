# API

## Punto de entrada principal

```ts
import {
  validate,
  preloadDocumentTypes,
  detectDocumentType,
  detectProfileFromSignals,
  UBL_DOCUMENT_TYPES,
  UBL_VERSION,
  ErrorCodes,
} from "@prodaric/ubl-validator";
```

### `validate(input, options?)`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `input` | `string \| Record<string, unknown>` | XML como texto o objeto JSON |
| `options` | `ValidateOptions` | Ver tabla abajo |

Retorna `Promise<ValidationResult>`.

### `ValidateOptions`

| Opción | Default | Descripción |
|--------|---------|-------------|
| `format` | `"auto"` | `"xml"`, `"json"` o inferido |
| `documentType` | auto | Uno de los 65 tipos UBL 2.1 |
| `jsonVariant` | `"model"` | Variante JSON OASIS |
| `profile` | `"auto"` | `"auto"`, `"none"` o ID (`dian-fe-1.9`, …) |
| `codelist` | `false` | Appendix E — **stub** |
| `crypto` | `false` | CUFE / firmas — **parcial** |
| `cryptoScope` | `"all"` | `"ubl"`, `"dian"` o `"all"` |
| `locale` | — | **Pendiente** — sin efecto hoy |
| `failFast` | `false` | Detiene tras errores en schema/ind/profile |

### `ValidationResult`

```ts
interface ValidationResult {
  valid: boolean;              // false si hay errors.length > 0
  documentType: string;
  ublVersion: "2.1";
  format: "xml" | "json";
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stages?: {
    schema?: StageSummary;
    ind?: StageSummary;
    profile?: StageSummary;
    codelist?: StageSummary;
    crypto?: StageSummary;
  };
  meta?: {
    profileDetected?: string;
    profileConfidence?: "certain" | "likely" | "fallback";
    profileSignals?: string[];
  };
}
```

Cada `ValidationIssue` incluye:

- `rule`, `code`, `message`, `severity` (`error` | `warning`)
- `stage`: `parse` | `schema` | `ind` | `profile` | `codelist` | `crypto`
- `source`: origen (`oasis-ind5`, `dian-schematron`, `ajv`, …)
- `path`, `line`, `col` cuando aplica

### Detección

```ts
detectDocumentType(xmlOrJson);           // { documentType, format }
detectProfileFromSignals({ xml, documentType }); // ProfileDetectionResult
```

### Precarga

```ts
await preloadDocumentTypes(["Invoice", "CreditNote"]);
```

Evita cold-start en validaciones repetidas (XSD / JSON Schema en memoria).

## Subpaths

### `@prodaric/ubl-validator/profile`

```ts
import {
  detectProfileFromSignals,
  extractUblHeaderFields,
  resolveProfileId,
  listProfiles,
  getProfile,
  loadProfileRegistry,
  runProfileStage,
  OASIS_PROFILE_ID,
  DIAN_PROFILE_ID,
  PEPPOL_PROFILE_ID,
} from "@prodaric/ubl-validator/profile";
```

### `@prodaric/ubl-validator/crypto`

```ts
import {
  validateCrypto,
  verifyCufeFromXml,
  extractCufeInputFields,
  computeCufeSha384,
} from "@prodaric/ubl-validator/crypto";
```

### `@prodaric/ubl-validator/browser`

Re-export del core + `configureBrowserSchemas(baseUrl)`.

### `@prodaric/ubl-validator/angular`

`createUblAsyncValidator(options)` para `@angular/forms` ≥17.

## Registry

```ts
import {
  getAllRegistryDocuments,
  getRegistryDocument,
  isKnownDocumentType,
  loadRegistry,
} from "@prodaric/ubl-validator";
```

65 documentos en `schemas/registry.json`, generado por `npm run schemas:registry`.

## Validadores de bajo nivel

```ts
import { validateXmlDocument, validateJsonDocument } from "@prodaric/ubl-validator";
```

Ejecutan solo la etapa **schema** (sin pipeline completo).
