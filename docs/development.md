# Desarrollo

## Requisitos

- Node.js ≥18
- npm ≥9

## Scripts npm

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm test` | Vitest |
| `npm run test:ci` | build + tests |
| `npm run test:coverage` | build + tests + cobertura (≥85%) |
| `npm run schemas:fetch` | Descarga UBL 2.1 OASIS (XSD, ejemplos, val/) |
| `npm run schemas:registry` | Genera `schemas/registry.json` (65 tipos) |
| `npm run schemas:setup` | fetch + registry |
| `npm run schemas:profiles:fetch` | DIAN + Peppol vendor + `profiles/registry.json` |
| `npm run fixtures:dian` | XMLs oficiales DIAN → `tests/fixtures/dian/` |
| `npm run fixtures:minimal` | Stubs XML para tipos sin ejemplo OASIS |

## Estructura del código

```
src/
  validate.ts              # Facade → runPipeline
  pipeline/
    run-pipeline.ts        # Orquestación
    stages/                # schema (xml/json), ind, profile, codelist, crypto
  detect-profile.ts
  profile/                 # registry, schematron/runner
  crypto/
  errors/
  cli/main.ts              # ubl-validate
schemas/
  registry.json            # 65 document types OASIS
  profiles/registry.json   # DIAN, Peppol, …
  vendor/                  # XSD, .sch, ejemplos
tests/
  oasis-official-examples.test.ts
  profile-dian.test.ts
  …
```

## Tests

243 tests en 19 archivos. Suites principales:

| Suite | Qué verifica |
|-------|--------------|
| `oasis-official-examples` | 33 pares XML+JSON OASIS |
| `all-document-types` | 65 tipos en registry + 33 XSD |
| `profile-dian` | Auto-detect + Schematron DIAN |
| `profile-peppol` | Auto-detect Peppol |
| `profile-opt-out` | `{ profile: "none" }` |
| `dian-fixtures` | XSD OASIS sobre XMLs DIAN |
| `crypto-opt-in` | Etapa crypto opt-in |

Fixtures DIAN requieren `npm run fixtures:dian` (descarga ZIP; puede omitirse en local si ya existen bajo `tests/fixtures/dian/xml/`).

## CI

GitHub Actions: `.github/workflows/ci.yml`

- `npm ci` → `schemas:setup` → `schemas:profiles:fetch` → `fixtures:dian` → `test:coverage`

Dependabot: `.github/dependabot.yml` (npm + actions, semanal).

## Añadir un perfil nuevo

1. Artefactos en `schemas/vendor/<profile-id>/`
2. Entrada en `scripts/build-profile-registry.mjs`
3. `npm run schemas:profiles:fetch`
4. Reglas de detección en `src/detect-profile.ts` si hace falta
5. Tests en `tests/profile-*.test.ts`

## Publicación npm

Paquete scoped `@prodaric/ubl-validator` con `"publishConfig": { "access": "public" }`.

### Alpha / pre-release

```bash
npm run test:coverage
npm version 2.1.0-alpha.2   # o editar package.json
git push origin main
git tag v2.1.0-alpha.2
git push origin v2.1.0-alpha.2
gh release create v2.1.0-alpha.2 --generate-notes --prerelease
```

El workflow `.github/workflows/release.yml` publica en npm al **publicar** un GitHub Release (`release: published`), no al pushear el tag solo. Requiere el secret `NPM_TOKEN` y que `package.json` coincida con el tag (`v2.1.0-alpha.2` → `2.1.0-alpha.2`).

Instalación por consumidores:

```bash
npm install @prodaric/ubl-validator@alpha
```

### Estable (futuro)

```bash
npm version 2.1.0
npm publish --access public
```

## Documentación

Los archivos en `docs/` se incluyen en el tarball npm (`package.json` → `files`). No hay generador de sitio estático; la fuente es Markdown en el repo.
