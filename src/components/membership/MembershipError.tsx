import { AlertTriangle } from 'lucide-react';

interface Props {
  onRetry: () => void;
  retrying: boolean;
}

export function MembershipError({ onRetry, retrying }: Props) {
  return (
    <div className="membership-error" role="alert">
      <span className="membership-error__icon" aria-hidden="true">
        <AlertTriangle size={20} strokeWidth={2} />
      </span>
      <div>
        <h3>We couldn't complete your membership payment</h3>
        <p>Your application has been saved, but the payment could not be completed. Please try again.</p>
        <button type="button" className="button button--primary" onClick={onRetry} disabled={retrying}>
          {retrying ? 'Retrying…' : 'Try Payment Again'}
        </button>
      </div>
    </div>
  );
}
