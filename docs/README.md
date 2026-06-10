# Documentación — @prodaric/ubl-validator

Validador UBL 2.1 para Node.js, browser y Angular. Versión actual: **`2.1.0-alpha.2`** (`npm install @prodaric/ubl-validator@alpha`).

**¿Primera vez aquí?** Lee [Qué es y cómo funciona](./overview.md) — explica UBL, el pipeline, perfiles DIAN/Peppol y cómo interpretar los resultados sin jerga previa.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [**Qué es y cómo funciona**](./overview.md) | Conceptos, arquitectura, casos de uso, FAQ |
| [Primeros pasos](./getting-started.md) | Instalación, CLI, ejemplos mínimos |
| [API](./api.md) | `validate()`, opciones, `ValidationResult`, exports |
| [Pipeline](./pipeline.md) | Etapas, orden, `failFast`, agregación de resultados |
| [Perfiles](./profiles.md) | DIAN, Peppol, OASIS, auto-detect, overrides |
| [Conformidad UBL 2.1](./conformance-ubl-2.1.md) | IND rules, capas normativas, criterios de release |
| [Errores](./errors.md) | Códigos, `stage`, `source`, severidad |
| [Desarrollo](./development.md) | Scripts, esquemas, tests, CI |
| [Roadmap / Pendiente](./roadmap.md) | Funcionalidad no implementada o parcial |

## Estado por capa (resumen)

| Capa | Estado | Notas |
|------|--------|-------|
| XSD OASIS (IND1) | **Implementado** | 65 tipos; 33 ejemplos oficiales XML |
| JSON Schema model | **Implementado** | 32/33 ejemplos; gap `OrderResponse` |
| Reglas IND (XML) | **Implementado** | IND2, 3, 5, 7, 8 |
| Detección de perfil | **Implementado** | DIAN, Peppol, BII, OASIS |
| ProfileStage Schematron | **Parcial** | Evaluador ligero; reglas mínimas empaquetadas |
| ProfileStage XSD extensión DIAN | **Pendiente** | Solo verifica que el artefacto exista |
| CodeList (Appendix E) | **Pendiente** | Stub opt-in |
| Crypto (CUFE / XAdES) | **Parcial** | Opt-in; verificación cripto limitada |
| i18n (`locale`) | **Pendiente** | Opción en tipos, sin efecto |
| Schematron ISO completo (Saxon) | **Pendiente** | Sin dependencia opcional empaquetada |
| Artefactos DIAN oficiales | **Parcial** | Placeholders; descarga ZIP DIAN falla (404) |
| Artefactos Peppol oficiales | **Parcial** | Reglas mínimas de integración |

Detalle y prioridades: [roadmap.md](./roadmap.md).

## Entornos soportados

| Entorno | OASIS + IND | Perfil (Schematron) | Crypto |
|---------|-------------|---------------------|--------|
| Node.js ≥18 | Sí | Sí | Sí (opt-in) |
| Browser | Sí | No | No |
| Angular Forms | Sí (JSON) | No | No |
