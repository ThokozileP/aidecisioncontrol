import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MembershipStep } from './steps/MembershipStep';
import { PersonalInformationStep } from './steps/PersonalInformationStep';
import { ProfessionalBackgroundStep } from './steps/ProfessionalBackgroundStep';
import { InterestsStep } from './steps/InterestsStep';
import { MembershipPaymentStep } from './steps/MembershipPaymentStep';
import { createEmptyDraft, loadDraft, saveDraft, validateStep, toApplicationInput } from './formState';
import type { MembershipDraft, FieldErrors } from './formState';

const STEPS = [
  { number: '01', title: 'About You', description: 'Tell us who you are and how to reach you.' },
  { number: '02', title: 'Professional Background', description: 'Help us understand your professional context.' },
  { number: '03', title: 'Your Interests', description: 'What draws you to the Forum, and how you’d like to take part.' },
  { number: '04', title: 'Membership & Payment', description: 'Review your membership and complete payment securely.' },
] as const;

function ProgressIndicator({
  currentStep,
  onStepSelect,
}: {
  currentStep: number;
  onStepSelect: (index: number) => void;
}) {
  return (
    <ol className="membership-form__progress" aria-label="Application progress">
      {STEPS.map((step, index) => {
        const state = index === currentStep ? 'current' : index < currentStep ? 'complete' : 'upcoming';
        const reachable = index <= currentStep;
        return (
          <li key={step.number} className={`membership-form__progress-item membership-form__progress-item--${state}`}>
            <button
              type="button"
              className="membership-form__progress-button"
              onClick={() => onStepSelect(index)}
              disabled={!reachable}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="membership-form__progress-number" aria-hidden="true">
                {step.number}
              </span>
              <span className="membership-form__progress-label">{step.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function MembershipForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<MembershipDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const submittingRef = useRef(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(loadDraft());

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'cancelled') {
      setPaymentFailed(true);
      setCurrentStep(3);
      params.delete('payment');
      const next = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDraft(draft);
  }, [draft, hydrated]);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  function update<K extends keyof MembershipDraft>(key: K, value: MembershipDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function goNext() {
    const stepErrors = validateStep(currentStep, draft);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  }

  function goBack() {
    setSubmitError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function goToStep(index: number) {
    if (index > currentStep) return;
    setSubmitError(null);
    setCurrentStep(index);
  }

  async function handleSubmit() {
    if (submittingRef.current) return;

    const finalErrors = validateStep(3, draft);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    const applicationInput = toApplicationInput(draft);
    if (!applicationInput) {
      // Something earlier is incomplete even though this step is valid — send the
      // member back to the first step that fails so they can see what's missing.
      for (let step = 0; step < 3; step += 1) {
        const stepErrors = validateStep(step, draft);
        if (Object.keys(stepErrors).length > 0) {
          setErrors(stepErrors);
          setCurrentStep(step);
          return;
        }
      }
      setSubmitError('Please check your application — some information is missing or invalid.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // A fresh idempotency key per attempt — not reused across retries.
      // Reusing one here would make Stripe hand back the *same* (already
      // cancelled/expired) checkout session on "Try Payment Again" instead
      // of creating a new one, since idempotency keys are meant to dedupe a
      // single logical request, not distinguish separate payment attempts.
      // Duplicate submission protection instead comes from `submittingRef`
      // above (blocks re-entrancy while a request is in flight) and from
      // `applicationId` below (server reuses the same pending application
      // rather than creating a new one per retry).
      const idempotencyKey = crypto.randomUUID();

      const response = await fetch('/api/membership/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...applicationInput,
          applicationId: draft.applicationId || undefined,
          idempotencyKey,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        applicationId?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Could not start payment. Please try again.');
      }

      if (data.applicationId) {
        // Persist synchronously — the browser navigates away immediately
        // after this, before React's state-driven autosave effect would run.
        const updatedDraft = { ...draft, applicationId: data.applicationId };
        setDraft(updatedDraft);
        saveDraft(updatedDraft);
      }

      window.location.href = data.url;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not start payment. Please try again.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const step = STEPS[currentStep];

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <PersonalInformationStep draft={draft} errors={errors} update={update} />;
      case 1:
        return <ProfessionalBackgroundStep draft={draft} errors={errors} update={update} />;
      case 2:
        return <InterestsStep draft={draft} errors={errors} update={update} />;
      default:
        return (
          <MembershipPaymentStep
            draft={draft}
            errors={errors}
            update={update}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
            paymentFailed={paymentFailed}
          />
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, draft, errors, submitting, submitError, paymentFailed]);

  return (
    <div className="membership-form" id="membership-form">
      <div ref={headingRef} />
      <ProgressIndicator currentStep={currentStep} onStepSelect={goToStep} />

      <div className="membership-form__panel">
        <AnimatePresence mode="wait">
          <MembershipStep key={currentStep} stepNumber={step.number} title={step.title} description={step.description}>
            {stepContent}
          </MembershipStep>
        </AnimatePresence>

        <div className="membership-form__nav">
          {currentStep > 0 && (
            <button type="button" className="button button--ghost" onClick={goBack} disabled={submitting}>
              Back
            </button>
          )}
          {currentStep < STEPS.length - 1 && (
            <button type="button" className="button button--primary membership-form__next" onClick={goNext}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
