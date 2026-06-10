import type { ValidationIssue } from "../../types.js";
import { validateCrypto, type CryptoStageOptions } from "../../crypto/index.js";

export async function runCryptoStage(
  xml: string,
  options: CryptoStageOptions,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  return validateCrypto(xml, options);
}
