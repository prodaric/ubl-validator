import type { ValidationIssue } from "../../types.js";
import { ErrorCodes } from "../../errors/codes.js";

const XML_DECL_ENCODING = /<\?xml[^?]*\sencoding\s*=\s*(['"])(.*?)\1/i;
const EMPTY_ELEMENT = /<([\w:.-]+)(?:\s[^>]*)?\s*\/>|<([\w:.-]+)(?:\s[^>]*)?>\s*<\/\2>/g;
const EXTENSION_CONTENT_MARKER = /ExtensionContent/i;

function isInsideExtensionContent(xml: string, index: number): boolean {
  const before = xml.slice(0, index);
  const openExt = (before.match(/<[^>]*ExtensionContent[^>]*>/gi) ?? []).length;
  const closeExt = (before.match(/<\/[^>]*ExtensionContent\s*>/gi) ?? []).length;
  return openExt > closeExt;
}

export function validateIndRules(xml: string): {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
} {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const encodingMatch = xml.match(XML_DECL_ENCODING);
  if (!encodingMatch) {
    errors.push({
      rule: ErrorCodes.IND2_ENCODING_REQUIRED,
      code: ErrorCodes.IND2_ENCODING_REQUIRED,
      message: "XML declaration must include an encoding attribute (UBL IND2).",
      severity: "error",
      stage: "ind",
      source: "oasis-ind2",
    });
  } else {
    const encoding = encodingMatch[2].toUpperCase();
    if (encoding !== "UTF-8" && encoding !== "UTF8") {
      warnings.push({
        rule: ErrorCodes.IND3_ENCODING_SHOULD_UTF8,
        code: ErrorCodes.IND3_ENCODING_SHOULD_UTF8,
        message: `Encoding "${encodingMatch[2]}" — UBL IND3 recommends UTF-8.`,
        severity: "warning",
        stage: "ind",
        source: "oasis-ind3",
      });
    }
  }

  let match: RegExpExecArray | null;
  const emptyPattern = new RegExp(EMPTY_ELEMENT.source, "g");
  while ((match = emptyPattern.exec(xml)) !== null) {
    const tag = match[1] ?? match[2];
    if (!tag || EXTENSION_CONTENT_MARKER.test(tag)) {
      continue;
    }
    if (isInsideExtensionContent(xml, match.index)) {
      continue;
    }
    errors.push({
      rule: ErrorCodes.IND5_EMPTY_ELEMENT,
      code: ErrorCodes.IND5_EMPTY_ELEMENT,
      message: `Empty element <${tag}/> is not allowed (UBL IND5).`,
      severity: "error",
      stage: "ind",
      source: "oasis-ind5",
      path: `/${tag}`,
    });
  }

  validateTextLanguageRules(xml, errors);

  return { errors, warnings };
}

function validateTextLanguageRules(xml: string, errors: ValidationIssue[]): void {
  const textLocalNames = new Set([
    "Note",
    "Description",
    "Title",
    "Keyword",
    "Instruction",
    "Content",
    "JobTitle",
  ]);

  const tagRe = /<(\/?)([\w:.-]+)([^>]*)(?:\/>|>)/g;
  const stack: Array<Map<string, Array<{ lang?: string; hasLang: boolean }>>> = [new Map()];
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(xml)) !== null) {
    const isClose = match[1] === "/";
    const rawName = match[2];
    const attrs = match[3] ?? "";
    const localName = rawName.includes(":") ? rawName.split(":")[1]! : rawName;

    if (isClose) {
      if (stack.length > 1) {
        collectIndLanguageIssues(stack[stack.length - 1]!, errors);
        stack.pop();
      }
      continue;
    }

    const selfClosing = /\/\s*$/.test(match[0]);

    if (textLocalNames.has(localName)) {
      const parent = stack[stack.length - 1]!;
      const langMatch = attrs.match(/\slanguageID\s*=\s*(['"])(.*?)\1/i);
      const bucket = parent.get(localName) ?? [];
      bucket.push({
        lang: langMatch?.[2],
        hasLang: Boolean(langMatch),
      });
      parent.set(localName, bucket);
    }

    if (!selfClosing) {
      stack.push(new Map());
    }
  }

  collectIndLanguageIssues(stack[0]!, errors);
}

function collectIndLanguageIssues(
  frame: Map<string, Array<{ lang?: string; hasLang: boolean }>>,
  errors: ValidationIssue[],
): void {
  for (const [localName, siblings] of frame) {
    if (siblings.length < 2) {
      continue;
    }
    const langs = new Set<string>();
    for (const s of siblings) {
      if (!s.hasLang) {
        errors.push({
          rule: ErrorCodes.IND8_MISSING_LANGUAGE_ID,
          code: ErrorCodes.IND8_MISSING_LANGUAGE_ID,
          message: `Sibling ${localName} elements must all have languageID when more than one (UBL IND8).`,
          severity: "error",
          stage: "ind",
          source: "oasis-ind8",
        });
        continue;
      }
      const lang = s.lang ?? "";
      if (langs.has(lang)) {
        errors.push({
          rule: ErrorCodes.IND7_DUPLICATE_LANGUAGE_ID,
          code: ErrorCodes.IND7_DUPLICATE_LANGUAGE_ID,
          message: `Duplicate languageID "${lang}" on sibling ${localName} elements (UBL IND7).`,
          severity: "error",
          stage: "ind",
          source: "oasis-ind7",
        });
      }
      langs.add(lang);
    }
  }
}
