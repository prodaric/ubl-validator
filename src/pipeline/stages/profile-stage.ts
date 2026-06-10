import { existsSync } from "node:fs";
import path from "node:path";
import { getProfile } from "../../profile/registry.js";
import { schemasRoot } from "../../schema-reader/index.js";
import type { ValidationIssue } from "../../types.js";
import { ErrorCodes } from "../../errors/codes.js";

export async function runProfileStage(
  xml: string,
  profileId: string,
  documentType: string,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const profile = getProfile(profileId);
  if (!profile) {
    return {
      errors: [
        {
          rule: "PROFILE_UNKNOWN",
          code: "PROFILE_UNKNOWN",
          message: `Unknown validation profile "${profileId}".`,
          severity: "error",
          stage: "profile",
          source: "profile",
        },
      ],
      warnings: [],
    };
  }

  if (profile.documentTypes.length > 0 && !profile.documentTypes.includes(documentType)) {
    return {
      warnings: [
        {
          rule: "PROFILE_DOCUMENT_TYPE",
          code: "PROFILE_DOCUMENT_TYPE",
          message: `Profile "${profileId}" is not defined for document type "${documentType}".`,
          severity: "warning",
          stage: "profile",
          source: "profile",
        },
      ],
      errors: [],
    };
  }

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (profile.schema?.extensionXsd) {
    const xsdPath = path.join(schemasRoot, profile.schema.extensionXsd);
    if (!existsSync(xsdPath)) {
      errors.push({
        rule: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
        code: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
        message: `DIAN extension XSD not found at ${profile.schema.extensionXsd}. Run npm run schemas:profiles:fetch.`,
        severity: "error",
        stage: "profile",
        source: "dian-xsd",
      });
    }
  }

  const schFiles = profile.schematron.filter((rel) => {
    const abs = path.join(schemasRoot, rel);
    return existsSync(abs);
  });

  if (profile.schematron.length > 0 && schFiles.length === 0) {
    errors.push({
      rule: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
      code: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
      message: `Schematron rules for profile "${profileId}" are not installed. Run npm run schemas:profiles:fetch.`,
      severity: "error",
      stage: "profile",
      source: profileId.startsWith("dian") ? "dian-schematron" : "peppol-schematron",
    });
    return { errors, warnings };
  }

  if (schFiles.length > 0) {
    try {
      const { validateSchematronFiles } = await import("../../profile/schematron/runner.js");
      const schResult = await validateSchematronFiles(xml, schFiles);
      errors.push(...schResult.errors);
      warnings.push(...schResult.warnings);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("SCHEMATRON_ENGINE_UNAVAILABLE")) {
        errors.push({
          rule: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
          code: ErrorCodes.PROFILE_ARTIFACTS_MISSING,
          message:
            "Schematron engine unavailable. Install optional dependency saxon-js or run in Node with schemas:profiles:fetch.",
          severity: "error",
          stage: "profile",
          source: "profile-schematron",
        });
      } else {
        errors.push({
          rule: ErrorCodes.PROFILE_SCHEMATRON,
          code: ErrorCodes.PROFILE_SCHEMATRON,
          message,
          severity: "error",
          stage: "profile",
          source: "profile-schematron",
        });
      }
    }
  }

  return { errors, warnings };
}
