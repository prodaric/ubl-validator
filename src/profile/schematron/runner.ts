import { readFileSync } from "node:fs";
import path from "node:path";
import { schemasRoot } from "../../schema-reader/index.js";
import type { ValidationIssue } from "../../types.js";
import { ErrorCodes } from "../../errors/codes.js";

/**
 * Lightweight Schematron validation: parses assert/report rules from .sch files
 * and evaluates simple XPath-like patterns. Full ISO Schematron requires Saxon;
 * this runner covers common DIAN/Peppol rules with test/@test attributes.
 */
export async function validateSchematronFiles(
  xml: string,
  relativePaths: string[],
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  for (const rel of relativePaths) {
    const abs = path.join(schemasRoot, rel);
    let schText: string;
    try {
      schText = readFileSync(abs, "utf8");
    } catch {
      continue;
    }

    const rules = parseSchematronAsserts(schText);
    for (const rule of rules) {
      const passed = evaluateSimpleTest(xml, rule.test);
      if (!passed) {
        const issue: ValidationIssue = {
          rule: ErrorCodes.PROFILE_SCHEMATRON,
          code: rule.id ?? ErrorCodes.PROFILE_SCHEMATRON,
          message: rule.message,
          severity: rule.flag === "warning" ? "warning" : "error",
          stage: "profile",
          source: rel.includes("dian") ? "dian-schematron" : "peppol-schematron",
          path: rule.context,
        };
        if (issue.severity === "warning") {
          warnings.push(issue);
        } else {
          errors.push(issue);
        }
      }
    }
  }

  return { errors, warnings };
}

interface SchRule {
  test: string;
  message: string;
  context?: string;
  id?: string;
  flag?: string;
}

function parseSchematronAsserts(sch: string): SchRule[] {
  const rules: SchRule[] = [];
  const assertRe =
    /<(?:sch:)?assert\b([^>]*)>([\s\S]*?)<\/(?:sch:)?assert>/gi;
  const reportRe =
    /<(?:sch:)?report\b([^>]*)>([\s\S]*?)<\/(?:sch:)?report>/gi;

  for (const re of [assertRe, reportRe]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(sch)) !== null) {
      const attrs = m[1];
      const test = extractAttr(attrs, "test");
      if (!test) {
        continue;
      }
      rules.push({
        test,
        message: stripTags(m[2]).trim() || "Schematron rule failed",
        context: extractAttr(attrs, "context") ?? undefined,
        id: extractAttr(attrs, "id") ?? undefined,
        flag: extractAttr(attrs, "flag") ?? undefined,
      });
    }
  }
  return rules;
}

function extractAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*(['"])(.*?)\\1`, "i");
  return re.exec(attrs)?.[2] ?? null;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ");
}

/** Minimal evaluator for common Schematron tests in UBL profiles. */
function evaluateSimpleTest(xml: string, test: string): boolean {
  const t = test.trim();

  if (/^not\s*\(/i.test(t)) {
    const inner = t.replace(/^not\s*\(/i, "").replace(/\)\s*$/, "");
    return !evaluateSimpleTest(xml, inner);
  }

  if (/^exists\s*\(/i.test(t)) {
    const xpath = t.replace(/^exists\s*\(\s*/i, "").replace(/\s*\)\s*$/, "");
    return elementExists(xml, xpath);
  }

  if (/^count\s*\(/i.test(t)) {
    return evaluateCountTest(xml, t);
  }

  if (t.includes(" or ") || t.includes(" and ")) {
    const parts = t.split(/\s+(?:or|and)\s+/i);
    const isOr = /\s+or\s+/i.test(t);
    const results = parts.map((p) => evaluateSimpleTest(xml, p.trim()));
    return isOr ? results.some(Boolean) : results.every(Boolean);
  }

  if (/=/.test(t)) {
    return evaluateEqualityTest(xml, t);
  }

  return elementExists(xml, t);
}

function elementExists(xml: string, xpath: string): boolean {
  const localNameFromPredicate = /local-name\(\)\s*=\s*['"]([\w.-]+)['"]/i.exec(xpath);
  const local = localNameFromPredicate?.[1]
    ?? xpath
      .replace(/^\/\/\s*/, "")
      .replace(/^\/\*\[local-name\(\)\s*=\s*['"](\w+)['"]\]\/?/, "$1")
      .replace(/^\*\:/, "")
      .replace(/^cbc:|^cac:|^sts:|^ext:/, "")
      .split("/")
      .pop()
      ?.replace(/\[.*$/, "")
      .trim();

  if (!local) {
    return true;
  }
  const re = new RegExp(`<(?:[\\w.-]+:)?${escapeRegExp(local)}(?:\\s|>|/)`, "i");
  return re.test(xml);
}

function evaluateCountTest(xml: string, test: string): boolean {
  const countMatch = /count\s*\(\s*([^)]+)\s*\)\s*(=|>=|<=|>|<)\s*(\d+)/i.exec(test);
  if (!countMatch) {
    return true;
  }
  const [, xpath, op, numStr] = countMatch;
  const local = xpath.replace(/^\/\//, "").replace(/^\*\:/, "").split("/").pop()?.trim() ?? "";
  const re = new RegExp(`<(?:[\\w.-]+:)?${escapeRegExp(local)}(?:\\s|>|/)`, "gi");
  const count = (xml.match(re) ?? []).length;
  const n = Number(numStr);
  switch (op) {
    case "=":
      return count === n;
    case ">=":
      return count >= n;
    case "<=":
      return count <= n;
    case ">":
      return count > n;
    case "<":
      return count < n;
    default:
      return true;
  }
}

function evaluateEqualityTest(xml: string, test: string): boolean {
  const eqMatch = /(.+?)\s*=\s*(['"])(.*?)\2/.exec(test);
  if (!eqMatch) {
    return true;
  }
  const left = eqMatch[1].trim();
  const expected = eqMatch[3];
  const value = matchTagValue(xml, left.replace(/^\/\//, "").replace(/^\*\:/, ""));
  return value === expected;
}

function matchTagValue(xml: string, localName: string): string | undefined {
  const name = localName.split("/").pop()?.replace(/\[.*$/, "") ?? localName;
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${escapeRegExp(name)}(?:\\s[^>]*)?>([^<]*)</(?:[\\w.-]+:)?${escapeRegExp(name)}>`,
    "i",
  );
  return re.exec(xml)?.[1]?.trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
