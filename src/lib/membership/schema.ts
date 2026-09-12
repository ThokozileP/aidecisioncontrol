import { z } from 'zod';
import {
  SECTORS,
  AREAS_OF_WORK,
  AI_EXPERIENCE_LEVELS,
  INTERESTS,
  MEMBERSHIP_GAINS,
  CONTRIBUTIONS,
  MAX_INTERESTS,
} from './options';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .refine((value) => EMAIL_PATTERN.test(value), 'Enter a valid email address'),
  country: z.string().trim().min(1, 'Country is required'),
  organisation: z.string().trim().min(1, 'Organisation is required').max(160),
  jobTitle: z.string().trim().max(160).optional().default(''),
  linkedIn: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default('')
    .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), {
      message: 'Enter a valid URL (starting with https://)',
    }),
});

export const professionalBackgroundSchema = z.object({
  sector: z.enum(SECTORS, { message: 'Select a sector' }),
  areasOfWork: z
    .array(z.enum(AREAS_OF_WORK))
    .min(1, 'Select at least one area of work'),
  aiExperience: z.enum(AI_EXPERIENCE_LEVELS).optional(),
});

export const interestsSchema = z.object({
  interests: z
    .array(z.enum(INTERESTS))
    .min(1, 'Select at least one interest')
    .max(MAX_INTERESTS, `Select up to ${MAX_INTERESTS} interests`),
  gains: z.array(z.enum(MEMBERSHIP_GAINS)).min(1, 'Select at least one'),
  contributions: z.array(z.enum(CONTRIBUTIONS)).min(1, 'Select at least one'),
});

export const agreementSchema = z.object({
  agreeToTerms: z.literal(true, { message: 'You must agree to the membership terms' }),
  agreeToPrivacy: z.literal(true, { message: 'You must agree to the privacy terms' }),
  wantsUpdates: z.boolean().optional().default(false),
});

export const membershipApplicationSchema = personalInfoSchema
  .extend(professionalBackgroundSchema.shape)
  .extend(interestsSchema.shape)
  .extend(agreementSchema.shape);

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalBackground = z.infer<typeof professionalBackgroundSchema>;
export type Interests = z.infer<typeof interestsSchema>;
export type Agreement = z.infer<typeof agreementSchema>;
export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;

export const stepSchemas = [
  personalInfoSchema,
  professionalBackgroundSchema,
  interestsSchema,
  agreementSchema,
] as const;
