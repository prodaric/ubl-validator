import type { ValidateOptions, ValidationResult } from "../types.js";
import {
  detectDocumentType,
  normalizeInput,
  resolveFormat,
} from "../detect-document-type.js";
import {
  detectProfileFromSignals,
  resolveProfileId,
  type ProfileMatchInput,
} from "../detect-profile.js";
import { listProfiles } from "../profile/registry.js";
import {
  buildValidationResult,
  emptyPartialResult,
  recordStage,
} from "./aggregate-result.js";
import { validateIndRules } from "./stages/ind-rules-stage.js";
import { runProfileStage } from "./stages/profile-stage.js";
import { validateJsonDocument } from "../validate-json.js";
import { validateXmlDocument } from "../validate-xml.js";
import { runCryptoStage } from "./stages/crypto-stage.js";
import { runCodelistStage } from "./stages/codelist-stage.js";

export interface PipelineInput {
  text: string;
  object?: Record<string, unknown>;
}

export async function runPipeline(
  input: PipelineInput,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const partial = emptyPartialResult();
  const format =
    options.format && options.format !== "auto"
      ? options.format
      : input.object
        ? "json"
        : resolveFormat(options.format, input.text);

  let documentType: string;
  try {
    documentType =
      options.documentType ??
      detectDocumentType(input.object ?? input.text, format).documentType;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    partial.errors.push({
      rule: "DETECT",
      message,
      severity: "error",
      stage: "parse",
      source: "detect",
    });
    return buildValidationResult(partial, "Unknown", format, {});
  }

  const profileInput: ProfileMatchInput = {
    xml: format === "xml" ? input.text : undefined,
    json: input.object,
    documentType,
  };
  const detected = detectProfileFromSignals(profileInput, listProfiles());
  const activeProfileId = resolveProfileId(options.profile ?? "auto", detected);

  const meta: ValidationResult["meta"] = {
    profileDetected: detected.profileId,
    profileConfidence: detected.confidence,
    profileSignals: detected.signals,
  };

  if (format === "xml") {
    const schemaResult = await validateXmlDocument(input.text, documentType);
    recordStage(partial, "schema", schemaResult.errors, schemaResult.warnings);
    if (options.failFast && schemaResult.errors.length > 0) {
      return buildValidationResult(partial, documentType, format, meta);
    }

    const indResult = validateIndRules(input.text);
    recordStage(partial, "ind", indResult.errors, indResult.warnings);
    if (options.failFast && indResult.errors.length > 0) {
      return buildValidationResult(partial, documentType, format, meta);
    }

    if (activeProfileId) {
      const profileResult = await runProfileStage(input.text, activeProfileId, documentType);
      recordStage(partial, "profile", profileResult.errors, profileResult.warnings);
      if (options.failFast && profileResult.errors.length > 0) {
        return buildValidationResult(partial, documentType, format, meta);
      }
    }

    if (options.codelist) {
      const codelistResult = await runCodelistStage(input.text, documentType);
      recordStage(partial, "codelist", codelistResult.errors, codelistResult.warnings);
    }

    if (options.crypto) {
      const cryptoResult = await runCryptoStage(input.text, {
        scope: options.cryptoScope ?? "all",
        profileId: activeProfileId ?? detected.profileId,
      });
      recordStage(partial, "crypto", cryptoResult.errors, cryptoResult.warnings);
    }
  } else {
    const jsonResult = await validateJsonDocument(
      input.object ?? input.text,
      documentType,
      options,
    );
    recordStage(partial, "schema", jsonResult.errors, jsonResult.warnings);

    if (activeProfileId && activeProfileId !== "oasis-ubl-2.1") {
      partial.warnings.push({
        rule: "PROFILE_JSON",
        message: `Profile "${activeProfileId}" Schematron applies to XML only; JSON validated against OASIS schema only.`,
        severity: "warning",
        stage: "profile",
        source: "profile",
      });
      partial.stages.profile = { valid: true, errorCount: 0, warningCount: 1 };
    }
  }

  return buildValidationResult(partial, documentType, format, meta);
}
