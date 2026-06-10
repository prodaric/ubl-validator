import type { ValidateOptions, ValidationIssue } from "../types.js";
import { validate } from "../validate.js";

export interface UblValidationErrors {
  ubl: {
    valid: false;
    issues: ValidationIssue[];
  };
}

export function mapIssuesToFormErrors(issues: ValidationIssue[]): UblValidationErrors | null {
  if (issues.length === 0) {
    return null;
  }
  return {
    ubl: {
      valid: false,
      issues,
    },
  };
}

export function filterIssuesByPath(
  issues: ValidationIssue[],
  fieldPath: string,
): ValidationIssue[] {
  const normalized = fieldPath.startsWith("/") ? fieldPath : `/${fieldPath}`;
  return issues.filter(
    (issue) => issue.path === normalized || issue.path?.startsWith(`${normalized}/`),
  );
}

export interface UblAsyncValidatorControl {
  value: unknown;
}

export type UblAsyncValidatorFn = (
  control: UblAsyncValidatorControl,
) => Promise<UblValidationErrors | null>;

export function createUblAsyncValidator(
  options: ValidateOptions = {},
): UblAsyncValidatorFn {
  return async (control) => {
    const { value } = control;
    if (value == null || value === "") {
      return null;
    }

    const input =
      typeof value === "string" || (typeof value === "object" && !Array.isArray(value))
        ? (value as string | Record<string, unknown>)
        : JSON.stringify(value);

    const result = await validate(input, options);
    return mapIssuesToFormErrors(result.errors);
  };
}

export function createUblFieldAsyncValidator(
  options: ValidateOptions & { fieldPath: string },
): UblAsyncValidatorFn {
  const { fieldPath, ...validateOptions } = options;
  return async (control) => {
    const validator = createUblAsyncValidator(validateOptions);
    const errors = await validator(control);
    if (!errors) {
      return null;
    }
    const scoped = filterIssuesByPath(errors.ubl.issues, fieldPath);
    return mapIssuesToFormErrors(scoped);
  };
}

/**
 * Adapter for Angular `AsyncValidatorFn` when `@angular/forms` is available.
 */
export function toAngularAsyncValidator(fn: UblAsyncValidatorFn) {
  return fn;
}
