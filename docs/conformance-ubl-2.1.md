# Conformidad UBL 2.1

Referencia de capas implementadas respecto a UBL 2.1 OS y perfiles empaquetados.

## Capas del pipeline

| Capa | Default | Norma / origen |
|------|---------|----------------|
| **SchemaStage** | Siempre | IND1 — XSD OASIS o JSON Schema model |
| **IndRulesStage** | Siempre | IND2, IND5, IND7, IND8 (error); IND3 (warning) |
| **ProfileStage** | Auto si perfil ≠ OASIS | DIAN FE v1.9, Peppol BIS Billing 3.x |
| **CodeListStage** | `{ codelist: true }` | Appendix E (stub / opt-in) |
| **CryptoStage** | `{ crypto: true }` | CUFE DIAN, firmas UBL §5 (opt-in) |

## IND rules (XML)

| Código | Regla UBL | Severidad |
|--------|-----------|-----------|
| `IND2_ENCODING_REQUIRED` | Declaración XML con `encoding` | error |
| `IND3_ENCODING_SHOULD_UTF8` | Se recomienda UTF-8 | warning |
| `IND5_EMPTY_ELEMENT` | No elementos vacíos (`<tag/>`) | error |
| `IND7_DUPLICATE_LANGUAGE_ID` | Hermanos Text sin `languageID` duplicado | error |
| `IND8_MISSING_LANGUAGE_ID` | Varios hermanos Text requieren `languageID` | error |

> Algunos ejemplos oficiales OASIS usan elementos vacíos y fallan IND5 aunque pasen XSD. Ver `tests/helpers/known-fixture-gaps.ts`.

## Perfiles

Ver [profiles.md](./profiles.md).

## Criterios release 2.1.0

- IND1: 65 tipos registrados; 33 ejemplos OASIS XSD válidos
- IND2/5/7/8 activos en XML
- Auto-detect DIAN / Peppol / OASIS
- Override `{ profile: "none" }`
- Crypto opt-in separado de ProfileStage
