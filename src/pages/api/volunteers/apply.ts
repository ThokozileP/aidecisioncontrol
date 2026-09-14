import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { volunteerApplicationSchema, isAcceptedCvFile, MAX_CV_SIZE_BYTES } from '../../../lib/volunteers/schema';
import {
  getVolunteersKv,
  getVolunteerCvBucket,
  saveApplication,
  uploadCv,
  checkRateLimit,
} from '../../../lib/volunteers/store';
import { sendVolunteerApplicationNotification } from '../../../lib/email/sendVolunteerApplicationNotification';
import type { VolunteerApplicationRecord } from '../../../lib/volunteers/types';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type WorkerEnv = {
  VOLUNTEERS?: KVNamespace;
  VOLUNTEER_CVS?: R2Bucket;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  return cleaned || 'cv';
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ success: false, error: 'Invalid form submission.' }, 400);
  }

  // Honeypot: real applicants never see or fill this field (visually
  // hidden — see VolunteerApplyModal.tsx). A bot that auto-fills every
  // input does. Report success without doing any real work, so the bot
  // has no signal that it was caught.
  const honeypot = formData.get('website');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ success: true });
  }

  const workerEnv = env as unknown as WorkerEnv;

  const kv = (() => {
    try {
      return getVolunteersKv(workerEnv);
    } catch {
      return null;
    }
  })();
  if (!kv) {
    return json({ success: false, error: 'Application storage is not configured. See README.md for setup.' }, 503);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const withinLimit = await checkRateLimit(kv, ip);
  if (!withinLimit) {
    return json(
      { success: false, error: 'Too many applications from this connection. Please try again in a minute.' },
      429
    );
  }

  // `formData.get()` returns `null` for a field that wasn't sent at all —
  // distinct from an empty string, and not something `z.string().optional()`
  // accepts (it only allows `undefined`). Coerce to '' so a missing optional
  // field (linkedin) validates as absent rather than raising an unrelated
  // "expected string, received null" error alongside any real ones.
  const field = (key: string): string => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
  };

  const parsed = volunteerApplicationSchema.safeParse({
    name: field('name'),
    email: field('email'),
    linkedin: field('linkedin'),
    role: field('role'),
    motivation: field('motivation'),
  });
  if (!parsed.success) {
    return json({ success: false, error: 'Please check the form and try again.', issues: parsed.error.issues }, 400);
  }

  const cv = formData.get('cv');
  if (!(cv instanceof File) || cv.size === 0) {
    return json({ success: false, error: 'Attach your CV to continue.' }, 400);
  }
  if (!isAcceptedCvFile(cv)) {
    return json({ success: false, error: 'CV must be a .pdf, .doc, or .docx file.' }, 415);
  }
  if (cv.size > MAX_CV_SIZE_BYTES) {
    return json({ success: false, error: 'CV must be under 5MB.' }, 413);
  }

  const bucket = (() => {
    try {
      return getVolunteerCvBucket(workerEnv);
    } catch {
      return null;
    }
  })();
  if (!bucket) {
    return json({ success: false, error: 'File storage is not configured. See README.md for setup.' }, 503);
  }

  const applicantId = crypto.randomUUID();
  const cvFileKey = `cv/${applicantId}/${sanitizeFileName(cv.name)}`;

  try {
    const cvBuffer = await cv.arrayBuffer();
    await uploadCv(bucket, cvFileKey, cvBuffer, cv.type);
  } catch (error) {
    console.error('[volunteers apply] Failed to upload CV', error);
    return json({ success: false, error: 'Could not upload your CV. Please try again.' }, 502);
  }

  const record: VolunteerApplicationRecord = {
    applicantId,
    name: parsed.data.name,
    email: parsed.data.email,
    linkedin: parsed.data.linkedin,
    role: parsed.data.role,
    motivation: parsed.data.motivation,
    cvFileKey,
    submittedAt: new Date().toISOString(),
  };

  try {
    await saveApplication(kv, record);
  } catch (error) {
    console.error('[volunteers apply] Failed to save application', error);
    return json({ success: false, error: 'Could not save your application. Please try again.' }, 502);
  }

  try {
    await sendVolunteerApplicationNotification(workerEnv, record);
  } catch (error) {
    // The application (and CV) are already durably stored — a failed
    // notification email must never turn into a failure response for the
    // applicant.
    console.error('[volunteers apply] Notification email failed (application still saved)', error);
  }

  return json({ success: true });
};
