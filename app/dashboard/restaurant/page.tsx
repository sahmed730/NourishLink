'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusSquare, 
  History, 
  LogOut, 
  ChevronRight,
  Clock,
  MapPin,
  Utensils
} from 'lucide-react';
import { createDonationAction } from '@/lib/actions/donation';
import { logoutAction } from '@/lib/actions/auth';
import styles from './page.module.css';

type Donation = { id: number; title: string; foodType: string; quantityKg: number; status: string; expiresAt: string; createdAt: string };
type Stats = { total_donations: number; available: number; matched: number; picked_up: number; total_kg: number };

const donationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  foodType: z.enum(['cooked', 'raw', 'packaged', 'bakery']),
  quantityKg: z.string().min(1, "Quantity is required"),
  servings: z.string().optional(),
  expiresAt: z.string().min(1, "Expiry date is required"),
  pickupWindowStart: z.string().min(1, "Pickup window start is required"),
  pickupWindowEnd: z.string().min(1, "Pickup window end is required"),
});
type DonationForm = z.infer<typeof donationSchema>;

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { Authorization: `Bearer ${t}` };
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const [view, setView] = useState<'overview' | 'donate' | 'history'>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<{ id: number, fullName: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: { foodType: 'cooked' }
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'restaurant') { router.push('/login'); return; }
    setUser(parsed);
    fetchData();
  }, [router]);

  async function fetchData() {
    setIsLoadingData(true);
    try {
      const [donRes, statRes] = await Promise.all([
        fetch('/api/donations', { headers: authHeader() }),
        fetch('/api/analytics/me', { headers: authHeader() })
      ]);
      if (donRes.ok) { const d = await donRes.json(); setDonations(d.items || []); }
      if (statRes.ok) setStats(await statRes.json());
    } finally {
      setIsLoadingData(false);
    }
  }

  async function onSubmit(data: DonationForm) {
    if (!user) return;
    setError(''); setSuccess('');
    
    const payload = {
      ...data,
      quantityKg: parseFloat(data.quantityKg),
      servings: data.servings ? parseInt(data.servings, 10) : undefined,
    };

    const res = await createDonationAction(user.id, payload);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Donation posted successfully!`);
      reset();
      fetchData();
      setView('overview');
      setTimeout(() => setSuccess(''), 5000);
    }
  }

  async function handleLogout() {
    await logoutAction();
    localStorage.clear();
    router.push('/');
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Available</span>;
      case 'matched': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Matched</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  if (!user) return <div className={styles.dashboard} style={{ justifyContent: 'center', alignItems: 'center' }}><div className={styles.spinner}/></div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.noiseOverlay} />
      
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>NOURISH<span>LINK</span></div>
          <div className={styles.roleLabel}>Restaurant</div>
        </div>
        
        <div className={styles.nav}>
          <button 
            className={`${styles.navItem} ${view === 'overview' ? styles.navItemActive : ''}`}
            onClick={() => setView('overview')}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            className={`${styles.navItem} ${view === 'donate' ? styles.navItemActive : ''}`}
            onClick={() => setView('donate')}
          >
            <PlusSquare size={18} /> Post a Donation
          </button>
          <button 
            className={`${styles.navItem} ${view === 'history' ? styles.navItemActive : ''}`}
            onClick={() => setView('history')}
          >
            <History size={18} /> Donation History
          </button>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileName}>{user.fullName}</div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <LogOut size={14} /> Sign Out
            </span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          
          {view === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <p className={styles.pageSubtitle}>Welcome back, {user.fullName}</p>
              </div>
              
              <div className={styles.contentArea}>
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(50,200,100,0.1)', border: '1px solid rgba(50,200,100,0.3)', color: '#50c864', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {success}
                  </motion.div>
                )}
                
                {isLoadingData ? (
                  <div style={{ padding: '4rem', textAlign: 'center' }}><div className={styles.spinner} style={{ margin: '0 auto' }}/></div>
                ) : (
                  stats && (
                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total_donations}</div>
                        <div className={styles.statLabel}>Total Donations</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.available}</div>
                        <div className={styles.statLabel}>Available</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.matched}</div>
                        <div className={styles.statLabel}>Matched</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total_kg.toFixed(1)}</div>
                        <div className={styles.statLabel}>Kg Rescued</div>
                      </div>
                    </div>
                  )
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>Recent Donations</h3>
                  <button className={styles.cancelBtn} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setView('donate')}>
                    Post New
                  </button>
                </div>
                
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Qty (kg)</th>
                        <th>Status</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.slice(0, 5).map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 500 }}>{d.title}</td>
                          <td><span className={styles.badge}>{d.foodType}</span></td>
                          <td>{d.quantityKg}</td>
                          <td>{getStatusBadge(d.status)}</td>
                          <td style={{ color: '#888' }}>{new Date(d.expiresAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {donations.length === 0 && !isLoadingData && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No donations yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'donate' && (
            <motion.div 
              key="donate"
              className={styles.splitLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.splitLeft}>
                <div className={styles.donateHeader}>
                  <motion.h1 
                    className={styles.donateTitle}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    Post a<br/>Donation
                  </motion.h1>
                  <motion.p 
                    className={styles.donateSubtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    "Every meal deserves a purpose."
                  </motion.p>
                </div>

                {error && (
                  <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff5555', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <motion.div 
                    className={styles.formSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className={styles.sectionTitle}><Utensils size={14}/> Food Details</div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Food Title</label>
                        <input className={styles.input} {...register('title')} placeholder="e.g. Fresh Baked Bread" />
                        {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea className={`${styles.input} ${styles.textarea}`} {...register('description')} placeholder="Details about the food condition, packaging, etc." />
                        {errors.description && <span className={styles.errorText}>{errors.description.message}</span>}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className={styles.formSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className={styles.sectionTitle}><PlusSquare size={14}/> Availability</div>
                    <div className={styles.formGrid2}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Type</label>
                        <select className={`${styles.input} ${styles.select}`} {...register('foodType')}>
                          <option value="cooked">Cooked Food</option>
                          <option value="raw">Raw Ingredients</option>
                          <option value="packaged">Packaged Goods</option>
                          <option value="bakery">Bakery & Pastries</option>
                        </select>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Quantity (kg)</label>
                        <input type="number" step="0.1" className={styles.input} {...register('quantityKg')} placeholder="e.g. 15.5" />
                        {errors.quantityKg && <span className={styles.errorText}>{errors.quantityKg.message}</span>}
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Servings (Opt.)</label>
                        <input type="number" className={styles.input} {...register('servings')} placeholder="e.g. 50" />
                        {errors.servings && <span className={styles.errorText}>{errors.servings.message}</span>}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className={styles.formSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className={styles.sectionTitle}><Clock size={14}/> Collection Window</div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Expires At</label>
                        <input type="datetime-local" className={styles.input} {...register('expiresAt')} />
                        {errors.expiresAt && <span className={styles.errorText}>{errors.expiresAt.message}</span>}
                      </div>
                      <div className={styles.formGrid2}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Pickup Start</label>
                          <input type="datetime-local" className={styles.input} {...register('pickupWindowStart')} />
                          {errors.pickupWindowStart && <span className={styles.errorText}>{errors.pickupWindowStart.message}</span>}
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Pickup End</label>
                          <input type="datetime-local" className={styles.input} {...register('pickupWindowEnd')} />
                          {errors.pickupWindowEnd && <span className={styles.errorText}>{errors.pickupWindowEnd.message}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className={styles.formGrid2} 
                    style={{ marginTop: '2rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                      {isSubmitting ? 'Posting...' : <>Publish Donation <ChevronRight size={18} /></>}
                    </button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setView('overview')}>
                      Discard
                    </button>
                  </motion.div>
                </form>
              </div>
              <div className={styles.splitRight}>
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Volunteers organizing food donation" 
                  className={styles.heroImage} 
                />
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>History</h1>
                <p className={styles.pageSubtitle}>All donations you've posted</p>
              </div>
              <div className={styles.contentArea}>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Qty (kg)</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map(d => (
                        <tr key={d.id}>
                          <td style={{ color: '#666' }}>#{d.id}</td>
                          <td style={{ fontWeight: 500 }}>{d.title}</td>
                          <td><span className={styles.badge}>{d.foodType}</span></td>
                          <td>{d.quantityKg}</td>
                          <td>{getStatusBadge(d.status)}</td>
                          <td style={{ color: '#888' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                          <td style={{ color: '#888' }}>{new Date(d.expiresAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {donations.length === 0 && !isLoadingData && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No history available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
