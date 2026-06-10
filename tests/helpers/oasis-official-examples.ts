import type { RegistryDocument } from "../../src/types.js";
import { documentsWithOfficialExamples } from "./fixtures.js";
import { OFFICIAL_JSON_FIXTURE_GAPS } from "./known-fixture-gaps.js";

/** Número de pares XML+JSON oficiales OASIS indexados en el registry. */
export const OASIS_OFFICIAL_EXAMPLE_COUNT = 33;

export interface OasisOfficialExample extends RegistryDocument {
  exampleXml: string;
  exampleJson: string;
}

export function getOasisOfficialExamples(): OasisOfficialExample[] {
  const examples = documentsWithOfficialExamples() as OasisOfficialExample[];
  return [...examples].sort((a, b) => a.documentType.localeCompare(b.documentType));
}

export function getOasisOfficialExample(documentType: string): OasisOfficialExample {
  const example = getOasisOfficialExamples().find((entry) => entry.documentType === documentType);
  if (!example) {
    throw new Error(`No OASIS official example registered for "${documentType}"`);
  }
  return example;
}

export function getOasisJsonValidExamples(): OasisOfficialExample[] {
  return getOasisOfficialExamples().filter(
    (entry) => !OFFICIAL_JSON_FIXTURE_GAPS.has(entry.documentType),
  );
}

export function getOasisJsonFixtureGaps(): OasisOfficialExample[] {
  return getOasisOfficialExamples().filter((entry) =>
    OFFICIAL_JSON_FIXTURE_GAPS.has(entry.documentType),
  );
}

export function oasisExampleCases(): Array<[string, string, string]> {
  return getOasisOfficialExamples().map((entry) => [
    entry.documentType,
    entry.exampleXml,
    entry.exampleJson,
  ]);
}
