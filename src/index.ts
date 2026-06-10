export { UBL_VERSION } from "./types.js";
export type {
  DetectDocumentTypeResult,
  JsonVariant,
  RegistryDocument,
  SchemaReader,
  SchemaRegistry,
  UblFormat,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

export {
  getAllRegistryDocuments,
  getRegistryDocument,
  isKnownDocumentType,
  loadRegistry,
  registry,
  setRegistry,
  UBL_DOCUMENT_TYPES,
} from "./registry/index.js";

export {
  configureSchemaReader,
  getSchemaReader,
  NodeSchemaReader,
  readSchemaText,
  schemasRoot,
} from "./schema-reader/index.js";

export {
  detectDocumentType,
  detectDocumentTypeFromJson,
  detectDocumentTypeFromXml,
  inferFormat,
  normalizeInput,
  resolveFormat,
} from "./detect-document-type.js";

export {
  clearXsdSchemaCache,
  preloadDocumentTypes as preloadXmlSchemas,
  validateXml,
} from "./validate-xml.js";

export {
  clearJsonValidatorCache,
  preloadJsonValidators,
  validateJson,
} from "./validate-json.js";

export { preloadDocumentTypes, validate } from "./validate.js";
