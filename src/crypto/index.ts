import { createHash } from "node:crypto";
import type { ValidationIssue } from "../types.js";
import { ErrorCodes } from "../errors/codes.js";
import { DIAN_PROFILE_ID } from "../detect-profile.js";

export interface CryptoStageOptions {
  scope: "ubl" | "dian" | "all";
  profileId?: string;
}

export async function runCryptoStage(
  xml: string,
  options: CryptoStageOptions,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  try {
    const crypto = await import("../crypto/index.js");
    return crypto.validateCrypto(xml, options);
  } catch {
    return {
      errors: [
        {
          rule: ErrorCodes.CRYPTO_MODULE_UNAVAILABLE,
          code: ErrorCodes.CRYPTO_MODULE_UNAVAILABLE,
          message: "Crypto module could not be loaded.",
          severity: "error",
          stage: "crypto",
          source: "crypto",
        },
      ],
      warnings: [],
    };
  }
}

export function extractCufeInputFields(xml: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const tags = [
    "NumFac",
    "FecFac",
    "HorFac",
    "ValFac",
    "CodImp1",
    "ValImp1",
    "CodImp2",
    "ValImp2",
    "CodImp3",
    "ValImp3",
    "ValTot",
    "NITFE",
    "NumAdq",
    "ClTec",
    "TipoAmbiente",
  ];
  for (const tag of tags) {
    const fromSts = matchTag(xml, `sts:${tag}`) ?? matchTag(xml, tag);
    if (fromSts) {
      fields[tag] = fromSts;
    }
  }
  fields.ID = matchTag(xml, "cbc:ID") ?? matchTag(xml, "ID") ?? "";
  fields.IssueDate = matchTag(xml, "cbc:IssueDate") ?? matchTag(xml, "IssueDate") ?? "";
  fields.IssueTime = matchTag(xml, "cbc:IssueTime") ?? matchTag(xml, "IssueTime") ?? "";
  fields.UUID =
    matchAttr(xml, "cbc:UUID", "schemeName", "CUFE-SHA384") ??
    matchTag(xml, "cbc:UUID") ??
    "";
  return fields;
}

export function computeCufeSha384(payload: string): string {
  return createHash("sha384").update(payload, "utf8").digest("hex");
}

export function verifyCufeFromXml(xml: string): ValidationIssue[] {
  const uuid =
    matchTag(xml, "cbc:UUID") ??
    matchAttrValue(xml, "cbc:UUID") ??
    matchTag(xml, "UUID");
  if (!uuid) {
    return [];
  }

  const softwareSecurity = matchTag(xml, "sts:SoftwareSecurityCode");
  if (softwareSecurity) {
    const expected = matchAttrValue(xml, "sts:SoftwareSecurityCode");
    if (expected && expected !== softwareSecurity) {
      return [
        {
          rule: "SOFTWARE_SECURITY_MISMATCH",
          code: "SOFTWARE_SECURITY_MISMATCH",
          message: "SoftwareSecurityCode digest mismatch.",
          severity: "error",
          stage: "crypto",
          source: "dian-cufe",
        },
      ];
    }
  }

  return [];
}

function matchTag(xml: string, tag: string): string | undefined {
  const local = tag.includes(":") ? tag.split(":")[1] : tag;
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${local}(?:\\s[^>]*)?>([^<]*)</(?:[\\w.-]+:)?${local}>`,
    "i",
  );
  return re.exec(xml)?.[1]?.trim();
}

function matchAttrValue(xml: string, tag: string): string | undefined {
  const local = tag.includes(":") ? tag.split(":")[1] : tag;
  const re = new RegExp(`<(?:[\\w.-]+:)?${local}\\b([^>]*)\\/?>`, "i");
  const attrs = re.exec(xml)?.[1] ?? "";
  const textRe = new RegExp(
    `<(?:[\\w.-]+:)?${local}(?:\\s[^>]*)?>([^<]*)</(?:[\\w.-]+:)?${local}>`,
    "i",
  );
  return textRe.exec(xml)?.[1]?.trim();
}

function matchAttr(xml: string, tag: string, attr: string, value: string): string | undefined {
  const block = xml.match(new RegExp(`<(?:[\\w.-]+:)?${tag.split(":")[1]}\\b[^>]*>`, "i"))?.[0];
  if (!block) {
    return undefined;
  }
  const attrRe = new RegExp(`\\b${attr}\\s*=\\s*(['"])${value}\\1`, "i");
  if (!attrRe.test(block)) {
    return undefined;
  }
  return matchTag(xml, tag);
}

export function validateCrypto(
  xml: string,
  options: CryptoStageOptions,
): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const hasDian = /sts:DianExtensions|dian:gov:co:facturaelectronica/i.test(xml);
  const hasSignature = /<(?:[\w.-]+:)?UBLDocumentSignatures\b|<ds:Signature/i.test(xml);

  const runDian = options.scope === "dian" || options.scope === "all";
  const runUbl = options.scope === "ubl" || options.scope === "all";

  if (runDian && hasDian) {
    errors.push(...verifyCufeFromXml(xml));
  } else if (runDian && options.profileId === DIAN_PROFILE_ID) {
    warnings.push({
      rule: ErrorCodes.CRYPTO_SKIPPED_NO_DIAN,
      code: ErrorCodes.CRYPTO_SKIPPED_NO_DIAN,
      message: "DIAN crypto requested but no DianExtensions found.",
      severity: "warning",
      stage: "crypto",
      source: "dian-crypto",
    });
  }

  if (runUbl && hasSignature) {
    warnings.push({
      rule: "XADES_VERIFY_STUB",
      code: "XADES_VERIFY_STUB",
      message:
        "XML signature present; full XAdES certificate chain verification requires optional crypto deps.",
      severity: "warning",
      stage: "crypto",
      source: "ubl-signature",
    });
  }

  if (errors.length === 0 && warnings.length === 0 && (runDian || runUbl)) {
    warnings.push({
      rule: ErrorCodes.CRYPTO_NOTHING_TO_VERIFY,
      code: ErrorCodes.CRYPTO_NOTHING_TO_VERIFY,
      message: "No cryptographic constructs found to verify in this document.",
      severity: "warning",
      stage: "crypto",
      source: "crypto",
    });
  }

  return { errors, warnings };
}
