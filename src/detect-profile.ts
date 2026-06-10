import type { ProfileDetectionResult, ValidationProfile } from "./types.js";

const OASIS_PROFILE_ID = "oasis-ubl-2.1";
const DIAN_PROFILE_ID = "dian-fe-1.9";
const PEPPOL_PROFILE_ID = "peppol-bis-billing-3";
const BII_PROFILE_ID = "bii-legacy";

const DIAN_STS_NS = "dian:gov:co:facturaelectronica";
const DIAN_EXTENSIONS = /sts:DianExtensions|<[^>]*DianExtensions/i;
const DIAN_PROFILE_TEXT = /\bDIAN\b/i;
const PEPPOL_URN = /peppol\.eu|en16931/i;
const BII_URN = /cenbii|cenbii\.eu/i;

export interface ProfileMatchInput {
  xml?: string;
  json?: Record<string, unknown>;
  documentType: string;
}

export function extractUblHeaderFields(input: ProfileMatchInput): {
  customizationId?: string;
  profileId?: string;
  hasDianExtensions: boolean;
  hasCufeScheme: boolean;
  xmlNamespaces: string[];
} {
  if (input.xml) {
    return extractFromXml(input.xml);
  }
  if (input.json) {
    return extractFromJson(input.json, input.documentType);
  }
  return { hasDianExtensions: false, hasCufeScheme: false, xmlNamespaces: [] };
}

function extractFromXml(xml: string): ReturnType<typeof extractUblHeaderFields> {
  const xmlNamespaces = [...xml.matchAll(/xmlns(?::\w+)?\s*=\s*(['"])(.*?)\1/gi)].map(
    (m) => m[2],
  );
  const customizationId = matchTagValue(xml, "CustomizationID");
  const profileId = matchTagValue(xml, "ProfileID");
  const hasDianExtensions =
    DIAN_EXTENSIONS.test(xml) ||
    xmlNamespaces.some((ns) => ns.includes(DIAN_STS_NS));
  const hasCufeScheme = /schemeName\s*=\s*(['"])CUFE-SHA384\1/i.test(xml);
  return { customizationId, profileId, hasDianExtensions, hasCufeScheme, xmlNamespaces };
}

function matchTagValue(xml: string, localName: string): string | undefined {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${localName}(?:\\s[^>]*)?>([^<]*)</(?:[\\w.-]+:)?${localName}>`,
    "i",
  );
  return re.exec(xml)?.[1]?.trim();
}

function extractFromJson(
  json: Record<string, unknown>,
  documentType: string,
): ReturnType<typeof extractUblHeaderFields> {
  const root = json[documentType];
  const payload =
    root && typeof root === "object" && !Array.isArray(root)
      ? (root as Record<string, unknown>)
      : Array.isArray(root) && root[0] && typeof root[0] === "object"
        ? (root[0] as Record<string, unknown>)
        : null;

  const readField = (key: string): string | undefined => {
    if (!payload) return undefined;
    const v = payload[key];
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && "_" in (v as object)) {
      return String((v as { _: unknown })._);
    }
    return undefined;
  };

  const text = JSON.stringify(json);
  return {
    customizationId: readField("CustomizationID"),
    profileId: readField("ProfileID"),
    hasDianExtensions: text.includes("DianExtensions") || text.includes(DIAN_STS_NS),
    hasCufeScheme: text.includes("CUFE-SHA384"),
    xmlNamespaces: [],
  };
}

export function detectProfileFromSignals(
  input: ProfileMatchInput,
  profiles?: ValidationProfile[],
): ProfileDetectionResult {
  const fields = extractUblHeaderFields(input);
  const signals: string[] = [];

  if (fields.hasDianExtensions) {
    signals.push("sts:DianExtensions");
  }
  if (fields.profileId && DIAN_PROFILE_TEXT.test(fields.profileId)) {
    signals.push(`ProfileID:${fields.profileId}`);
  }
  if (fields.hasCufeScheme) {
    signals.push("UUID:CUFE-SHA384");
  }
  if (fields.customizationId) {
    signals.push(`CustomizationID:${fields.customizationId}`);
  }
  if (fields.profileId && PEPPOL_URN.test(fields.profileId)) {
    signals.push(`ProfileID:${fields.profileId}`);
  }
  if (fields.customizationId && PEPPOL_URN.test(fields.customizationId)) {
    signals.push(`CustomizationID:${fields.customizationId}`);
  }

  if (fields.hasDianExtensions || (fields.profileId && DIAN_PROFILE_TEXT.test(fields.profileId))) {
    return {
      profileId: DIAN_PROFILE_ID,
      confidence: fields.hasDianExtensions ? "certain" : "likely",
      signals,
      customizationId: fields.customizationId,
      profileIdValue: fields.profileId,
    };
  }

  const peppolSignal =
    (fields.customizationId && PEPPOL_URN.test(fields.customizationId)) ||
    (fields.profileId && PEPPOL_URN.test(fields.profileId));
  if (peppolSignal) {
    return {
      profileId: PEPPOL_PROFILE_ID,
      confidence: "certain",
      signals,
      customizationId: fields.customizationId,
      profileIdValue: fields.profileId,
    };
  }

  if (fields.profileId && BII_URN.test(fields.profileId)) {
    return {
      profileId: BII_PROFILE_ID,
      confidence: "likely",
      signals,
      customizationId: fields.customizationId,
      profileIdValue: fields.profileId,
    };
  }

  if (profiles?.length) {
    for (const profile of profiles) {
      if (profile.id === OASIS_PROFILE_ID) {
        continue;
      }
      if (matchesProfileDefinition(fields, profile)) {
        return {
          profileId: profile.id,
          confidence: "likely",
          signals,
          customizationId: fields.customizationId,
          profileIdValue: fields.profileId,
        };
      }
    }
  }

  return {
    profileId: OASIS_PROFILE_ID,
    confidence: "fallback",
    signals,
    customizationId: fields.customizationId,
    profileIdValue: fields.profileId,
  };
}

function matchesProfileDefinition(
  fields: ReturnType<typeof extractUblHeaderFields>,
  profile: ValidationProfile,
): boolean {
  const { match } = profile;
  if (match.xmlNamespaces?.some((ns) => fields.xmlNamespaces.some((x) => x.includes(ns)))) {
    return true;
  }
  if (
    fields.customizationId &&
    match.customizationIdPatterns?.some((p) => new RegExp(p, "i").test(fields.customizationId!))
  ) {
    return true;
  }
  if (
    fields.profileId &&
    match.profileIdPatterns?.some((p) => new RegExp(p, "i").test(fields.profileId!))
  ) {
    return true;
  }
  if (fields.hasCufeScheme && match.uuidSchemePatterns?.length) {
    return true;
  }
  return false;
}

export function resolveProfileId(
  option: string | undefined,
  detected: ProfileDetectionResult,
): string | null {
  if (!option || option === "auto") {
    return detected.profileId === OASIS_PROFILE_ID ? null : detected.profileId;
  }
  if (option === "none") {
    return null;
  }
  return option;
}

export { OASIS_PROFILE_ID, DIAN_PROFILE_ID, PEPPOL_PROFILE_ID };
