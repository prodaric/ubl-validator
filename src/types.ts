export const UBL_VERSION = "2.1" as const;

export type UblFormat = "xml" | "json" | "auto";
export type JsonVariant = "model" | "legacy";

export interface ValidationIssue {
  rule: string;
  message: string;
  severity: "error" | "warning";
  path?: string;
  line?: number;
  col?: number;
}

export interface ValidationResult {
  valid: boolean;
  documentType: string;
  ublVersion: typeof UBL_VERSION;
  format: "xml" | "json";
  errors: ValidationIssue[];
}

export interface ValidateOptions {
  format?: UblFormat;
  documentType?: string;
  jsonVariant?: JsonVariant;
}

export interface RegistryDocument {
  documentType: string;
  xsd: string;
  jsonModel: string;
  xsdCommonDir: string;
  jsonCommonDir: string;
  exampleXml?: string;
  exampleJson?: string;
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

export interface SchemaReader {
  readText(relativePath: string): Promise<string> | string;
}
