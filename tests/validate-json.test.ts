import { beforeAll, describe, expect, it } from "vitest";
import { validate, validateJson } from "../src/index.js";
import { preloadJsonValidators } from "../src/validate-json.js";
import { invoiceJson, invoiceJsonObject } from "./helpers/fixtures.js";
import { expectInvalidUblResult, expectValidUblResult } from "./helpers/assertions.js";

describe("validateJson", () => {
  beforeAll(async () => {
    await preloadJsonValidators(["Invoice"]);
  });

  it("validates official Invoice JSON example from string and object", async () => {
    const fromString = await validateJson(invoiceJson, "Invoice");
    expectValidUblResult(fromString, { documentType: "Invoice", format: "json" });

    const fromObject = await validate(invoiceJsonObject, { format: "json" });
    expectValidUblResult(fromObject, { documentType: "Invoice", format: "json" });
  });

  it("reports missing required root property", async () => {
    const parsed = structuredClone(invoiceJsonObject);
    delete parsed.Invoice;
    const result = await validate(parsed, { format: "json", documentType: "Invoice" });
    expectInvalidUblResult(result);
    expect(result.errors.some((issue) => issue.rule === "required")).toBe(true);
  });

  it("reports invalid JSON syntax", async () => {
    const result = await validateJson("{ invalid", "Invoice");
    expectInvalidUblResult(result);
    expect(result.errors[0]?.rule).toBe("JSON_PARSE");
  });

  it("returns explicit error for unsupported legacy variant", async () => {
    const result = await validateJson(invoiceJsonObject, "Invoice", { jsonVariant: "legacy" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]?.rule).toBe("UNSUPPORTED");
  });
});
