import { spawnSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(root, "dist/cli/main.js");
const trivialFixture = path.join(
  root,
  "schemas/vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml",
);

function runCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    cwd: root,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("ubl-validate CLI", () => {
  it("exits 2 when no file argument", () => {
    const { status, stderr } = runCli([]);
    expect(status).toBe(2);
    expect(stderr).toMatch(/Usage:/);
  });

  it("validates OASIS Trivial Invoice as VALID with profile none", () => {
    const { status, stdout } = runCli([trivialFixture, "--profile", "none"]);
    expect(status).toBe(0);
    expect(stdout).toContain("VALID");
    expect(stdout).toContain("documentType: Invoice");
  });

  it("emits JSON report with stages", () => {
    const { status, stdout } = runCli([trivialFixture, "--profile", "none", "--json-report"]);
    expect(status).toBe(0);
    const report = JSON.parse(stdout) as { valid: boolean; stages?: Record<string, unknown> };
    expect(report.valid).toBe(true);
    expect(report.stages?.schema).toBeDefined();
  });

  it("exits 1 on invalid XML", () => {
    const tmp = path.join(root, "tests/fixtures/invalid-not-ubl.xml");
    writeFileSync(tmp, "<root/>", "utf8");
    try {
      const { status } = runCli([tmp]);
      expect(status).toBe(1);
    } finally {
      if (existsSync(tmp)) {
        unlinkSync(tmp);
      }
    }
  });
});
