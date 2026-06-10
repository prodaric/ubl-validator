# Primeros pasos

## Instalación

### npm (cuando esté publicado)

```bash
npm install @prodaric/ubl-validator
```

### Desde GitHub

```bash
npm install github:prodaric/ubl-validator#main
```

### Desarrollo local

```bash
git clone https://github.com/prodaric/ubl-validator.git
cd ubl-validator
npm ci
npm run schemas:setup
npm run schemas:profiles:fetch
npm run build
```

## Validación mínima (Node.js)

```ts
import { readFileSync } from "node:fs";
import { validate } from "@prodaric/ubl-validator";

const xml = readFileSync("factura.xml", "utf8");
const result = await validate(xml);

console.log(result.valid);
console.log(result.documentType);       // p. ej. "Invoice"
console.log(result.meta?.profileDetected); // p. ej. "dian-fe-1.9"
console.log(result.stages);             // resumen por etapa
```

### Solo estructura OASIS (sin Schematron de perfil)

Útil para integradores que ya tienen sus propias reglas de negocio:

```ts
await validate(xml, { profile: "none" });
```

### JSON (modelo OASIS)

```ts
import invoice from "./invoice.json" with { type: "json" };

const result = await validate(invoice, {
  format: "json",
  documentType: "Invoice",
});
```

## CLI

Tras instalar el paquete (incluye bin `ubl-validate`):

```bash
ubl-validate factura.xml
ubl-validate factura.xml --profile none
ubl-validate factura.xml --profile dian-fe-1.9 --crypto
ubl-validate factura.json --format json --document-type Invoice
ubl-validate factura.xml --json-report
```

| Flag | Descripción |
|------|-------------|
| `--profile auto\|none\|ID` | Perfil de validación (default: `auto`) |
| `--format xml\|json` | Formato explícito |
| `--document-type Invoice` | Tipo UBL si no se infiere |
| `--crypto` | Activa etapa criptográfica |
| `--codelist` | Activa etapa codelist (stub) |
| `--json-report` | Imprime `ValidationResult` JSON |

Código de salida: `0` válido, `1` inválido, `2` uso incorrecto.

## Browser

Copia `schemas/` a tus assets estáticos:

```ts
import { configureBrowserSchemas, validate } from "@prodaric/ubl-validator/browser";

configureBrowserSchemas("/assets/ubl-schemas/");
const result = await validate(jsonDocument, { profile: "none" });
```

En browser no se ejecuta `ProfileStage` (Schematron) ni `CryptoStage` de forma fiable.

## Angular Forms

```ts
import { FormGroup } from "@angular/forms";
import { createUblAsyncValidator } from "@prodaric/ubl-validator/angular";

const form = new FormGroup(
  { /* documento en JSON model */ },
  {
    asyncValidators: [
      createUblAsyncValidator({ documentType: "Invoice", format: "json" }),
    ],
  },
);
```

## Perfiles DIAN / Peppol

Por defecto `validate(xml)` detecta el perfil y ejecuta Schematron si aplica. Ver [profiles.md](./profiles.md).

Artefactos empaquetados (incluidos en npm):

```bash
npm run schemas:profiles:fetch   # regenera vendor + registry
```

## Siguiente lectura

- [API](./api.md) — opciones completas y forma del resultado
- [Pipeline](./pipeline.md) — qué hace cada etapa
- [Roadmap](./roadmap.md) — límites actuales y trabajo pendiente
