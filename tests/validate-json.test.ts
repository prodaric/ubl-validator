import { beforeAll, describe, expect, it } from "vitest";
import { validate, validateJson } from "../src/index.js";
import { preloadJsonValidators } from "../src/validate-json.js";
import { getOasisOfficialExample } from "./helpers/oasis-official-examples.js";
import { readJsonFixture } from "./helpers/fixtures.js";
import { expectInvalidUblResult } from "./helpers/assertions.js";

describe("validateJson", () => {
  beforeAll(async () => {
    await preloadJsonValidators(["Invoice"]);
  });

  it("reports missing required root property", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const parsed = readJsonFixture<Record<string, unknown>>(invoice.exampleJson);
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
    const invoice = getOasisOfficialExample("Invoice");
    const parsed = readJsonFixture<Record<string, unknown>>(invoice.exampleJson);
    const result = await validateJson(parsed, "Invoice", { jsonVariant: "legacy" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]?.rule).toBe("UNSUPPORTED");
  });
});
