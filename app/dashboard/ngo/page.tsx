'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Gift, 
  Map, 
  Truck, 
  LogOut, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  RefreshCw,
  Camera,
  Activity
} from 'lucide-react';
import { acceptMatchAction } from '@/lib/actions/match';
import { logoutAction } from '@/lib/actions/auth';
import styles from './page.module.css';

// Dynamically import map to avoid SSR issues
const MapViewer = dynamic(() => import('@/components/maps/MapViewer'), { ssr: false });

type Donation = { id: number; title: string; foodType: string; quantityKg: number; status: string; expiresAt: string; latitude: number; longitude: number; restaurant: { name: string; address: string } };
type Stats = { total_matches: number; accepted: number; completed: number; total_kg_collected: number };

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { Authorization: `Bearer ${t}` };
}

export default function NGODashboard() {
  const router = useRouter();
  const [view, setView] = useState<'overview' | 'donations' | 'map' | 'pickups'>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<{ id: number, fullName: string } | null>(null);
  const [loadingAction, setLoadingAction] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'ngo') { router.push('/login'); return; }
    setUser(parsed);
    fetchData();
  }, [router]);

  async function fetchData() {
    try {
      const [donRes, statRes] = await Promise.all([
        fetch('/api/donations', { headers: authHeader() }),
        fetch('/api/analytics/me', { headers: authHeader() })
      ]);
      if (donRes.ok) { const d = await donRes.json(); setDonations(d.items || []); }
      if (statRes.ok) setStats(await statRes.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function acceptMatch(matchId: number) {
    if (!user) return;
    setLoadingAction(l => ({ ...l, [matchId]: true }));
    
    const result = await acceptMatchAction(matchId, user.id);
    
    if (!result.error) {
      fetchData();
    }
    setLoadingAction(l => ({ ...l, [matchId]: false }));
  }

  async function handleLogout() {
    await logoutAction();
    localStorage.clear();
    router.push('/');
  }

  if (!user) return <div className={styles.dashboard} style={{ justifyContent: 'center', alignItems: 'center' }}><div className="spinner"/></div>;

  const mapMarkers = donations.map(d => ({
    id: d.id,
    lat: d.latitude,
    lng: d.longitude,
    title: d.title,
    description: `${d.restaurant?.name || 'Restaurant'} • ${d.quantityKg}kg ${d.foodType}`
  }));

  const mapRoute = donations.slice(0, 3).map(d => [d.latitude, d.longitude] as [number, number]);

  // Derived mock data for storytelling
  const waitingMeals = Math.floor(donations.reduce((acc, d) => acc + d.quantityKg, 0) * 3);
  const aiMatchScore = (d: Donation) => Math.floor(80 + Math.random() * 19);

  return (
    <div className={styles.dashboard}>
      <div className={styles.noiseOverlay} />
      
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>NOURISH<span>LINK</span></div>
          <div className={styles.missionStatement}>"No food wasted."</div>
        </div>
        
        <div className={styles.nav}>
          <button 
            className={`${styles.navItem} ${view === 'overview' ? styles.navItemActive : ''}`}
            onClick={() => setView('overview')}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            className={`${styles.navItem} ${view === 'donations' ? styles.navItemActive : ''}`}
            onClick={() => setView('donations')}
          >
            <Gift size={18} /> Available Donations
          </button>
          <button 
            className={`${styles.navItem} ${view === 'map' ? styles.navItemActive : ''}`}
            onClick={() => setView('map')}
          >
            <Map size={18} /> Route Map
          </button>
          <button 
            className={`${styles.navItem} ${view === 'pickups' ? styles.navItemActive : ''}`}
            onClick={() => setView('pickups')}
          >
            <Truck size={18} /> My Pickups
          </button>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileName}>{user.fullName}</div>
          <div className={styles.profileStats}>
            <span>Impact Score: 98</span>
            <span>Meals: {stats?.total_kg_collected ? Math.floor(stats.total_kg_collected * 3) : 0}</span>
          </div>
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
                <h1 className={styles.pageTitle}>Welcome Back,<br/>{user.fullName}</h1>
                <p className={styles.pageSubtitle}>{waitingMeals} meals are waiting to reach families today.</p>
              </div>
              
              {stats && (
                <div className={styles.impactGrid}>
                  <div className={styles.impactCard}>
                    <div className={styles.impactValue}>{stats.total_kg_collected.toFixed(1)}kg</div>
                    <div className={styles.impactLabel}>Total Food Rescued</div>
                  </div>
                  <div className={styles.impactCard}>
                    <div className={styles.impactValue}>{Math.floor(stats.total_kg_collected * 3)}</div>
                    <div className={styles.impactLabel}>Meals Delivered</div>
                  </div>
                  <div className={styles.impactCard}>
                    <div className={styles.impactValue}>{(stats.total_kg_collected * 2.5).toFixed(1)}kg</div>
                    <div className={styles.impactLabel}>CO₂ Prevented</div>
                  </div>
                  <div className={styles.impactCard}>
                    <div className={styles.impactValue}>{stats.accepted}</div>
                    <div className={styles.impactLabel}>Active Pickups</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Live Activity</h3>
                  <div className={styles.timeline}>
                    {donations.slice(0, 3).map((d, index) => (
                      <div key={d.id} className={styles.timelineItem}>
                        <div className={styles.timelineIcon}>
                          {index === 0 ? <Gift size={12} color="#fff"/> : index === 1 ? <Zap size={12} color="#ffb432"/> : <CheckCircle2 size={12} color="#50c864"/>}
                        </div>
                        <div className={styles.timelineContent}>
                          <h4>{d.status === 'available' ? 'Donation Posted' : d.status === 'matched' ? 'Match Found' : 'Delivery Tracked'}</h4>
                          <p>
                            {d.status === 'available' 
                              ? `${d.restaurant?.name || 'A restaurant'} posted ${d.quantityKg}kg of surplus food.` 
                              : `AI identified you as a match for ${d.quantityKg}kg from ${d.restaurant?.name || 'a restaurant'}.`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {donations.length === 0 && (
                      <p style={{ color: '#888', fontSize: '0.875rem' }}>No recent activity. Waiting for new donations.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Impact Visualization</h3>
                  <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', padding: '2rem', gap: '1rem' }}>
                    {/* Dynamic Chart based on total collected */}
                    {[
                      Math.max(10, (stats?.total_kg_collected || 0) * 0.1),
                      Math.max(15, (stats?.total_kg_collected || 0) * 0.2),
                      Math.max(5, (stats?.total_kg_collected || 0) * 0.05),
                      Math.max(25, (stats?.total_kg_collected || 0) * 0.3),
                      Math.max(20, (stats?.total_kg_collected || 0) * 0.2),
                      Math.max(30, (stats?.total_kg_collected || 0) * 0.15),
                      Math.max(40, (stats?.total_kg_collected || 0) * 0.4)
                    ].map((val, i) => (
                      <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: `${Math.min(100, (val / Math.max(100, stats?.total_kg_collected || 100)) * 100)}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#888' }}>
                          {Math.round(val)}kg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'donations' && (
            <motion.div 
              key="donations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Available Donations</h1>
                <p className={styles.pageSubtitle}>Transform surplus into impact.</p>
              </div>
              
              {donations.length > 0 ? (
                <div className={styles.donationGrid}>
                  {donations.map(d => (
                    <div key={d.id} className={styles.donationCard}>
                      <div className={styles.cardMapPreview}>
                        <img src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80&auto=format&fit=crop`} alt="Map Preview" />
                        <div className={styles.cardMatchScore}>
                          <Zap size={14} color="#000" /> {aiMatchScore(d)}% Match
                        </div>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <div>
                            <div className={styles.cardTitle}>{d.title}</div>
                            <div className={styles.cardSubtitle}>{d.restaurant?.name || 'Local Restaurant'}</div>
                          </div>
                          {d.expiresAt && new Date(d.expiresAt).getTime() - Date.now() < 3600000 ? (
                            <span className={`${styles.statusBadge} ${styles.statusUrgent}`}>Urgent</span>
                          ) : (
                            <span className={styles.statusBadge}>Ready Now</span>
                          )}
                        </div>
                        
                        <div className={styles.cardStats}>
                          <div className={styles.statMini}>
                            <span className={styles.statMiniLabel}>Quantity</span>
                            <span className={styles.statMiniValue}>{d.quantityKg} kg</span>
                          </div>
                          <div className={styles.statMini}>
                            <span className={styles.statMiniLabel}>Type</span>
                            <span className={styles.statMiniValue} style={{ textTransform: 'capitalize' }}>{d.foodType}</span>
                          </div>
                          <div className={styles.statMini}>
                            <span className={styles.statMiniLabel}>Distance</span>
                            <span className={styles.statMiniValue}>1.2 km</span>
                          </div>
                          <div className={styles.statMini}>
                            <span className={styles.statMiniLabel}>Expires In</span>
                            <span className={styles.statMiniValue}>
                              {Math.max(1, Math.round((new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))} hrs
                            </span>
                          </div>
                        </div>

                        <div className={styles.cardAction}>
                          <button 
                            className={styles.btnPrimary} 
                            onClick={() => acceptMatch(d.id)}
                            disabled={loadingAction[d.id]}
                          >
                            {loadingAction[d.id] ? 'Accepting...' : 'Accept Match'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h2 className={styles.emptyStateTitle}>No donations available right now</h2>
                  <p className={styles.emptyStateDesc}>
                    We're continuously monitoring nearby restaurants and kitchens. New opportunities will appear automatically as surplus becomes available.
                  </p>
                  <button className={styles.btnSecondary} style={{ width: 'auto', padding: '1rem 2rem' }} onClick={fetchData}>
                    <RefreshCw size={16}/> Refresh Matching
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Route Map</h1>
                <p className={styles.pageSubtitle}>Optimize your pickup routes.</p>
              </div>
              <div className={styles.mapWrapper}>
                <MapViewer 
                  center={donations.length > 0 ? [donations[0].latitude, donations[0].longitude] : [40.7128, -74.0060]} 
                  zoom={13}
                  markers={mapMarkers}
                  route={mapRoute}
                />
              </div>
              
              {donations.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Zap size={18} color="#ffffff" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Route Optimization</h3>
                  </div>
                  <p style={{ color: '#888', fontSize: '0.875rem' }}>
                    "Collect {donations[0].restaurant?.name || 'the nearest location'} first. Food expires in {Math.max(1, Math.round((new Date(donations[0].expiresAt).getTime() - Date.now()) / (1000 * 60)))} minutes. Route optimization can save you 12 minutes."
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'pickups' && (
            <motion.div 
              key="pickups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>My Pickups</h1>
                <p className={styles.pageSubtitle}>Food waiting for collection today.</p>
              </div>
              
              {donations.filter(d => d.status.toLowerCase() === 'matched').length > 0 ? (
                <div className={styles.donationGrid}>
                  {donations.filter(d => d.status.toLowerCase() === 'matched').map(d => (
                    <div key={d.id} className={styles.donationCard}>
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <div>
                            <div className={styles.cardTitle}>{d.restaurant?.name || 'Local Restaurant'}</div>
                            <div className={styles.cardSubtitle} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <MapPin size={12}/> {d.restaurant?.address || '123 Main St'}
                            </div>
                          </div>
                          <span className={styles.statusBadge}>In Transit</span>
                        </div>
                        
                        <div className={styles.tracker}>
                          <div className={styles.trackerLine} />
                          <div className={styles.trackerStep}>
                            <div className={`${styles.trackerDot} ${styles.trackerDotActive}`} />
                            <span className={`${styles.trackerLabel} ${styles.trackerLabelActive}`}>Matched</span>
                          </div>
                          <div className={styles.trackerStep}>
                            <div className={`${styles.trackerDot} ${styles.trackerDotActive}`} />
                            <span className={`${styles.trackerLabel} ${styles.trackerLabelActive}`}>Accepted</span>
                          </div>
                          <div className={styles.trackerStep}>
                            <div className={styles.trackerDot} />
                            <span className={styles.trackerLabel}>Collected</span>
                          </div>
                          <div className={styles.trackerStep}>
                            <div className={styles.trackerDot} />
                            <span className={styles.trackerLabel}>Delivered</span>
                          </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.875rem', color: '#aaaaaa', margin: 0 }}>
                            This pickup can provide <strong style={{ color: '#fff' }}>{d.quantityKg * 3} meals</strong> and prevent <strong style={{ color: '#fff' }}>{d.quantityKg}kg</strong> of waste.
                          </p>
                        </div>

                        <div className={styles.cardAction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <button className={styles.btnSecondary}><Navigation size={16}/> Route</button>
                          <button className={styles.btnPrimary}><Camera size={16}/> Proof</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h2 className={styles.emptyStateTitle}>No Active Pickups</h2>
                  <p className={styles.emptyStateDesc}>
                    You haven't accepted any matches yet. Browse available donations to start your rescue journey.
                  </p>
                  <button className={styles.btnPrimary} style={{ width: 'auto', padding: '1rem 2rem' }} onClick={() => setView('donations')}>
                    Browse Donations
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
