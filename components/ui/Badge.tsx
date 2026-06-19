import { HTMLAttributes, forwardRef } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
  status?: 'AVAILABLE' | 'MATCHED' | 'IN_TRANSIT' | 'PICKED_UP' | 'EXPIRED' | 'CANCELLED';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'neutral', status, children, ...props }, ref) => {
    
    // Status mapping overrides variant if provided
    let finalVariant = variant;
    if (status) {
      const statusMap: Record<string, string> = {
        AVAILABLE: 'brand',
        MATCHED: 'info',
        IN_TRANSIT: 'accent',
        PICKED_UP: 'success',
        EXPIRED: 'neutral',
        CANCELLED: 'error',
      };
      finalVariant = statusMap[status] as any || 'neutral';
    }

    return (
      <span 
        ref={ref}
        className={`${styles.badge} ${styles[finalVariant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
