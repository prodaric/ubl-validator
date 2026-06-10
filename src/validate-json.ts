import Ajv2020 from "ajv";
import type { ValidateFunction } from "ajv";
import path from "node:path";
import { getRegistryDocument } from "./registry/index.js";
import { readSchemaText, schemasRoot } from "./schema-reader/index.js";
import type { ValidateOptions, ValidationIssue } from "./types.js";
import { UBL_VERSION } from "./types.js";
import { mapAjvErrors } from "./errors/map-ajv-errors.js";
import { ErrorCodes } from "./errors/codes.js";

const Ajv = Ajv2020.default ?? Ajv2020;

const validatorCache = new Map<string, Promise<ValidateFunction>>();

function jsonModelRootFor(documentType: string): string {
  const entry = getRegistryDocument(documentType);
  return path.dirname(path.join(schemasRoot, entry.jsonModel));
}

async function loadReferencedSchema(uri: string, documentType: string): Promise<object> {
  const maindocDir = jsonModelRootFor(documentType);
  const jsonModelRoot = path.dirname(maindocDir);
  const filePath = path.normalize(path.join(jsonModelRoot, uri.split("#")[0]));
  const relative = path.relative(schemasRoot, filePath).split(path.sep).join("/");
  const text = await readSchemaText(relative);
  return JSON.parse(text) as object;
}

async function compileJsonValidator(documentType: string): Promise<ValidateFunction> {
  const cached = validatorCache.get(documentType);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const entry = getRegistryDocument(documentType);
    const schemaText = await readSchemaText(entry.jsonModel);
    const schema = JSON.parse(schemaText) as object;

    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: false,
      loadSchema: (uri: string) => loadReferencedSchema(uri, documentType),
    });

    return ajv.compileAsync(schema);
  })();

  validatorCache.set(documentType, promise);
  return promise;
}

export async function preloadJsonValidators(documentTypes: string[]): Promise<void> {
  await Promise.all(documentTypes.map((type) => compileJsonValidator(type)));
}

export function clearJsonValidatorCache(): void {
  validatorCache.clear();
}

export async function validateJsonDocument(
  value: string | Record<string, unknown>,
  documentType: string,
  options?: Pick<ValidateOptions, "jsonVariant">,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  if (options?.jsonVariant === "legacy") {
    return {
      errors: [
        {
          rule: ErrorCodes.UNSUPPORTED,
          code: ErrorCodes.UNSUPPORTED,
          message: 'JSON variant "legacy" is not supported yet. Use jsonVariant: "model".',
          severity: "error",
          stage: "schema",
          source: "oasis-json",
        },
      ],
      warnings: [],
    };
  }

  let parsed: unknown;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        errors: [
          {
            rule: ErrorCodes.JSON_PARSE,
            code: ErrorCodes.JSON_PARSE,
            message,
            severity: "error",
            stage: "schema",
            source: "oasis-json",
          },
        ],
        warnings: [],
      };
    }
  } else {
    parsed = value;
  }

  const validateFn = await compileJsonValidator(documentType);
  const valid = validateFn(parsed) as boolean;

  return {
    errors: valid ? [] : mapAjvErrors(validateFn.errors ?? [], "schema"),
    warnings: [],
  };
}

/** @deprecated Use validate() pipeline; kept for direct JSON Schema access. */
export async function validateJson(
  value: string | Record<string, unknown>,
  documentType: string,
  options?: Pick<ValidateOptions, "jsonVariant">,
) {
  const { errors, warnings } = await validateJsonDocument(value, documentType, options);
  return {
    valid: errors.length === 0,
    documentType,
    ublVersion: UBL_VERSION,
    format: "json" as const,
    errors,
    warnings,
  };
}
