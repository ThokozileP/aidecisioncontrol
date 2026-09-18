import { z } from 'zod';
import { SECTORS } from '../membership/options';
import { DISCUSSION_TOPICS, CONTRIBUTOR_INTEREST_OPTIONS } from './options';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const eventInvitationSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z
    .string()
    .trim()
    .min(1, 'Professional email is required')
    .refine((value) => EMAIL_PATTERN.test(value), 'Enter a valid email address'),
  organisation: z.string().trim().min(1, 'Organisation is required').max(160),
  jobTitle: z.string().trim().min(1, 'Job title / role is required').max(160),
  industry: z.enum(SECTORS, { message: 'Select an industry / sector' }),
  country: z.string().trim().min(1, 'Country is required').max(80),
  linkedIn: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default('')
    .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), {
      message: 'Enter a valid URL (starting with https://)',
    }),
  concern: z
    .string()
    .trim()
    .min(1, "Tell us your organisation's biggest concern about AI decision autonomy")
    .max(4000),
  discussionTopic: z.enum(DISCUSSION_TOPICS, { message: 'Select an area of AI decision control' }),
  contributorInterest: z.enum(CONTRIBUTOR_INTEREST_OPTIONS).optional(),
  consent: z.literal(true, { message: 'You must consent to be contacted about this event' }),
});

export type EventInvitationInput = z.infer<typeof eventInvitationSchema>;
