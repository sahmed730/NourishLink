'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginAction } from '@/lib/actions/auth';
import { Scene } from '@/components/login/Scene';
import styles from './page.module.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deathsToday, setDeathsToday] = useState(0);

  useEffect(() => {
    const DEADS_PER_DAY = 7000;
    const updateCounter = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const msPassed = now.getTime() - startOfDay.getTime();
      const count = Math.floor((msPassed / (1000 * 60 * 60 * 24)) * DEADS_PER_DAY);
      setDeathsToday(count);
    };
    
    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data: LoginForm) {
    setError('');
    
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.data.id,
        fullName: result.data.fullName,
        role: result.data.role,
      }));

      if (result.data.role === 'restaurant') router.push('/dashboard/restaurant');
      else if (result.data.role === 'ngo') router.push('/dashboard/ngo');
      else router.push('/dashboard/admin');
    }
  }

  return (
    <div className={styles.container}>
      {/* 3D Background */}
      <div className={styles.canvasContainer}>
        <Scene />
      </div>

      {/* Floating UI Overlay */}
      <div className={styles.contentOverlay}>
        
        {/* Glassmorphism Login Panel */}
        <motion.div 
          className={styles.glassPanel}
          initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <img 
                  src="/logo.png" 
                  alt="NourishLink" 
                  style={{ height: '48px', filter: 'invert(1) brightness(2)', objectFit: 'contain' }} 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }
                  }} 
                />
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', display: 'none' }}>
                  NOURISH<span style={{ color: '#888888', fontWeight: 300 }}>LINK</span>
                </div>
              </motion.div>
            </Link>

            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Enter your credentials to access the ecosystem.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#ffaaaa', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <input 
                type="email" 
                className={styles.input}
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.email.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className={styles.inputLabel} style={{ marginBottom: 0 }}>Password</label>
                <Link href="#" style={{ fontSize: '0.75rem', color: '#888888', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className={styles.input}
                  placeholder="••••••••"
                  {...register('password')}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
            </div>

            <motion.button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Authenticating...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>



          <div className={styles.footer}>
            Don't have an account? <Link href="/register" className={styles.footerLink}>Request Access</Link>
          </div>
        </motion.div>


        {/* Real-time Impact Fact */}
        <motion.div 
          className={styles.statsPanel}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', padding: '2rem', background: 'rgba(10, 10, 10, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
        >
          <div style={{ fontSize: '0.9rem', color: '#aaaaaa', marginBottom: '1rem', lineHeight: 1.5, maxWidth: '280px' }}>
            An estimated <strong style={{ color: '#ffffff' }}>7,000 Indians</strong>, primarily children, die every day due to lack of adequate nutrition.
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <span style={{ fontSize: '3rem', fontWeight: 300, color: '#ffffff', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
              {deathsToday.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem' }}>
            Estimated hunger-related deaths today
          </div>
        </motion.div>
      </div>
    </div>
  );
}
