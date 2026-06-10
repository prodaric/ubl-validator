# @prodaric/ubl-validator

Validador de documentos **UBL 2.1** en **XML** y **JSON** (model-based OASIS) para Node.js, browser y Angular Forms.

## Instalación

Desde GitHub ([prodaric/ubl-validator](https://github.com/prodaric/ubl-validator)):

```bash
npm install github:prodaric/ubl-validator
```

Con versión fija:

```bash
npm install github:prodaric/ubl-validator#v2.1.0
```

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

## Desarrollo

```bash
npm run schemas:setup   # descarga esquemas OASIS (primera vez)
npm run build
npm test
```

## Licencia

Apache-2.0
