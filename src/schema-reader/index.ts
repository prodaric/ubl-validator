import type { SchemaReader } from "../types.js";
import { NodeSchemaReader } from "./node-reader.js";

let activeReader: SchemaReader = new NodeSchemaReader();

export function configureSchemaReader(reader: SchemaReader): void {
  activeReader = reader;
}

export function getSchemaReader(): SchemaReader {
  return activeReader;
}

export async function readSchemaText(relativePath: string): Promise<string> {
  const content = activeReader.readText(relativePath);
  return content instanceof Promise ? content : Promise.resolve(content);
}

export { NodeSchemaReader, schemasRoot } from "./node-reader.js";
