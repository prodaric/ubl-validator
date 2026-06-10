import { describe, expect, it } from "vitest";
import { resolveProfileId } from "../src/detect-profile.js";
import { getProfile, listProfiles, loadProfileRegistry } from "../src/profile/registry.js";

describe("profile registry", () => {
  it("loads bundled profiles", () => {
    const registry = loadProfileRegistry();
    expect(registry.profiles.length).toBeGreaterThanOrEqual(4);
    expect(getProfile("dian-fe-1.9")?.schematron.length).toBeGreaterThan(0);
  });

  it("listProfiles includes DIAN and OASIS entries", () => {
    const profiles = listProfiles();
    expect(profiles.some((p) => p.id === "dian-fe-1.9")).toBe(true);
    expect(profiles.some((p) => p.id === "oasis-ubl-2.1")).toBe(true);
  });

  it("resolveProfileId honors none and auto", () => {
    const detected = {
      profileId: "dian-fe-1.9",
      confidence: "certain" as const,
      signals: [],
    };
    expect(resolveProfileId("none", detected)).toBeNull();
    expect(resolveProfileId("auto", detected)).toBe("dian-fe-1.9");
    expect(resolveProfileId("dian-fe-1.9", detected)).toBe("dian-fe-1.9");
  });
});
