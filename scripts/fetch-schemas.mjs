#!/usr/bin/env node
/**
 * Descarga artefactos oficiales OASIS UBL 2.1 (XSD) y UBL 2.1 JSON v2.0 (JSON Schema model).
 * Extrae solo los directorios necesarios bajo schemas/vendor/.
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const vendorDir = path.join(root, "schemas", "vendor");
const tmpDir = path.join(root, ".tmp-schemas");

const SOURCES = [
  {
    id: "ubl-2.1",
    url: "https://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.zip",
    zipName: "UBL-2.1.zip",
    extractPrefix: "",
    targetSubdir: "ubl-2.1",
    paths: ["xsd/common", "xsd/maindoc", "xml"],
  },
  {
    id: "ubl-2.1-json-v2.0",
    url: "https://docs.oasis-open.org/ubl/UBL-2.1-JSON/v2.0/cn01/UBL-2.1-JSON-v2.0-cn01.zip",
    zipName: "UBL-2.1-JSON-v2.0-cn01.zip",
    extractPrefix: "",
    targetSubdir: "ubl-2.1-json-v2.0",
    paths: ["json-schema-model/common", "json-schema-model/maindoc", "json-model"],
  },
];

async function sha256File(filePath) {
  const { createReadStream } = await import("node:fs");
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });
}

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }
  await pipeline(response.body, createWriteStream(dest));
}

function unzipSelective(zipPath, destDir, innerPaths) {
  for (const inner of innerPaths) {
    const result = spawnSync("unzip", ["-o", zipPath, `${inner}/*`, "-d", destDir], {
      stdio: "inherit",
    });
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(`unzip failed for ${inner} in ${zipPath}`);
    }
  }
}

async function main() {
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  await mkdir(vendorDir, { recursive: true });

  const versionMeta = { fetchedAt: new Date().toISOString(), sources: [] };

  for (const source of SOURCES) {
    const zipPath = path.join(tmpDir, source.zipName);
    const extractRoot = path.join(tmpDir, source.id);
    const targetRoot = path.join(vendorDir, source.targetSubdir);

    console.log(`\n→ Downloading ${source.id}…`);
    await download(source.url, zipPath);
    const sha256 = await sha256File(zipPath);

    await mkdir(extractRoot, { recursive: true });
    console.log(`→ Extracting ${source.paths.join(", ")}…`);
    unzipSelective(zipPath, extractRoot, source.paths);

    await rm(targetRoot, { recursive: true, force: true });
    await mkdir(targetRoot, { recursive: true });

    for (const inner of source.paths) {
      const src = path.join(extractRoot, inner);
      const dest = path.join(targetRoot, inner);
      const { cp } = await import("node:fs/promises");
      await cp(src, dest, { recursive: true });
    }

    versionMeta.sources.push({
      id: source.id,
      url: source.url,
      sha256,
      paths: source.paths,
    });
    console.log(`✓ ${source.id} → ${targetRoot}`);
  }

  await writeFile(
    path.join(vendorDir, "VERSION.json"),
    JSON.stringify(versionMeta, null, 2) + "\n",
  );

  await rm(tmpDir, { recursive: true, force: true });
  console.log("\nDone. Run: npm run schemas:registry");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
