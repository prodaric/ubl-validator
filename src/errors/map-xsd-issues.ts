import type { ValidationIssue } from "../types.js";

interface XsdEngineIssue {
  severity: string;
  message: string;
  path: string;
  line?: number;
  col?: number;
  code?: string;
  category?: string;
  offset?: number;
  endLine?: number;
  endCol?: number;
}

export function mapXsdIssues(
  issues: XsdEngineIssue[],
  stage: ValidationIssue["stage"] = "schema",
): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  for (const issue of issues) {
    const mapped: ValidationIssue = {
      rule: issue.code ?? "XSD",
      code: issue.code ?? "XSD",
      message: issue.message,
      severity: issue.severity === "warning" ? "warning" : "error",
      path: issue.path,
      line: issue.line,
      col: issue.col,
      stage,
      source: "oasis-ind1",
      category: issue.category,
    };
    if (mapped.severity === "warning") {
      warnings.push(mapped);
    } else {
      errors.push(mapped);
    }
  }

  return { errors, warnings };
}
