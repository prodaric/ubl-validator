#!/usr/bin/env node
/**
 * DIAN XSD/Schematron artifacts for profile dian-fe-1.9.
 * Creates minimal Schematron rules for pipeline tests when official .sch are unavailable.
 */
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "schemas/vendor/dian-fe-1.9");
const DIAN_ZIP_URL =
  "https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/documentacion-tecnica/Caja-de-herramientas-FE-V19-V2026.zip";

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  await pipeline(res.body, createWriteStream(dest));
}

function ensureMinimalArtifacts() {
  mkdirSync(path.join(outDir, "schematron"), { recursive: true });
  mkdirSync(path.join(outDir, "xsd"), { recursive: true });

  const invoiceSch = path.join(outDir, "schematron/UBL-Invoice-DIAN.sch");
  if (!existsSync(invoiceSch)) {
    writeFileSync(
      invoiceSch,
      `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="dian-invoice">
    <rule context="/*[local-name()='Invoice']">
      <assert test="exists(//*[local-name()='DianExtensions'])">DIAN: Invoice must contain DianExtensions.</assert>
      <assert test="exists(//*[local-name()='CustomizationID'])">DIAN: CustomizationID is required.</assert>
      <assert test="exists(//*[local-name()='ProfileID'])">DIAN: ProfileID is required.</assert>
      <assert test="exists(//*[local-name()='UUID'])">DIAN: UUID (CUFE) is required.</assert>
    </rule>
  </pattern>
</schema>
`,
      "utf8",
    );
  }

  for (const doc of ["CreditNote", "DebitNote"]) {
    const p = path.join(outDir, `schematron/UBL-${doc}-DIAN.sch`);
    if (!existsSync(p)) {
      writeFileSync(
        p,
        `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="dian-${doc.toLowerCase()}">
    <rule context="/*[local-name()='${doc}']">
      <assert test="exists(//*[local-name()='DianExtensions'])">DIAN: ${doc} must contain DianExtensions.</assert>
    </rule>
  </pattern>
</schema>
`,
        "utf8",
      );
    }
  }

  const xsdPath = path.join(outDir, "xsd/DIAN-Structures-2.1.xsd");
  if (!existsSync(xsdPath)) {
    writeFileSync(
      xsdPath,
      `<?xml version="1.0" encoding="UTF-8"?>
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            targetNamespace="dian:gov:co:facturaelectronica:Structures-2-1"
            elementFormDefault="qualified">
  <xsd:element name="DianExtensions" type="xsd:anyType"/>
</xsd:schema>
`,
      "utf8",
    );
  }
}

async function main() {
  ensureMinimalArtifacts();
  const zipPath = path.join(outDir, "caja-fe.zip");
  try {
    console.log("Downloading DIAN Caja FE v1.9…");
    await download(DIAN_ZIP_URL, zipPath);
    console.log("DIAN ZIP saved.");
  } catch (e) {
    console.warn("DIAN ZIP download skipped:", e.message);
    console.warn("Minimal Schematron/XSD placeholders created for development.");
  }
  writeFileSync(
    path.join(outDir, "SOURCE.json"),
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        url: DIAN_ZIP_URL,
        note: "Minimal schematron rules bundled for pipeline tests.",
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log("DIAN profile artifacts ready under schemas/vendor/dian-fe-1.9/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
