import React from 'react'
import dynamic from 'next/dynamic'
import { Map as MapIcon, Navigation } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

const MapViewer = dynamic(() => import('@/components/maps/MapViewer'), { ssr: false })

export default function RoutesTab({ stats }: { stats: any }) {
  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Route Management</h1>
          <p className={styles.pageSubtitle}>Live tracking and routing operations.</p>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={`${styles.panelCard} ${styles.sidePanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Navigation size={16} /> Active Routes
            </div>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #4ea8de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#fff' }}>Route R-102</strong>
                <span style={{ fontSize: '0.8rem', color: '#4ea8de' }}>En Route</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>Hope Food Bank Truck</div>
              <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>3 stops • ETA 45m</div>
            </div>
            
            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #50c864' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#fff' }}>Route R-103</strong>
                <span style={{ fontSize: '0.8rem', color: '#50c864' }}>Arriving</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>Community Care Van</div>
              <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>1 stop • ETA 2m</div>
            </div>
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.mapPanel}`} style={{ gridColumn: '2 / span 2', minHeight: '500px' }}>
          <div className={styles.mapOverlay}>
            <div className={styles.panelTitle} style={{ marginBottom: '0.25rem' }}>Live Map</div>
          </div>
          <div className={styles.mapWrapper} style={{ height: '100%', position: 'relative' }}>
            <MapViewer 
              center={stats.mapMarkers.length > 0 ? [stats.mapMarkers[0].lat, stats.mapMarkers[0].lng] : [40.7128, -74.0060]} 
              zoom={12}
              markers={stats.mapMarkers}
            />
          </div>
        </div>
      </div>
    </>
  )
}
