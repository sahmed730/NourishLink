import React from 'react'
import { Leaf, Droplets, Wind, Trees, Globe } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

export default function ImpactTab({ stats }: { stats: any }) {
  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Environmental Impact</h1>
          <p className={styles.pageSubtitle}>Tracking our ecological footprint reduction.</p>
        </div>
        <button style={{ background: '#fff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600 }}>
          Export Report
        </button>
      </div>

      <div className={styles.envPanel} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className={styles.envCard} style={{ gridColumn: 'span 1' }}>
          <div className={styles.envIcon}><Leaf size={24} color="#50c864"/></div>
          <div className={styles.envData}>
            <h4 style={{ fontSize: '2rem' }}>{(stats.total_kg_rescued * 2.5).toFixed(0)}kg</h4>
            <p>CO₂ Prevented</p>
          </div>
        </div>
        <div className={styles.envCard} style={{ gridColumn: 'span 1' }}>
          <div className={styles.envIcon}><Droplets size={24} color="#4ea8de"/></div>
          <div className={styles.envData}>
            <h4 style={{ fontSize: '2rem' }}>{(stats.total_kg_rescued * 800).toFixed(0)}L</h4>
            <p>Water Saved</p>
          </div>
        </div>
        <div className={styles.envCard} style={{ gridColumn: 'span 1' }}>
          <div className={styles.envIcon}><Wind size={24} color="#90e0ef"/></div>
          <div className={styles.envData}>
            <h4 style={{ fontSize: '2rem' }}>{(stats.total_kg_rescued * 1.2).toFixed(0)}kg</h4>
            <p>Landfill Reduced</p>
          </div>
        </div>
        <div className={styles.envCard} style={{ gridColumn: 'span 1' }}>
          <div className={styles.envIcon}><Trees size={24} color="#2d6a4f"/></div>
          <div className={styles.envData}>
            <h4 style={{ fontSize: '2rem' }}>{Math.floor(stats.total_kg_rescued * 0.1)}</h4>
            <p>Trees Equivalent</p>
          </div>
        </div>
      </div>

      <div className={styles.panelCard} style={{ padding: '2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Globe size={48} color="#4ea8de" style={{ marginBottom: '1rem', opacity: 0.8 }} />
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Global Contribution</h2>
        <p style={{ color: '#888', maxWidth: '600px', lineHeight: 1.6 }}>
          By rescuing {stats.total_kg_rescued.toFixed(1)}kg of food, NourishLink has significantly contributed to reducing greenhouse gas emissions. The CO₂ prevented is equivalent to taking <strong>{Math.floor((stats.total_kg_rescued * 2.5) / 4600)}</strong> cars off the road for a year.
        </p>
      </div>
    </>
  )
}
