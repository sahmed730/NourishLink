import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const rootClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
    
    return (
      <button 
        ref={ref}
        className={rootClass}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <span className="spinner" aria-hidden="true" style={{ marginRight: '8px' }} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
