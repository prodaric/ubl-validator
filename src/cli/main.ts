#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../index.js";

const args = process.argv.slice(2);
const jsonReport = args.includes("--json-report");
const crypto = args.includes("--crypto");
const codelist = args.includes("--codelist");

function getArg(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const profileOpt = getArg("--profile") ?? "auto";
const formatOpt = getArg("--format");
const documentTypeOpt = getArg("--document-type");
const filePath = args.find((a) => !a.startsWith("--") && a !== formatOpt && a !== documentTypeOpt && a !== profileOpt);

if (!filePath) {
  console.error("Usage: ubl-validate <file.xml|file.json> [--profile auto|none|ID] [--crypto] [--json-report]");
  process.exit(2);
}

const text = readFileSync(path.resolve(filePath), "utf8");
const result = await validate(text, {
  format: formatOpt === "xml" || formatOpt === "json" ? formatOpt : "auto",
  documentType: documentTypeOpt,
  profile: profileOpt,
  crypto,
  codelist,
});

if (jsonReport) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(result.valid ? "VALID" : "INVALID");
  console.log(`documentType: ${result.documentType} format: ${result.format}`);
  if (result.meta?.profileDetected) {
    console.log(`profile: ${result.meta.profileDetected} (${result.meta.profileConfidence})`);
  }
  for (const issue of [...result.errors, ...result.warnings]) {
    console.log(`[${issue.severity}] ${issue.stage ?? ""} ${issue.source ?? ""} ${issue.message}`);
  }
}

process.exit(result.valid ? 0 : 1);
