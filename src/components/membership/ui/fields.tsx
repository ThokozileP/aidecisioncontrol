import type { ChangeEvent, ReactNode } from 'react';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ label, htmlFor, required, error, hint, children }: FieldShellProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url';
  required?: boolean;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
  error,
  autoComplete,
  placeholder,
}: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="field__control"
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
  placeholder = 'Select an option',
}: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <select
        id={name}
        name={name}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="field__control"
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface OptionGroupProps {
  legend: string;
  name: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  mode?: 'single' | 'multiple';
  max?: number;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function OptionGroup({
  legend,
  name,
  options,
  selected,
  onChange,
  mode = 'multiple',
  max,
  required,
  error,
  hint,
}: OptionGroupProps) {
  const atMax = typeof max === 'number' && selected.length >= max;

  function toggle(option: string) {
    if (mode === 'single') {
      onChange([option]);
      return;
    }
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else if (!atMax) {
      onChange([...selected, option]);
    }
  }

  return (
    <fieldset className="option-group">
      <legend className="field__label">
        {legend}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>
      {hint && <p className="field__hint">{hint}</p>}
      <div className="option-group__list" role={mode === 'single' ? 'radiogroup' : 'group'} aria-label={legend}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const disable = mode === 'multiple' && atMax && !isSelected;
          return (
            <button
              key={option}
              type="button"
              role={mode === 'single' ? 'radio' : undefined}
              aria-checked={mode === 'single' ? isSelected : undefined}
              aria-pressed={mode === 'multiple' ? isSelected : undefined}
              className={`option-group__item${isSelected ? ' option-group__item--selected' : ''}`}
              disabled={disable}
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="field__error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface CheckboxFieldProps {
  label: ReactNode;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
}

export function CheckboxField({ label, name, checked, onChange, required, error }: CheckboxFieldProps) {
  return (
    <div className="checkbox-field">
      <label className="checkbox-field__row" htmlFor={name}>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p className="field__error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
