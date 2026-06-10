import { describe, expect, it } from "vitest";
import {
  createUblAsyncValidator,
  createUblFieldAsyncValidator,
  filterIssuesByPath,
  mapIssuesToFormErrors,
} from "../src/angular/index.js";
import type { ValidationIssue } from "../src/types.js";
import { getOasisOfficialExample } from "./helpers/oasis-official-examples.js";
import { readJsonFixture } from "./helpers/fixtures.js";

describe("angular adapters", () => {
  const sampleIssues: ValidationIssue[] = [
    { rule: "required", message: "Missing ID", severity: "error", path: "/Invoice/ID" },
    { rule: "type", message: "Bad date", severity: "error", path: "/Invoice/IssueDate" },
  ];

  it("maps issues to Angular-compatible validation errors", () => {
    expect(mapIssuesToFormErrors([])).toBeNull();
    expect(mapIssuesToFormErrors(sampleIssues)).toEqual({
      ubl: { valid: false, issues: sampleIssues },
    });
  });

  it("filters issues by JSON pointer prefix", () => {
    expect(filterIssuesByPath(sampleIssues, "Invoice/ID")).toHaveLength(1);
    expect(filterIssuesByPath(sampleIssues, "/Invoice")).toHaveLength(2);
    expect(filterIssuesByPath(sampleIssues, "/Order")).toHaveLength(0);
  });

  it("createUblAsyncValidator returns null for empty controls", async () => {
    const validator = createUblAsyncValidator({ format: "json", documentType: "Invoice" });
    await expect(validator({ value: null })).resolves.toBeNull();
    await expect(validator({ value: "" })).resolves.toBeNull();
  });

  it("createUblAsyncValidator validates UBL JSON documents", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const invoiceJsonObject = readJsonFixture<Record<string, unknown>>(invoice.exampleJson);
    const validator = createUblAsyncValidator({ format: "json", documentType: "Invoice" });
    await expect(validator({ value: invoiceJsonObject })).resolves.toBeNull();
  });

  it("createUblFieldAsyncValidator scopes errors to a document section", async () => {
    const invoiceExample = getOasisOfficialExample("Invoice");
    const broken = structuredClone(readJsonFixture<Record<string, unknown>>(invoiceExample.exampleJson));
    const invoicePayload = (broken.Invoice ?? {}) as Record<string, unknown>;
    delete invoicePayload.ID;
    broken.Invoice = invoicePayload;

    const validator = createUblFieldAsyncValidator({
      format: "json",
      documentType: "Invoice",
      fieldPath: "/Invoice",
    });

    const errors = await validator({ value: broken });
    expect(errors).not.toBeNull();
    expect(errors?.ubl.issues.length).toBeGreaterThan(0);
    expect(errors?.ubl.issues.every((issue) => issue.path?.startsWith("/Invoice"))).toBe(true);
  });
});
