/**
 * A volunteer application for one of the roles listed on /careers
 * (`src/data/volunteerRoles.ts`). This is a one-shot submission — unlike
 * `MembershipRecord`, there's no multi-stage lifecycle to track, so the
 * record is written once and never updated in place.
 */
export interface VolunteerApplicationRecord {
  applicantId: string;
  name: string;
  email: string;
  linkedin: string;
  role: string;
  motivation: string;
  /** R2 object key the CV was uploaded to (see `VOLUNTEER_CVS` bucket in wrangler.toml). */
  cvFileKey: string;
  submittedAt: string;
}
