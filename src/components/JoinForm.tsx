import { useState, type SyntheticEvent } from 'react';
import { INTEREST_OPTIONS, type InterestOption } from '../lib/interest/types';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function JoinForm() {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<InterestOption>(INTEREST_OPTIONS[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interest }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not submit. Please try again.');
      }
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="join-form join-form--success" role="status">
        <p>Request received. We'll be in touch.</p>
      </div>
    );
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <label htmlFor="join-email">Work email</label>
      <input
        id="join-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@organisation.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="join-interest">I'm interested in</label>
      <select
        id="join-interest"
        value={interest}
        onChange={(event) => setInterest(event.target.value as InterestOption)}
      >
        {INTEREST_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Request an invitation'}
      </button>

      {error && (
        <p className="join-form__error" role="alert">
          {error}
        </p>
      )}

      <span className="join-form__fineprint">No mailing list spam. One update when there's something worth reading.</span>
    </form>
  );
}
