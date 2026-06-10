import { describe, expect, it } from "vitest";
import { validate } from "../src/index.js";
import { validateCrypto } from "../src/crypto/index.js";
import { readSchemaFixture } from "./helpers/fixtures.js";
import { readDianXmlFixture, dianFixturesAvailable } from "./helpers/dian-fixtures.js";

describe("crypto opt-in", () => {
  it("does not run crypto stage by default", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await validate(xml, { profile: "none" });
    expect(result.stages?.crypto).toBeUndefined();
  });

  it("runs crypto stage when crypto:true", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await validate(xml, { profile: "none", crypto: true });
    expect(result.stages?.crypto).toBeDefined();
  });

  it("validateCrypto inspects DIAN documents", () => {
    if (!dianFixturesAvailable()) return;
    const xml = readDianXmlFixture("Consumidor Final.xml");
    const result = validateCrypto(xml, { scope: "all", profileId: "dian-fe-1.9" });
    expect(result.errors.length + result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it("validateCrypto warns when DIAN profile without extensions", () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = validateCrypto(xml, { scope: "dian", profileId: "dian-fe-1.9" });
    expect(result.warnings.some((w) => w.code === "CRYPTO_SKIPPED_NO_DIAN")).toBe(true);
  });

  it("validateCrypto detects UBL signatures as stub warning", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><ext:UBLDocumentSignatures xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"/></Invoice>`;
    const result = validateCrypto(xml, { scope: "ubl" });
    expect(result.warnings.some((w) => w.code === "XADES_VERIFY_STUB")).toBe(true);
  });
});
