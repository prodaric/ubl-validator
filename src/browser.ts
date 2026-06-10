import { configureSchemaReader } from "./schema-reader/index.js";
import type { SchemaReader } from "./types.js";

export * from "./index.js";

export class FetchSchemaReader implements SchemaReader {
  constructor(private readonly baseUrl: string) {}

  async readText(relativePath: string): Promise<string> {
    const base = this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`;
    const url = new URL(relativePath.replace(/^\//, ""), base);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load schema ${url}: ${response.status}`);
    }
    return response.text();
  }
}

export function configureBrowserSchemas(baseUrl: string): FetchSchemaReader {
  const reader = new FetchSchemaReader(baseUrl);
  configureSchemaReader(reader);
  return reader;
}
