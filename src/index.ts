export { UBL_VERSION } from "./types.js";
export type {
  DetectDocumentTypeResult,
  JsonVariant,
  ProfileDetectionResult,
  ProfileOption,
  ProfileRegistry,
  RegistryDocument,
  SchemaReader,
  SchemaRegistry,
  StageSummary,
  UblFormat,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
  ValidationProfile,
  ValidationStageName,
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
  detectProfileFromSignals,
  extractUblHeaderFields,
  resolveProfileId,
  OASIS_PROFILE_ID,
  DIAN_PROFILE_ID,
  PEPPOL_PROFILE_ID,
} from "./detect-profile.js";

export {
  getProfile,
  listProfiles,
  loadProfileRegistry,
} from "./profile/registry.js";

export {
  clearXsdSchemaCache,
  preloadDocumentTypes as preloadXmlSchemas,
  validateXml,
  validateXmlDocument,
} from "./validate-xml.js";

export {
  clearJsonValidatorCache,
  preloadJsonValidators,
  validateJson,
  validateJsonDocument,
} from "./validate-json.js";

export { preloadDocumentTypes, validate } from "./validate.js";
export { ErrorCodes } from "./errors/codes.js";
