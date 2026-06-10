# @prodaric/ubl-validator

Validador de documentos **UBL 2.1** en **XML** y **JSON** (model-based OASIS) para Node.js, browser y Angular Forms.

> **Estado:** `2.1.0-alpha.1` — primera alpha pública. Pipeline estructural con perfiles DIAN/Peppol (auto-detect), reglas IND y crypto opt-in.  
> **No producción** hasta `2.1.0` estable · [CHANGELOG](./CHANGELOG.md) · [Roadmap](./docs/roadmap.md)

```bash
npm install @prodaric/ubl-validator@alpha
```

## Instalación

```bash
npm install github:prodaric/ubl-validator#main
# o, cuando esté en npm:
# npm install @prodaric/ubl-validator
```

## Inicio rápido

```ts
import { validate } from "@prodaric/ubl-validator";

const result = await validate(xml);
// result.stages: schema → ind → profile (si aplica)
// result.meta.profileDetected: "dian-fe-1.9" | "peppol-bis-billing-3" | "oasis-ubl-2.1" | …

await validate(xml, { profile: "none" });  // solo OASIS + IND
await validate(xml, { crypto: true });     // + verificación cripto (parcial)
```

```bash
npx ubl-validate factura.xml --profile auto --json-report
```

## Documentación

| Guía | Descripción |
|------|-------------|
| [docs/README.md](./docs/README.md) | Índice y estado por capa |
| [Primeros pasos](./docs/getting-started.md) | Instalación, CLI, browser, Angular |
| [API](./docs/api.md) | `validate()`, opciones, subpaths |
| [Pipeline](./docs/pipeline.md) | Etapas schema → ind → profile → … |
| [Perfiles](./docs/profiles.md) | DIAN, Peppol, detección automática |
| [Conformidad UBL 2.1](./docs/conformance-ubl-2.1.md) | IND rules, criterios release |
| [Errores](./docs/errors.md) | Códigos, stages, sources |
| [Desarrollo](./docs/development.md) | Scripts, tests, CI |
| [Roadmap / Pendiente](./docs/roadmap.md) | Qué falta por implementar |

## Exports

| Import | Uso |
|--------|-----|
| `@prodaric/ubl-validator` | Core: `validate`, detección, registry |
| `@prodaric/ubl-validator/profile` | Perfiles, Schematron, registry |
| `@prodaric/ubl-validator/crypto` | CUFE / crypto opt-in |
| `@prodaric/ubl-validator/browser` | Validación con schemas vía HTTP |
| `@prodaric/ubl-validator/angular` | Async validator para Forms |

## Alcance actual (resumen)

| Capa | Estado |
|------|--------|
| XSD OASIS + JSON model (65 tipos) | Implementado |
| Reglas IND (XML) | Implementado |
| Auto-detect DIAN / Peppol | Implementado |
| Schematron perfil | Parcial (evaluador ligero, reglas mínimas) |
| XSD extensión DIAN | Pendiente |
| Codelist Appendix E | Pendiente (stub) |
| Crypto CUFE / XAdES | Parcial (opt-in) |

Detalle: [docs/roadmap.md](./docs/roadmap.md).

## Desarrollo y tests

```bash
npm run schemas:setup
npm run schemas:profiles:fetch
npm run fixtures:dian          # opcional; XMLs DIAN para tests
npm run build
npm test                       # suite completa
npm run test:coverage          # gate ≥85% (CI)
npm run test:ci                # prepublishOnly
```

CI: GitHub Actions en cada push/PR a `main`. Release: tag `v*` → workflow `release.yml` (requiere `NPM_TOKEN`).

### Lanzamiento alpha

```bash
npm run test:coverage
git tag v2.1.0-alpha.1
git push origin v2.1.0-alpha.1
# GitHub Actions publica con dist-tag alpha si NPM_TOKEN está configurado
# Manual: npm publish --access public --tag alpha
```

## Versionado

| Versión | Significado |
|---------|-------------|
| `2.1.0-alpha.n` | Alpha pública (`npm install @alpha`) |
| `2.1.0-beta.n` | Beta (prevista) |
| `2.1.0` | Estable según [criterios](./docs/conformance-ubl-2.1.md) |

El **`2.1`** corresponde al estándar **UBL 2.1**, no al semver mayor del paquete.

## Licencia

Apache-2.0
