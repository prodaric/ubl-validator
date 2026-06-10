import { describe, expect, it } from "vitest";
import { validateIndRules } from "../src/pipeline/stages/ind-rules-stage.js";

describe("IndRulesStage", () => {
  it("IND2 requires encoding in XML declaration", () => {
    const xml = `<?xml version="1.0"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">1</cbc:ID></Invoice>`;
    const result = validateIndRules(xml);
    expect(result.errors.some((e) => e.code === "IND2_ENCODING_REQUIRED")).toBe(true);
  });

  it("IND5 rejects empty self-closing elements outside ExtensionContent", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"/></Invoice>`;
    const result = validateIndRules(xml);
    expect(result.errors.some((e) => e.code === "IND5_EMPTY_ELEMENT")).toBe(true);
  });

  it("IND3 warns on non-UTF-8 encoding", () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">1</cbc:ID></Invoice>`;
    const result = validateIndRules(xml);
    expect(result.warnings.some((e) => e.code === "IND3_ENCODING_SHOULD_UTF8")).toBe(true);
  });

  it("IND7 flags duplicate languageID on sibling Notes", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><Notes xmlns="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"><cbc:Note languageID="en" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">A</cbc:Note><cbc:Note languageID="en" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">B</cbc:Note></Notes></Invoice>`;
    const result = validateIndRules(xml);
    expect(result.errors.some((e) => e.code === "IND7_DUPLICATE_LANGUAGE_ID")).toBe(true);
  });

  it("IND8 requires languageID when multiple sibling Notes", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><Notes xmlns="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"><cbc:Note xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">A</cbc:Note><cbc:Note xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">B</cbc:Note></Notes></Invoice>`;
    const result = validateIndRules(xml);
    expect(result.errors.some((e) => e.code === "IND8_MISSING_LANGUAGE_ID")).toBe(true);
  });
});
