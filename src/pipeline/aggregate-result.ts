import type {
  StageSummary,
  ValidationIssue,
  ValidationResult,
  ValidationStageName,
} from "../types.js";
import { UBL_VERSION } from "../types.js";

export interface PartialPipelineResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stages: Partial<Record<ValidationStageName, StageSummary>>;
  aborted?: boolean;
}

export function emptyPartialResult(): PartialPipelineResult {
  return { errors: [], warnings: [], stages: {} };
}

export function recordStage(
  partial: PartialPipelineResult,
  stage: ValidationStageName,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): void {
  partial.errors.push(...errors);
  partial.warnings.push(...warnings);
  partial.stages[stage] = {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
  };
}

export function buildValidationResult(
  partial: PartialPipelineResult,
  documentType: string,
  format: "xml" | "json",
  meta?: ValidationResult["meta"],
): ValidationResult {
  const hasErrors = partial.errors.length > 0;
  return {
    valid: !hasErrors,
    documentType,
    ublVersion: UBL_VERSION,
    format,
    errors: partial.errors,
    warnings: partial.warnings,
    stages: partial.stages,
    meta,
  };
}
