# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).  
Versionado alineado con UBL **2.1**; semver del paquete incluye pre-releases (`alpha`, `beta`, `rc`).

## [2.1.0-alpha.2] - 2026-06-10

### Fixed

- Build con TypeScript 6: `"types": ["node"]` en `tsconfig.json` (CI y `npm ci` vuelven a pasar)

### Changed

- CI: fixtures DIAN empaquetados (`fixtures:dian:verify`), sin descarga en el runner
- CI/release: publicación npm al publicar GitHub Release; Vitest con pool `threads`
- Dev-deps: TypeScript 6, Vitest 4, `@types/node` 25
- GitHub Actions: `actions/checkout@v6`, `actions/setup-node@v6`

### Install (alpha dist-tag)

```bash
npm install @prodaric/ubl-validator@alpha
```

## [2.1.0-alpha.1] - 2026-06-10

### Primera alpha pública

Release alpha del validador UBL 2.1 con pipeline estructural y perfiles automáticos.  
**No recomendado para producción** hasta `2.1.0` estable — ver [docs/roadmap.md](./docs/roadmap.md).

### Added

- Pipeline v2: `schema` → `ind` → `profile` (auto) → `codelist` (opt-in) → `crypto` (opt-in)
- Detección automática de perfiles DIAN FE v1.9, Peppol BIS Billing 3.x, BII legacy, fallback OASIS
- Reglas IND XML: IND2, IND3 (warning), IND5, IND7, IND8
- Subpaths: `@prodaric/ubl-validator/profile`, `/crypto`, `/browser`, `/angular`
- CLI `ubl-validate` con `--profile`, `--crypto`, `--json-report`
- Artefactos vendor DIAN/Peppol (Schematron mínimo) y `schemas/profiles/registry.json`
- 250 tests, cobertura ≥85%, CI GitHub Actions, Dependabot
- Documentación en `docs/` (API, pipeline, perfiles, conformidad, roadmap)

### Known limitations (alpha)

- Schematron: evaluador ligero; reglas oficiales DIAN/Peppol incompletas
- XSD extensión DIAN: no valida `sts:*` aún
- Crypto CUFE/XAdES: verificación parcial
- CodeList Appendix E: stub
- `locale` en API sin efecto

### Install (alpha dist-tag)

```bash
npm install @prodaric/ubl-validator@alpha
```

## [2.1.0-dev.0] - 2026-06-10

Desarrollo interno previo al pipeline v2 y perfiles automáticos.

## [2.1.0] - (unreleased)

Release estable planificado cuando se cumplan los criterios en [docs/conformance-ubl-2.1.md](./docs/conformance-ubl-2.1.md) y [docs/roadmap.md](./docs/roadmap.md).

[2.1.0-alpha.2]: https://github.com/prodaric/ubl-validator/compare/v2.1.0-alpha.1...v2.1.0-alpha.2
[2.1.0-alpha.1]: https://github.com/prodaric/ubl-validator/compare/2e03ce4...v2.1.0-alpha.1
[2.1.0-dev.0]: https://github.com/prodaric/ubl-validator/releases/tag/v2.1.0-dev.0
