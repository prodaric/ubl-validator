# Roadmap y trabajo pendiente

Lista explícita de funcionalidad **no implementada**, **stub** o **parcial**, para priorizar desarrollo incremental. Actualizado al alcance de `2.1.0-dev.0`.

Leyenda: 🔴 pendiente · 🟡 parcial · 🟢 implementado

---

## Alta prioridad (estructural / producción)

### 🟡 Schematron ISO completo

| Item | Estado | Notas |
|------|--------|-------|
| Evaluador ligero (`exists`, `count`, …) | 🟢 | `src/profile/schematron/runner.ts` |
| Motor Saxon / libschxslt | 🔴 | Mencionado en plan; sin `optionalDependencies` |
| Reglas DIAN oficiales (Caja FE v1.9) | 🟡 | Placeholders; ZIP DIAN 404 en `fetch-dian-schemas.mjs` |
| Reglas Peppol BIS Billing 3.x oficiales | 🟡 | Subconjunto mínimo empaquetado |
| Matriz de tests vs reglas oficiales | 🔴 | Documentar gaps por regla |

**Próximo paso sugerido:** integrar `libschxslt` + Saxon-HE como peer/optional; script que extraiga `.sch` del ZIP DIAN cuando la URL esté disponible.

### 🔴 Validación XSD extensión DIAN

ProfileStage comprueba que exista `DIAN-Structures-2.1.xsd` pero **no valida** `sts:DianExtensions` / `ExtensionContent` contra ese XSD.

**Próximo paso:** validar fragmento `ExtensionContent` con XSD DIAN tras SchemaStage OASIS (UBL §3.4).

### 🟡 Crypto DIAN (CUFE / XAdES)

| Item | Estado |
|------|--------|
| Detección `DianExtensions`, UUID CUFE | 🟢 |
| `extractCufeInputFields`, `computeCufeSha384` | 🟢 |
| Verificación CUFE completa vs UUID | 🔴 |
| XAdES — cadena de certificados | 🔴 (solo warning `XADES_VERIFY_STUB`) |
| `SoftwareSecurityCode` | 🟡 |

**Próximo paso:** implementar algoritmo CUFE DIAN v1.9 y comparar con `cbc:UUID`; evaluar `xadesjs` o similar para XAdES opt-in.

---

## Media prioridad (conformidad UBL)

### 🔴 CodeListStage (Appendix E)

- Opt-in `{ codelist: true }`
- Stub: warning `CODELIST_STUB` / `CODELIST_SKIPPED`
- Requiere evaluar XSLT `UBL-DefaultDTQ-2.1.xsl` (incluido tras `schemas:fetch` en `val/`)

**Próximo paso:** ejecutor XSLT en Node (p. ej. `saxon-js` o `xslt-processor`) solo cuando `codelist: true`.

### 🔴 Reglas IND no cubiertas

- IND4, IND6 y resto de indicadores UBL 2.1 OS no mapeados aún
- Evaluar si aplican al perfil de uso XML/JSON del paquete

### 🔴 Internacionalización

- `ValidateOptions.locale` (`"en" | "es"`) declarado en tipos **sin implementación**
- Mensajes hoy en inglés (IND) o texto fijo del validador

---

## Baja prioridad / mejoras DX

### 🟡 Perfil `bii-legacy`

- Detección por `ProfileID` CENBII: 🟢
- Schematron / reglas: 🔴
- Solo warning informativo en meta; no invalida

### 🔴 Schematron en JSON

- JSON con señales Peppol/DIAN emite `PROFILE_JSON` warning
- Sin equivalente normativo en producción (perfiles son XML)

### 🔴 ProfileStage en browser

- OASIS + IND en browser: 🟢
- Schematron en WASM/worker: 🔴 (Saxon-JS candidato)

### 🔴 CLI

| Flag pendiente | Notas |
|----------------|-------|
| `--fail-fast` | Existe en API, no en CLI |
| `--codelist` | Existe; etapa es stub |
| `--crypto-scope` | Solo vía API |
| `--locale` | Sin efecto global |

### 🔴 Publicación npm automatizada

- Workflow `publish.yml` con `NPM_TOKEN` y tags: 🔴
- Publicación manual documentada en [development.md](./development.md)

### 🔴 Fixtures mínimos 65/65 XSD

- 32 tipos sin ejemplo OASIS tienen stubs derivados de Invoice trivial
- No garantizan validez XSD individual

**Próximo paso:** generar mínimos válidos por tipo desde XSD o ampliar ejemplos OASIS en registry.

---

## Deuda técnica conocida

| Item | Detalle |
|------|---------|
| Ejemplos OASIS vs IND5 | 3 XML oficiales con elementos vacíos (`known-fixture-gaps.ts`) |
| OrderResponse JSON | Gap `additionalProperties` en fixture OASIS |
| Descarga DIAN Caja FE | URL puede devolver 404; placeholders locales |
| Vitest worker timeout | Mitigado con `hookTimeout` y sin preload masivo en CI |
| Errores XSD/Ajv | Códigos del motor, no normalizados a catálogo propio |

---

## Criterio “listo para 2.1.0 estable”

Considerar release estable cuando, como mínimo:

1. 🟢 IND1 + IND2/5/7/8 + auto-detect perfiles (hecho en dev)
2. 🟡 Schematron DIAN con reglas oficiales y suite de regresión documentada
3. 🟡 Schematron Peppol BIS 3.x con ejemplos OpenPeppol
4. 🔴 XSD extensión DIAN ejecutándose en ProfileStage
5. 🟡 Crypto CUFE verificable con `{ crypto: true }`
6. 🟢 CI verde + cobertura ≥85% (hecho)
7. 🔴 Publicado en npmjs.com bajo `@prodaric`

Actualizar este documento al cerrar cada ítem.
