import { existsSync } from "node:fs";
import path from "node:path";
import { schemasRoot } from "../../schema-reader/index.js";
import type { ValidationIssue } from "../../types.js";

const DEFAULT_DTQ = "vendor/ubl-2.1/val/UBL-DefaultDTQ-2.1.xsl";

export async function runCodelistStage(
  _xml: string,
  _documentType: string,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const dtqPath = path.join(schemasRoot, DEFAULT_DTQ);
  if (!existsSync(dtqPath)) {
    return {
      warnings: [
        {
          rule: "CODELIST_SKIPPED",
          message:
            "UBL DefaultDTQ XSLT not found. Run npm run schemas:fetch to enable Appendix E codelist validation.",
          severity: "warning",
          stage: "codelist",
          source: "oasis-codelist",
        },
      ],
      errors: [],
    };
  }

  return {
    warnings: [
      {
        rule: "CODELIST_STUB",
        message:
          "Codelist phase (Appendix E) registered; full XSLT evaluation is optional and not run in this build.",
        severity: "warning",
        stage: "codelist",
        source: "oasis-codelist",
      },
    ],
    errors: [],
  };
}
