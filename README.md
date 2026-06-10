# @prodaric/ubl-validator

Validador de documentos **UBL 2.1** en **XML** y **JSON** (model-based OASIS) para Node.js, browser y Angular Forms.

> **Estado:** desarrollo (`2.1.0-dev.x`). Pipeline estructural con detección automática de perfiles DIAN/Peppol, reglas IND y crypto opt-in.

## Instalación

Desde GitHub ([prodaric/ubl-validator](https://github.com/prodaric/ubl-validator)):

```bash
npm install github:prodaric/ubl-validator
```

Rama o commit concreto:

```bash
npm install github:prodaric/ubl-validator#main
```

## Versionado

| Versión npm | Significado |
|-------------|-------------|
| `2.1.0-dev.n` | Desarrollo activo |
| `2.1.0` | Estable: validación UBL 2.1 completa según alcance acordado |

El **`2.1`** del paquete corresponde al estándar **UBL 2.1**, no a semver mayor independiente.

## Uso (Node.js)

```ts
import { validate } from "@prodaric/ubl-validator";
import { readFileSync } from "node:fs";

const xml = readFileSync("invoice.xml", "utf8");
const result = await validate(xml);

// Solo OASIS + IND (sin Schematron de perfil)
await validate(xml, { profile: "none" });

// CUFE / firmas (opt-in)
await validate(xml, { crypto: true });
```

### CLI

```bash
npx ubl-validate invoice.xml --profile auto
npx ubl-validate invoice.xml --profile none --json-report
```

## Perfiles (DIAN / Peppol)

Por defecto se detecta el perfil desde `CustomizationID`, `ProfileID` y extensiones DIAN. Ver [docs/profiles.md](./docs/profiles.md).

```ts
import { detectProfileFromSignals } from "@prodaric/ubl-validator/profile";
```

Instalar artefactos de perfil:

```bash
npm run schemas:profiles:fetch
```

## Uso (Angular Forms)

```ts
import { FormGroup } from "@angular/forms";
import { createUblAsyncValidator } from "@prodaric/ubl-validator/angular";

const form = new FormGroup(
  { /* documento UBL en JSON model */ },
  { asyncValidators: [createUblAsyncValidator({ documentType: "Invoice", format: "json" })] },
);
```

## Uso (browser)

Copia la carpeta `schemas/` a tus assets y configura el lector antes de validar:

```ts
import { configureBrowserSchemas, validate } from "@prodaric/ubl-validator/browser";

configureBrowserSchemas("/assets/ubl-schemas/");
const result = await validate(jsonDocument);
```

## API

- `validate(input, options?)` — pipeline: schema → IND → perfil (auto) → crypto (opt-in)
- `detectDocumentType(input)` — detecta tipo entre los **65** documentos UBL 2.1
- `detectProfileFromSignals(input)` — perfil DIAN / Peppol / OASIS
- `@prodaric/ubl-validator/profile` — registry y ProfileStage
- `@prodaric/ubl-validator/crypto` — CUFE / verificación cripto (opt-in)
- `UBL_DOCUMENT_TYPES` — lista de tipos registrados
- `preloadDocumentTypes(types)` — precarga XSD/JSON Schema en memoria

Documentación: [docs/conformance-ubl-2.1.md](./docs/conformance-ubl-2.1.md), [docs/errors.md](./docs/errors.md).

## Testing

Suite principal: **33 ejemplos oficiales OASIS** (XML+JSON del paquete UBL 2.1) en `tests/oasis-official-examples.test.ts`.

```bash
npm run schemas:setup          # esquemas OASIS (primera vez)
npm run schemas:profiles:fetch # DIAN + Peppol Schematron/XSD
npm run fixtures:dian          # XMLs oficiales DIAN (opcional)
npm run build
npm test
npm run test:coverage          # gate ≥85% líneas
```

Criterios OASIS:
- **XML:** 33/33 válidos contra XSD OASIS (IND5 documentado en 3 ejemplos)
- **JSON model:** 32/33 válidos; `OrderResponse` documentado como gap del fixture OASIS
- **Perfiles:** auto-detect DIAN/Peppol; override `{ profile: "none" }`

### Fixtures DIAN (Colombia)

La [DIAN](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/documentacion-tecnica/) publica la **Caja de herramientas Factura Electrónica v1.9** con decenas de XML UBL 2.1 de ejemplo.

```bash
npm run fixtures:dian
```

Los tests validan **XSD OASIS** (`profile: "none"`) y **perfil DIAN** (`tests/profile-dian.test.ts`) con Schematron empaquetado.

## Desarrollo

```bash
npm run test:ci         # build + tests
```

## Licencia

Apache-2.0
