import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SchemaReader } from "../types.js";

const packageRoot = path.resolve(
  fileURLToPath(import.meta.url),
  "../../../",
);

export const schemasRoot = path.join(packageRoot, "schemas");

export class NodeSchemaReader implements SchemaReader {
  readText(relativePath: string): string {
    return readFileSync(path.join(schemasRoot, relativePath), "utf8");
  }
}
