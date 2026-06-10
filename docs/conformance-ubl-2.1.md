# Conformidad UBL 2.1

Mapa entre el estándar [UBL 2.1 OS](https://docs.oasis-open.org/ubl/os-UBL-2.1/) y lo implementado en `@prodaric/ubl-validator`.

## Indicadores de conformidad (IND)

| IND | Descripción UBL | Implementación | Default |
|-----|-----------------|----------------|---------|
| IND1 | Esquema XSD / modelo | **SchemaStage** | Siempre |
| IND2 | Declaración XML con encoding | **IndRulesStage** | Siempre (XML) |
| IND3 | UTF-8 recomendado | Warning IND3 | Siempre (XML) |
| IND4 | — | No aplicado | — |
| IND5 | Sin elementos vacíos | **IndRulesStage** | Siempre (XML) |
| IND6 | — | No aplicado | — |
| IND7 | languageID único entre hermanos | **IndRulesStage** | Siempre (XML) |
| IND8 | languageID en hermanos Text | **IndRulesStage** | Siempre (XML) |
| Appendix E | Codelists (DTQ) | **CodeListStage** stub | Opt-in |

### Gaps documentados en fixtures OASIS

Algunos ejemplos oficiales OASIS **pasan XSD** pero **violan IND5** (elementos vacíos):

- `ForecastRevision`
- `OrderResponse`
- `ProductActivity`

Lista en `tests/helpers/known-fixture-gaps.ts`.

### JSON model

- **32/33** ejemplos oficiales validan contra JSON Schema model
- **OrderResponse:** gap `additionalProperties` en fixture OASIS (XML del mismo tipo sí valida)

## Capas del pipeline

Ver [pipeline.md](./pipeline.md). Resumen:

| Capa | Default | Estado |
|------|---------|--------|
| SchemaStage | Sí | Completo |
| IndRulesStage | Sí (XML) | Completo (IND2/3/5/7/8) |
| ProfileStage | Auto | Parcial |
| CodeListStage | Opt-in | Pendiente |
| CryptoStage | Opt-in | Parcial |

## Perfiles estructurales

DIAN FE y Peppol BIS forman parte del pipeline estructural (no post-proceso opcional). Detalle en [profiles.md](./profiles.md).

## Cobertura de tipos documento (IND1)

| Métrica | Valor |
|---------|-------|
| Tipos en registry | **65** |
| Con ejemplo XML oficial OASIS | **33** |
| Tests XSD (profile:none) | 33/33 oficiales + registry 65 paths |

Los 32 tipos sin ejemplo oficial tienen stubs mínimos en `tests/fixtures/minimal-xml/` (no garantizan validez XSD).

## Criterios release `2.1.0`

| Criterio | Estado |
|----------|--------|
| IND1 — 65 tipos registrados, XSD paths válidos | ✓ |
| IND1 — 33 ejemplos OASIS XML vs XSD | ✓ |
| IND2/5/7/8 en XML | ✓ |
| Auto-detect DIAN / Peppol / OASIS | ✓ |
| Override `{ profile: "none" }` | ✓ |
| DIAN Schematron con fixtures oficiales | Parcial (reglas mínimas) |
| Peppol BIS Schematron | Parcial (reglas mínimas) |
| Crypto opt-in separado | Parcial |
| Cobertura tests ≥85% | ✓ |
| CI en GitHub Actions | ✓ |

Items pendientes para considerar **2.1.0 estable** vs **2.1.0-dev**: [roadmap.md](./roadmap.md).

## Entornos

| Entorno | IND1 + IND | Perfil | Crypto |
|---------|------------|--------|--------|
| Node.js | ✓ | ✓ (parcial) | ✓ (parcial) |
| Browser | ✓ | ✗ | ✗ |
| Angular | ✓ (JSON) | ✗ | ✗ |
