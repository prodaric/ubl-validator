import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
export const dianFixturesRoot = path.join(testsRoot, "fixtures", "dian");
export const dianXmlRoot = path.join(dianFixturesRoot, "xml");

export function dianFixturesAvailable(): boolean {
  return existsSync(path.join(dianFixturesRoot, "SOURCE.json")) && existsSync(dianXmlRoot);
}

export function listDianXmlFixtures(): string[] {
  if (!dianFixturesAvailable()) {
    return [];
  }

  const files: string[] = [];
  function walk(dir: string, prefix = "") {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else if (entry.name.toLowerCase().endsWith(".xml")) {
        files.push(rel);
      }
    }
  }
  walk(dianXmlRoot);
  return files.sort();
}

export function readDianXmlFixture(relativePath: string): string {
  return readFileSync(path.join(dianXmlRoot, relativePath), "utf8");
}

export const DIAN_CORE_FIXTURES = [
  "Consumidor Final.xml",
  "CreditNote.xml",
  "DebitNote.xml",
  "Excluido de IVA.xml",
] as const;
