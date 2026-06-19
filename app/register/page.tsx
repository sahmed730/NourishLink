'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Handshake, ArrowRight, ArrowLeft } from 'lucide-react';
import { registerAction } from '@/lib/actions/auth';
import { Scene } from '@/components/login/Scene';
import styles from './page.module.css';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'), // Restaurant/NGO name
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Latitude must be a valid number'),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Longitude must be a valid number'),
  cuisine: z.string().optional(),
  vehicleType: z.enum(['bike', 'car', 'van', 'truck']).optional(),
  capacityKg: z.string().optional(),
  serviceRadiusKm: z.string().optional()
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialRole = searchParams.get('type') || searchParams.get('role') || '';
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Sync state if query parameters change
  useEffect(() => {
    const queryRole = searchParams.get('type') || searchParams.get('role');
    if (queryRole === 'ngo' || queryRole === 'restaurant') {
      setRole(queryRole);
    }
  }, [searchParams]);

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { vehicleType: 'car', serviceRadiusKm: '10' }
  });

  const nextStep = async () => {
    const isValid = await trigger(['email', 'password', 'fullName', 'phone']);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    const profile = role === 'restaurant'
      ? { name: data.name, address: data.address, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude), cuisine: data.cuisine }
      : { name: data.name, address: data.address, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude), capacityKg: parseFloat(data.capacityKg || '0'), vehicleType: data.vehicleType, serviceRadiusKm: parseFloat(data.serviceRadiusKm || '10') };

    const payload = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      role,
      profile
    };

    const result = await registerAction(payload);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.data.id,
        fullName: result.data.fullName,
        role: result.data.role,
      }));

      if (role === 'restaurant') router.push('/dashboard/restaurant');
      else router.push('/dashboard/ngo');
    }
  };

  if (!role) return (
    <div style={{ textAlign: 'center' }}>
      <h2 className={styles.title}>Join NourishLink</h2>
      <p className={styles.subtitle}>Choose your account type to get started</p>
      
      <div className={styles.roleGrid}>
        <div className={styles.roleCard} onClick={() => setRole('restaurant')}>
          <div className={styles.roleCardIcon}>
            <Utensils size={32} />
          </div>
          <h3 className={styles.roleCardTitle}>Restaurant</h3>
          <p className={styles.roleCardDesc}>Donate surplus food and reduce waste</p>
        </div>

        <div className={styles.roleCard} onClick={() => setRole('ngo')}>
          <div className={styles.roleCardIcon}>
            <Handshake size={32} />
          </div>
          <h3 className={styles.roleCardTitle}>NGO Partner</h3>
          <p className={styles.roleCardDesc}>Receive food donations for your community</p>
        </div>
      </div>

      <div className={styles.footer}>
        Already have an account? <Link href="/login" className={styles.footerLink}>Sign In</Link>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className={styles.title} style={{ marginBottom: '0.25rem' }}>
            {role === 'restaurant' ? 'Restaurant Registration' : 'NGO Registration'}
          </h2>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            Step {step} of 2
          </p>
        </div>
        <button 
          type="button" 
          onClick={() => step === 1 ? setRole('') : setStep(1)} 
          className={styles.backBtn}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#ffaaaa', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Full Name</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Jane Smith"
              {...register('fullName')}
            />
            {errors.fullName && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.fullName.message}</span>}
          </div>

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
            <label className={styles.inputLabel}>Password</label>
            <input 
              type="password" 
              className={styles.input}
              placeholder="Min. 8 characters"
              {...register('password')}
            />
            {errors.password && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Phone (optional)</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="+1 555 000 0000"
              {...register('phone')}
            />
            {errors.phone && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone.message}</span>}
          </div>

          <button 
            type="button" 
            className={styles.submitBtn} 
            onClick={nextStep}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Continue <ArrowRight size={16} />
            </span>
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {role === 'restaurant' ? 'Restaurant Name' : 'NGO Name'}
            </label>
            <input 
              type="text" 
              className={styles.input}
              placeholder={role === 'restaurant' ? 'e.g. Green Kitchen' : 'e.g. Feed India'}
              {...register('name')}
            />
            {errors.name && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.name.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Address</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="e.g. 123 Main St"
              {...register('address')}
            />
            {errors.address && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.address.message}</span>}
          </div>

          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Latitude</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="e.g. 28.6139"
                {...register('latitude')}
              />
              {errors.latitude && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.latitude.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Longitude</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="e.g. 77.2090"
                {...register('longitude')}
              />
              {errors.longitude && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.longitude.message}</span>}
            </div>
          </div>

          {role === 'restaurant' && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Cuisine Type (optional)</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="e.g. Italian, Indian"
                {...register('cuisine')}
              />
              {errors.cuisine && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.cuisine.message}</span>}
            </div>
          )}

          {role === 'ngo' && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Vehicle Type</label>
                <select 
                  className={styles.select} 
                  {...register('vehicleType')}
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
                {errors.vehicleType && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.vehicleType.message}</span>}
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Capacity (kg)</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="e.g. 100"
                    {...register('capacityKg')}
                  />
                  {errors.capacityKg && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.capacityKg.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Service Radius (km)</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="e.g. 10"
                    {...register('serviceRadiusKm')}
                  />
                  {errors.serviceRadiusKm && <span style={{ color: '#ffaaaa', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.serviceRadiusKm.message}</span>}
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </>
      )}
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      {/* 3D Background */}
      <div className={styles.canvasContainer}>
        <Scene />
      </div>

      {/* Floating UI Overlay */}
      <div className={styles.contentOverlay}>
        
        {/* Glassmorphism Register Panel */}
        <motion.div 
          className={styles.glassPanel}
          initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Logo */}
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
          </div>

          <Suspense fallback={<div style={{ textAlign: 'center', color: '#ffffff' }}>Loading...</div>}>
            <RegisterFormContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
