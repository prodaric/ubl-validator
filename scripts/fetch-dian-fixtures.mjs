#!/usr/bin/env node
/**
 * Mantenimiento: descarga la Caja de herramientas FE v1.9 (DIAN) y actualiza
 * tests/fixtures/dian/ (empaquetado en git). CI no usa este script.
 * Fuente: https://www.dian.gov.co/impuestos/factura-electronica/
 */
import { createWriteStream } from "node:fs";
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tmpDir = path.join(root, ".tmp-dian");
const targetDir = path.join(root, "tests", "fixtures", "dian", "xml");

const DIAN_TOOLBOX_URL =
  "https://www.dian.gov.co/impuestos/factura-electronica/Documents/Caja-de-herramientas-FE-V19-V2026.zip";

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }
  await pipeline(response.body, createWriteStream(dest));
}

function sanitizeFilename(name) {
  return name.normalize("NFC").replace(/[^\w.\- ()áéíóúÁÉÍÓÚñÑ]/g, "_");
}

async function main() {
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  await mkdir(targetDir, { recursive: true });

  const zipPath = path.join(tmpDir, "caja-dian-v19.zip");
  console.log("→ Downloading DIAN Caja de herramientas v1.9…");
  await download(DIAN_TOOLBOX_URL, zipPath);

  const extractDir = path.join(tmpDir, "extracted");
  await mkdir(extractDir, { recursive: true });
  const unzip = spawnSync("unzip", ["-q", zipPath, "-d", extractDir], { stdio: "inherit" });
  if (unzip.status !== 0) {
    throw new Error("unzip failed");
  }


  function findXmlDir(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "XMLs de ejemplo") {
          return full;
        }
        const nested = findXmlDir(full);
        if (nested) return nested;
      }
    }
    return null;
  }

  const xmlSourceDir = findXmlDir(extractDir);
  if (!xmlSourceDir) {
    throw new Error("Could not locate 'XMLs de ejemplo' in DIAN toolbox");
  }

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });

  const copied = [];
  function copyXmlTree(source, relative = "") {
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      const srcPath = path.join(source, entry.name);
      const relPath = path.join(relative, sanitizeFilename(entry.name));
      const destPath = path.join(targetDir, relPath);
      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        copyXmlTree(srcPath, relPath);
      } else if (entry.name.toLowerCase().endsWith(".xml")) {
        cpSync(srcPath, destPath);
        copied.push(relPath);
      }
    }
  }

  copyXmlTree(xmlSourceDir);

  const meta = {
    source: DIAN_TOOLBOX_URL,
    fetchedAt: new Date().toISOString(),
    documentVersion: "Anexo técnico FE v1.9 (caja v2026)",
    xmlCount: copied.length,
    files: copied.sort(),
    note:
      "Ejemplificaciones oficiales DIAN. Validación actual del paquete: estructura UBL 2.1 OASIS (XSD). Reglas DIAN (Schematron/XSD extensions) son fase posterior.",
  };

  await writeFile(
    path.join(root, "tests", "fixtures", "dian", "SOURCE.json"),
    JSON.stringify(meta, null, 2) + "\n",
  );

  await rm(tmpDir, { recursive: true, force: true });
  console.log(`✓ ${copied.length} XML fixtures → ${targetDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
