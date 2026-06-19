import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const descId = `${inputId}-desc`;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        <label htmlFor={inputId} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
        
        <input
          id={inputId}
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? descId : undefined}
          required={required}
          {...props}
        />
        
        {(error || helperText) && (
          <div 
            id={descId} 
            className={`${styles.helper} ${error ? styles.errorText : ''}`}
            aria-live={error ? 'assertive' : 'polite'}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
