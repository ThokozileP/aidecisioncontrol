import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MembershipStepProps {
  stepNumber: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function MembershipStep({ stepNumber, title, description, children }: MembershipStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <p className="membership-form__step-number">{stepNumber}</p>
      <h2 className="membership-form__step-title">{title}</h2>
      {description && <p className="membership-form__step-description">{description}</p>}
      <div className="membership-form__step-body">{children}</div>
    </motion.div>
  );
}
