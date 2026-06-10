export const UBL_VERSION = "2.1" as const;

export type UblFormat = "xml" | "json" | "auto";
export type JsonVariant = "model" | "legacy";

export type ValidationStageName =
  | "parse"
  | "schema"
  | "ind"
  | "profile"
  | "codelist"
  | "crypto";

export type ProfileOption = "auto" | "none" | string;

export interface ValidationIssue {
  rule: string;
  message: string;
  severity: "error" | "warning";
  path?: string;
  line?: number;
  col?: number;
  stage?: ValidationStageName;
  source?: string;
  code?: string;
  category?: string;
  params?: Record<string, unknown>;
  schemaPath?: string;
  expected?: unknown;
  actual?: unknown;
}

export interface StageSummary {
  valid: boolean;
  errorCount: number;
  warningCount: number;
}

export interface ValidationResult {
  valid: boolean;
  documentType: string;
  ublVersion: typeof UBL_VERSION;
  format: "xml" | "json";
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stages?: Partial<Record<ValidationStageName, StageSummary>>;
  meta?: {
    profileDetected?: string;
    profileConfidence?: "certain" | "likely" | "fallback";
    profileSignals?: string[];
  };
}

export interface ValidateOptions {
  format?: UblFormat;
  documentType?: string;
  jsonVariant?: JsonVariant;
  /** @default "auto" — detect DIAN/Peppol from document signals */
  profile?: ProfileOption;
  codelist?: boolean;
  crypto?: boolean;
  cryptoScope?: "ubl" | "dian" | "all";
  locale?: "en" | "es";
  failFast?: boolean;
}

export interface RegistryDocument {
  documentType: string;
  xsd: string;
  jsonModel: string;
  xsdCommonDir: string;
  jsonCommonDir: string;
  exampleXml?: string;
  exampleJson?: string;
  rootElement?: string;
  namespace?: string;
  hasOfficialExample?: boolean;
  requiredElements?: string[];
}

export interface SchemaRegistry {
  ublVersion: string;
  generatedAt: string;
  documentCount: number;
  documents: RegistryDocument[];
}

export interface DetectDocumentTypeResult {
  documentType: string;
  format: "xml" | "json";
}

export interface ProfileDetectionResult {
  profileId: string;
  confidence: "certain" | "likely" | "fallback";
  signals: string[];
  customizationId?: string;
  profileIdValue?: string;
}

export interface ValidationProfile {
  id: string;
  label: string;
  match: {
    xmlNamespaces?: string[];
    customizationIdPatterns?: string[];
    profileIdPatterns?: string[];
    uuidSchemePatterns?: string[];
  };
  schema?: {
    extensionXsd?: string;
    extensionContentXsd?: string;
  };
  schematron: string[];
  documentTypes: string[];
  crypto?: { cufe?: boolean; xades?: boolean };
}

export interface ProfileRegistry {
  generatedAt: string;
  profiles: ValidationProfile[];
}

export interface SchemaReader {
  readText(relativePath: string): Promise<string> | string;
}
