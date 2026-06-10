import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProfileRegistry, ValidationProfile } from "../types.js";
import { OASIS_PROFILE_ID } from "../detect-profile.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const profilesRegistryPath = path.join(packageRoot, "schemas/profiles/registry.json");

let cachedRegistry: ProfileRegistry | null = null;

const DEFAULT_OASIS_PROFILE: ValidationProfile = {
  id: OASIS_PROFILE_ID,
  label: "OASIS UBL 2.1 base",
  match: {},
  schematron: [],
  documentTypes: [],
};

export function loadProfileRegistry(): ProfileRegistry {
  if (cachedRegistry) {
    return cachedRegistry;
  }
  try {
    const text = readFileSync(profilesRegistryPath, "utf8");
    cachedRegistry = JSON.parse(text) as ProfileRegistry;
    return cachedRegistry;
  } catch {
    cachedRegistry = {
      generatedAt: new Date(0).toISOString(),
      profiles: [DEFAULT_OASIS_PROFILE],
    };
    return cachedRegistry;
  }
}

export function getProfile(profileId: string): ValidationProfile | undefined {
  return loadProfileRegistry().profiles.find((p) => p.id === profileId);
}

export function listProfiles(): ValidationProfile[] {
  return loadProfileRegistry().profiles;
}

export function setProfileRegistry(registry: ProfileRegistry): void {
  cachedRegistry = registry;
}

export function resetProfileRegistryCache(): void {
  cachedRegistry = null;
}

export { profilesRegistryPath };
