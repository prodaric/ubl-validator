export {
  detectProfileFromSignals,
  extractUblHeaderFields,
  resolveProfileId,
  OASIS_PROFILE_ID,
  DIAN_PROFILE_ID,
  PEPPOL_PROFILE_ID,
} from "../detect-profile.js";
export type { ProfileMatchInput } from "../detect-profile.js";
export { getProfile, listProfiles, loadProfileRegistry } from "./registry.js";
export { runProfileStage } from "../pipeline/stages/profile-stage.js";
