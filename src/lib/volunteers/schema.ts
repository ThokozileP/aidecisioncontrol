import { z } from 'zod';
import { volunteerRoles } from '../../data/volunteerRoles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_TITLES = volunteerRoles.map((role) => role.title) as [string, ...string[]];

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ACCEPTED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const volunteerApplicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .refine((value) => EMAIL_PATTERN.test(value), 'Enter a valid email address'),
  linkedin: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default('')
    .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), {
      message: 'Enter a valid URL (starting with https://)',
    }),
  role: z.enum(ROLE_TITLES, { message: 'Select a valid role' }),
  motivation: z.string().trim().min(1, 'Tell us why you want to volunteer').max(4000),
});

export type VolunteerApplicationInput = z.infer<typeof volunteerApplicationSchema>;

/**
 * CV files can't go through the zod object above (`request.formData()`
 * fields and the `File` value are validated separately in the route, so a
 * missing/oversized/wrong-type file gets its own precise status code —
 * 400/415/413 — instead of a generic zod issue list). Extension is the
 * authoritative check; `file.type` is browser/OS-reported and known to be
 * empty or generic for some setups, so it's only used to reject an
 * explicit mismatch, never to reject an empty one.
 */
export function isAcceptedCvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_CV_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasAcceptedExtension) return false;
  if (file.type && file.type !== 'application/octet-stream' && !ACCEPTED_CV_TYPES.includes(file.type)) {
    return false;
  }
  return true;
}
