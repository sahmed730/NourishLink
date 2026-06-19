import React from 'react'
import { BarChart3, TrendingUp, PieChart } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

export default function AnalyticsTab({ stats }: { stats: any }) {
  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Detailed Analytics</h1>
          <p className={styles.pageSubtitle}>Deep dive into platform performance metrics.</p>
        </div>
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={`${styles.panelCard} ${styles.chartPanel}`} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} /> Rescue Volume (Monthly)
            </div>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem', borderBottom: '1px solid #333' }}>
            {/* Simple mock bar chart */}
            {[40, 60, 45, 80, 75, 100, 90, 110, 105, 130, 120, 150].map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: 'var(--color-brand-500, #3D9A4E)', height: `${(h/150)*100}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#888' }}>
                  M{i+1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.sidePanel}`} style={{ gridColumn: '1 / span 1' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={16} /> User Breakdown
            </div>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span>Restaurants</span>
               <strong>{stats.total_restaurants}</strong>
             </div>
             <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px' }}>
                <div style={{ width: '60%', height: '100%', background: '#4ea8de', borderRadius: '4px' }} />
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
               <span>NGOs</span>
               <strong>{stats.total_ngos}</strong>
             </div>
             <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px' }}>
                <div style={{ width: '40%', height: '100%', background: '#ffb432', borderRadius: '4px' }} />
             </div>
          </div>
        </div>

        <div className={`${styles.panelCard}`} style={{ gridColumn: '2 / span 2' }}>
           <div className={styles.panelHeader}>
            <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} /> System Efficiency
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
             <p style={{ color: '#aaa', lineHeight: '1.6' }}>
               The platform is currently operating at a high matching efficiency. 
               Average time from donation to match is <strong>12 minutes</strong>. 
               Pickup success rate is <strong>98.5%</strong>.
             </p>
             <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0, color: '#50c864' }}>98.5%</h3>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Success Rate</span>
                </div>
                <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2rem', margin: 0, color: '#4ea8de' }}>12m</h3>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Avg. Match Time</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  )
}
