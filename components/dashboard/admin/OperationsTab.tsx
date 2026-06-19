import React from 'react'
import { Activity, Server, Database, ShieldCheck } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

export default function OperationsTab({ stats }: { stats: any }) {
  // Use the helper to render icons similar to OverviewTab
  const renderIcon = (type: string) => {
    return <Activity size={14} color="#50c864" />
  }
  
  const getRelativeTime = (dateString: string) => {
    return '10 mins ago'; // simplified for mock
  }

  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>System Operations</h1>
          <p className={styles.pageSubtitle}>Real-time activity and system health monitoring.</p>
        </div>
        <div className={styles.liveBadge}>
          <div className={styles.liveBadgeDot} /> 99.9% Uptime
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        <div className={styles.kpiGrid} style={{ gridColumn: '1 / -1' }}>
           <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={14} /> API Health</div>
              <div className={styles.kpiValue} style={{ color: '#50c864' }}>Healthy</div>
              <div className={styles.kpiSub}><span>Latency: 45ms</span></div>
           </div>
           <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={14} /> Database</div>
              <div className={styles.kpiValue} style={{ color: '#50c864' }}>Online</div>
              <div className={styles.kpiSub}><span>Load: 12%</span></div>
           </div>
           <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={14} /> Security</div>
              <div className={styles.kpiValue} style={{ color: '#50c864' }}>Secure</div>
              <div className={styles.kpiSub}><span>0 Active Threats</span></div>
           </div>
        </div>

        <div className={`${styles.panelCard} ${styles.activityPanel}`} style={{ gridColumn: '1 / span 2' }}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Complete Event Log</div>
          </div>
          <div className={styles.activityFeed}>
            {stats.activityFeed.length > 0 ? (
              stats.activityFeed.map((feed: any, idx: number) => (
                <div key={idx} className={styles.activityItem} style={{ borderBottom: '1px solid #222', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <div className={styles.activityIcon}>{renderIcon(feed.type)}</div>
                  <div className={styles.activityContent} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <h4>{feed.title}</h4>
                    <p style={{ minWidth: '80px', textAlign: 'right' }}>{getRelativeTime(feed.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '1rem' }}>No recent activity found.</div>
            )}
          </div>
        </div>

        <div className={styles.panelCard} style={{ gridColumn: '3 / span 1', padding: '1rem' }}>
           <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Active Alerts</h3>
           <p style={{ color: '#888', fontSize: '0.9rem' }}>No active system alerts.</p>
        </div>
      </div>
    </>
  )
}
