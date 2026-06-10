# @prodaric/ubl-validator

Validador de documentos **UBL 2.1** en **XML** y **JSON** (model-based OASIS) para Node.js, browser y Angular Forms.

> **Estado:** desarrollo (`2.1.0-dev.x`). La versión estable **`2.1.0`** se publicará cuando el paquete cumpla el alcance completo alineado con el estándar UBL 2.1 (y capas DIAN en fases posteriores).

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

if (!result.valid) {
  for (const issue of result.errors) {
    console.error(issue.path, issue.message);
  }
}
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

- `validate(input, options?)` — validación unificada (`format: "auto" | "xml" | "json"`)
- `detectDocumentType(input)` — detecta tipo entre los **65** documentos UBL 2.1
- `UBL_DOCUMENT_TYPES` — lista de tipos registrados
- `preloadDocumentTypes(types)` — precarga XSD/JSON Schema en memoria

## Testing

```bash
npm run schemas:setup   # esquemas OASIS (primera vez)
npm run fixtures:dian   # XMLs oficiales DIAN (caja herramientas v1.9)
npm run build
npm test
```

### Fixtures DIAN (Colombia)

La [DIAN](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/documentacion-tecnica/) publica la **Caja de herramientas Factura Electrónica v1.9** con decenas de XML UBL 2.1 de ejemplo (`Ejemplificaciones/XMLs de ejemplo/`): Invoice, CreditNote, DebitNote, ApplicationResponse (RADIAN), etc.

```bash
npm run fixtures:dian
```

Eso descarga el ZIP oficial y extrae los XML a `tests/fixtures/dian/xml/`. Los tests en `tests/dian-fixtures.test.ts` validan **estructura UBL 2.1 OASIS (XSD)**. Las reglas de negocio DIAN (Schematron, `DianExtensions`, CUFE) serán una capa posterior.

## Desarrollo

```bash
npm run test:ci         # build + tests
```

## Licencia

Apache-2.0
