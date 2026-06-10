# Perfiles de validación

Los perfiles extienden la capa OASIS con reglas nacionales o sectoriales (DIAN Colombia, Peppol BIS, etc.).

## Comportamiento por defecto

```ts
const result = await validate(dianInvoiceXml);
// meta.profileDetected: "dian-fe-1.9"
// stages: schema → ind → profile
```

Sin señales de perfil → `oasis-ubl-2.1` → **no** se ejecuta ProfileStage.

## Perfiles empaquetados

| ID | Etiqueta | Schematron | XSD ext. | Crypto ref. |
|----|----------|------------|----------|-------------|
| `oasis-ubl-2.1` | Base OASIS | — | — | — |
| `dian-fe-1.9` | DIAN FE v1.9 | Sí (mínimo) | Declarado | CUFE, XAdES |
| `peppol-bis-billing-3` | Peppol BIS Billing 3.0 | Sí (mínimo) | — | — |
| `bii-legacy` | CEN BII legacy | — | — | — |

Catálogo: `schemas/profiles/registry.json` (generado por `scripts/build-profile-registry.mjs`).

## Señales de detección

Prioridad: **DIAN (namespace sts) → Peppol → BII → OASIS**.

| Señal | Perfil | Confianza |
|-------|--------|-----------|
| `sts:DianExtensions` o NS `dian:gov:co:facturaelectronica` | `dian-fe-1.9` | certain |
| `cbc:ProfileID` contiene `DIAN` | `dian-fe-1.9` | likely |
| `cbc:UUID/@schemeName="CUFE-SHA384"` | refuerzo DIAN | — |
| `CustomizationID` / `ProfileID` con `peppol.eu` o `en16931` | `peppol-bis-billing-3` | certain |
| `ProfileID` CENBII (`cenbii.eu`) | `bii-legacy` | likely |
| Sin señales | `oasis-ubl-2.1` | fallback |

Detección disponible en XML y JSON (Schematron solo en XML).

## Overrides

```ts
await validate(xml, { profile: "none" });         // solo OASIS + IND
await validate(xml, { profile: "dian-fe-1.9" });    // forzar DIAN
await validate(xml, { profile: "auto" });           // explícito (= default)
await validate(xml, { crypto: true });              // + etapa crypto (opt-in)
```

## Artefactos vendor

```
schemas/vendor/dian-fe-1.9/          # XSD + .sch DIAN
schemas/vendor/peppol-bis-billing-3/ # .sch Peppol
schemas/profiles/registry.json       # índice
```

Instalación / regeneración:

```bash
npm run schemas:profiles:fetch
```

Si el perfil se detecta pero faltan archivos → error `PROFILE_ARTIFACTS_MISSING` (no fallo silencioso).

## Schematron

**Estado actual:** evaluador **ligero** en `src/profile/schematron/runner.ts` que interpreta un subconjunto de `<assert>` / `<report>` (`exists`, `count`, `not`, igualdad simple).

**Limitaciones (pendiente):**

- No es ISO Schematron completo (sin Saxon/libschxslt)
- Reglas empaquetadas son **mínimas** para tests de integración, no el catálogo oficial DIAN/Peppol completo
- La descarga del ZIP DIAN Caja FE v1.9 puede fallar (404); se usan placeholders locales

Ver [roadmap.md](./roadmap.md) § Schematron y artefactos oficiales.

## XSD extensión DIAN

El registry declara `vendor/dian-fe-1.9/xsd/DIAN-Structures-2.1.xsd`. Hoy ProfileStage **solo comprueba que el archivo exista**; la validación XSD de `sts:*` / `ExtensionContent` está **pendiente**.

## Browser

- Detección de perfil: sí
- OASIS + IND: sí
- ProfileStage (Schematron): **no** (Node-only)

## API

```ts
import {
  detectProfileFromSignals,
  listProfiles,
  getProfile,
  runProfileStage,
} from "@prodaric/ubl-validator/profile";
```
