# @prodaric/ubl-validator

Validador de documentos **UBL 2.1** en **XML** y **JSON** para Node.js, browser y Angular.

Comprueba si una factura, nota crédito u otro documento UBL cumple el esquema **OASIS**, las reglas estructurales del estándar (**IND**), y — si aplica — reglas de perfiles como **DIAN** (Colombia) o **Peppol** (Europa).

> **Estado:** `2.1.0-alpha.2` — alpha pública. No usar en producción tributaria hasta `2.1.0` estable.  
> [Qué es y cómo funciona](./docs/overview.md) · [CHANGELOG](./CHANGELOG.md) · [Roadmap](./docs/roadmap.md)

```bash
npm install @prodaric/ubl-validator@alpha
```

## Inicio rápido

```ts
import { validate } from "@prodaric/ubl-validator";

const result = await validate(xml);

console.log(result.valid);                      // true | false
console.log(result.documentType);               // p. ej. "Invoice"
console.log(result.meta?.profileDetected);       // p. ej. "dian-fe-1.9"
console.log(result.errors);                     // qué falló
```

```bash
npx ubl-validate factura.xml --json-report
```

| Opción | Efecto |
|--------|--------|
| `{ profile: "none" }` | Solo OASIS + IND (sin Schematron DIAN/Peppol) |
| `{ crypto: true }` | + verificación cripto (parcial, opt-in) |
| `{ failFast: true }` | Para en la primera capa con errores |

## Documentación

| Guía | Para quién |
|------|------------|
| [**Qué es y cómo funciona**](./docs/overview.md) | Empezar aquí — conceptos, pipeline, casos de uso, FAQ |
| [Primeros pasos](./docs/getting-started.md) | Instalación, CLI, browser, Angular |
| [API](./docs/api.md) | `validate()`, opciones, subpaths |
| [Pipeline](./docs/pipeline.md) | Etapas schema → ind → profile → … |
| [Perfiles](./docs/profiles.md) | DIAN, Peppol, auto-detect |
| [Errores](./docs/errors.md) | Códigos y cómo interpretarlos |
| [Conformidad UBL 2.1](./docs/conformance-ubl-2.1.md) | IND rules, criterios release |
| [Desarrollo](./docs/development.md) | Scripts, tests, CI |
| [Roadmap](./docs/roadmap.md) | Limitaciones y pendientes |

Índice completo: [docs/README.md](./docs/README.md).

## Exports

| Import | Uso |
|--------|-----|
| `@prodaric/ubl-validator` | Core: `validate`, detección, registry |
| `@prodaric/ubl-validator/profile` | Perfiles, Schematron, registry |
| `@prodaric/ubl-validator/crypto` | CUFE / crypto opt-in |
| `@prodaric/ubl-validator/browser` | Validación OASIS con schemas vía HTTP |
| `@prodaric/ubl-validator/angular` | Async validator para Forms |

## Alcance (alpha)

| Capa | Estado |
|------|--------|
| XSD OASIS + JSON model (65 tipos) | Implementado |
| Reglas IND (XML) | Implementado |
| Auto-detect DIAN / Peppol | Implementado |
| Schematron perfil | Parcial (evaluador ligero, reglas mínimas) |
| XSD extensión DIAN | Pendiente |
| Codelist Appendix E | Pendiente (stub) |
| Crypto CUFE / XAdES | Parcial (opt-in) |

## Desarrollo

```bash
git clone https://github.com/prodaric/ubl-validator.git
cd ubl-validator
npm ci
npm run schemas:setup
npm run test:coverage
```

CI en cada push/PR a `main`. Release: bump en `package.json` → tag `v*` → [GitHub Release](https://github.com/prodaric/ubl-validator/releases) → publicación npm automática.

## Versionado

| Versión | Significado |
|---------|-------------|
| `2.1.0-alpha.n` | Alpha (`npm install @alpha`) |
| `2.1.0-beta.n` | Beta (prevista) |
| `2.1.0` | Estable según [criterios](./docs/conformance-ubl-2.1.md) |

El **`2.1`** corresponde al estándar **UBL 2.1**.

## Licencia

Apache-2.0
