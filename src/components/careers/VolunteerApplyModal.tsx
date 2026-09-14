import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * The single shared "Apply for this role" dialog for /careers. One instance
 * is mounted once on the page (careers.astro); each role's Apply button is
 * plain server-rendered markup that dispatches a `volunteer-apply-open`
 * CustomEvent with its role title (see the inline script in careers.astro)
 * rather than each row mounting its own React island.
 */
export function VolunteerApplyModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [motivation, setMotivation] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as CustomEvent<{ role?: string }>).detail;
      setRole(detail?.role ?? '');
      setName('');
      setEmail('');
      setLinkedin('');
      setMotivation('');
      setCvFile(null);
      setHoneypot('');
      setStatus('idle');
      setError(null);
      dialogRef.current?.showModal();
    }
    window.addEventListener('volunteer-apply-open', handleOpen);
    return () => window.removeEventListener('volunteer-apply-open', handleOpen);
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: SyntheticEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) close();
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    if (!cvFile) {
      setError('Attach your CV to continue.');
      setStatus('error');
      return;
    }
    if (!isAcceptedFile(cvFile)) {
      setError('CV must be a .pdf, .doc, or .docx file.');
      setStatus('error');
      return;
    }
    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      setError('CV must be under 5MB.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('linkedin', linkedin);
    formData.append('role', role);
    formData.append('motivation', motivation);
    formData.append('cv', cvFile);
    formData.append('website', honeypot);

    try {
      const response = await fetch('/api/volunteers/apply', { method: 'POST', body: formData });
      const data = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not submit your application. Please try again.');
      }
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your application. Please try again.');
      setStatus('error');
    }
  }

  return (
    <dialog ref={dialogRef} className="apply-modal" onClick={handleBackdropClick}>
      <div className="apply-modal__panel">
        <button type="button" className="apply-modal__close" onClick={close} aria-label="Close">
          ×
        </button>

        {status === 'success' ? (
          <div className="apply-modal__success" role="status">
            <p className="apply-modal__eyebrow">{role}</p>
            <h2>Application received.</h2>
            <p>Thank you for applying — the Forum will be in touch.</p>
            <button type="button" className="apply-modal__button" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form className="apply-form" onSubmit={handleSubmit}>
            <p className="apply-modal__eyebrow">Apply for</p>
            <h2>{role}</h2>

            <label htmlFor="apply-name">Name</label>
            <input
              id="apply-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="apply-email">Email</label>
            <input
              id="apply-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label htmlFor="apply-linkedin">LinkedIn (optional)</label>
            <input
              id="apply-linkedin"
              type="url"
              autoComplete="url"
              placeholder="https://www.linkedin.com/in/..."
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />

            <label htmlFor="apply-motivation">Why do you want to volunteer for this role?</label>
            <textarea
              id="apply-motivation"
              required
              rows={4}
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
            />

            <label htmlFor="apply-cv">CV (.pdf, .doc, .docx — under 5MB)</label>
            <input
              id="apply-cv"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
            />

            <div className="apply-form__honeypot" aria-hidden="true">
              <label htmlFor="apply-website">Leave this field blank</label>
              <input
                id="apply-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <button type="submit" className="apply-modal__button" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting…' : 'Submit application'}
            </button>

            {error && (
              <p className="apply-form__error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </dialog>
  );
}
