# Perfiles de validación (DIAN, Peppol, OASIS)

El validador detecta automáticamente el perfil de un documento UBL **antes** de ejecutar Schematron o XSD de extensión.

## Comportamiento por defecto

```ts
await validate(dianInvoiceXml);
// meta.profileDetected: "dian-fe-1.9"
// stages: schema (OASIS) → ind → profile (DIAN)
```

Sin señales de perfil nacional o Peppol, el documento se trata como **`oasis-ubl-2.1`** (solo capa base OASIS + reglas IND).

## Señales de detección

| Señal | Perfil |
|-------|--------|
| `sts:DianExtensions` o namespace `dian:gov:co:facturaelectronica` | `dian-fe-1.9` |
| `cbc:ProfileID` contiene `DIAN` | `dian-fe-1.9` |
| `cbc:UUID/@schemeName="CUFE-SHA384"` | refuerzo DIAN |
| `CustomizationID` / `ProfileID` con `peppol.eu` o `en16931` | `peppol-bis-billing-3` |
| `ProfileID` CENBII (`cenbii.eu`) | `bii-legacy` (informativo) |
| Sin señales | `oasis-ubl-2.1` |

Prioridad: **DIAN (namespace sts) → Peppol → BII → OASIS**.

## Overrides

```ts
await validate(xml, { profile: "none" });        // solo OASIS + IND
await validate(xml, { profile: "dian-fe-1.9" }); // forzar perfil
await validate(xml, { profile: "auto" });        // explícito; igual que default
await validate(xml, { crypto: true });           // CUFE / firmas (opt-in)
```

## API dedicada

```ts
import {
  detectProfileFromSignals,
  listProfiles,
  getProfile,
} from "@prodaric/ubl-validator/profile";
```

## Artefactos de perfil

Los esquemas DIAN y Peppol viven en `schemas/vendor/` y se instalan con:

```bash
npm run schemas:profiles:fetch
```

Si un perfil se detecta pero faltan artefactos, el validador emite `PROFILE_ARTIFACTS_MISSING` (no falla en silencio).

## Schematron

`ProfileStage` ejecuta reglas `.sch` empaquetadas. En Node se usa un evaluador ligero integrado; para reglas ISO Schematron completas puede instalarse Saxon como dependencia opcional futura.

## Browser

La detección de perfil y validación OASIS+IND funcionan en browser. `ProfileStage` (Schematron) está orientado a **Node.js**.
