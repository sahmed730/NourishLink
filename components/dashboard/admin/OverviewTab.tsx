import React from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, Zap, Leaf, Droplets, Wind, Trees, Activity, Gift, Building2, Users, ShieldAlert } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

const MapViewer = dynamic(() => import('@/components/maps/MapViewer'), { ssr: false })

// Helper to render lucide icon by string name
const renderIcon = (name: string, type: string) => {
  if (name === 'Gift') return <Gift size={14} color="#fff" />
  if (name === 'Building2') return <Building2 size={14} color="#4ea8de" />
  if (name === 'Users') return <Users size={14} color="#ffb432" />
  if (type === 'warning') return <ShieldAlert size={14} color="#ff5050" />
  return <Activity size={14} color="#50c864" />
}

// Format relative time (e.g., "2 mins ago")
const getRelativeTime = (dateString: string) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = (new Date(dateString).getTime() - Date.now()) / 1000;
  
  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}

export default function OverviewTab({ stats }: { stats: any }) {
  const maxChartValue = Math.max(...stats.chartData, 10);

  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Platform Impact</h1>
          <p className={styles.pageSubtitle}>Real-time food rescue intelligence across the NourishLink network.</p>
        </div>
        <div className={styles.liveBadge}>
          <div className={styles.liveBadgeDot} /> Live System
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.panelCard} ${styles.kpiCard}`}>
            <div className={styles.panelTitle}>Total Donations</div>
            <div className={styles.kpiValue}>{stats.total_donations}</div>
            <div className={styles.kpiSub}>
              <span>Since Launch</span>
              <span className={styles.trendUp}><ArrowUpRight size={14}/> Live</span>
            </div>
            <div className={styles.sparkline}>
              {[2, 4, 3, 6, 5, 8, 10].map((h, i) => <div key={i} className={`${styles.sparkBar} ${i === 6 ? styles.active : ''}`} style={{ height: `${h * 10}%` }}/>)}
            </div>
          </div>
          
          <div className={`${styles.panelCard} ${styles.kpiCard}`}>
            <div className={styles.panelTitle}>Food Rescued</div>
            <div className={styles.kpiValue}>{stats.total_kg_rescued.toFixed(1)}<span style={{ fontSize: '1rem', color: '#888' }}>kg</span></div>
            <div className={styles.kpiSub}>
              <span>{Math.floor(stats.total_kg_rescued * 3)} Equivalent Meals</span>
              <span className={styles.trendUp}><ArrowUpRight size={14}/> Live</span>
            </div>
            <div className={styles.sparkline}>
              {[5, 3, 7, 4, 8, 9, 12].map((h, i) => <div key={i} className={`${styles.sparkBar} ${i === 6 ? styles.active : ''}`} style={{ height: `${h * 8}%` }}/>)}
            </div>
          </div>

          <div className={`${styles.panelCard} ${styles.kpiCard}`}>
            <div className={styles.panelTitle}>Pickups Completed</div>
            <div className={styles.kpiValue}>{stats.total_pickups_completed}</div>
            <div className={styles.kpiSub}>
              <span>Total Success</span>
              <span className={styles.trendUp}><ArrowUpRight size={14}/> Live</span>
            </div>
            <div className={styles.sparkline}>
              {[8, 7, 9, 8, 10, 9, 11].map((h, i) => <div key={i} className={`${styles.sparkBar} ${i === 6 ? styles.active : ''}`} style={{ height: `${h * 9}%` }}/>)}
            </div>
          </div>

          <div className={`${styles.panelCard} ${styles.kpiCard}`}>
            <div className={styles.panelTitle}>Active Organizations</div>
            <div className={styles.kpiValue}>{stats.total_restaurants + stats.total_ngos}</div>
            <div className={styles.kpiSub}>
              <span>{stats.total_restaurants} Restaurants | {stats.total_ngos} NGOs</span>
              <span className={styles.trendUp}><ArrowUpRight size={14}/> Live</span>
            </div>
            <div className={styles.sparkline}>
              {[10, 10, 11, 12, 12, 13, 14].map((h, i) => <div key={i} className={`${styles.sparkBar} ${i === 6 ? styles.active : ''}`} style={{ height: `${h * 7}%` }}/>)}
            </div>
          </div>
        </div>

        {/* Central Chart & AI Insights */}
        <div className={`${styles.panelCard} ${styles.chartPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Food Rescue Trend (Last 7 Days)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>Daily</button>
            </div>
          </div>
          <div className={styles.lineChart}>
            {stats.chartData.map((val: number, i: number) => {
              const heightPercent = Math.max((val / maxChartValue) * 100, 5);
              return (
                <div key={i} className={styles.chartColumn}>
                  <div className={styles.chartBarArea} style={{ height: `${heightPercent}%` }} />
                  <span className={styles.chartLabel} style={{ fontWeight: i === 6 ? 'bold' : 'normal', color: i === 6 ? '#fff' : '#666' }}>
                    {i === 6 ? 'Today' : `D-${6-i}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.sidePanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} color="#ffb432"/> Nourish Intelligence</div>
          </div>
          <div className={styles.aiInsightList}>
            {stats.insights.length > 0 ? (
              stats.insights.map((insight: any, i: number) => (
                <div key={i} className={`${styles.aiInsightItem} ${styles[insight.type]}`}>
                  <div className={styles.aiInsightText}>"{insight.text}"</div>
                </div>
              ))
            ) : (
              <div style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>No new insights generated.</div>
            )}
          </div>
        </div>

        {/* Map and Activity Feed */}
        <div className={`${styles.panelCard} ${styles.mapPanel}`}>
          <div className={styles.mapOverlay}>
            <div className={styles.panelTitle} style={{ marginBottom: '0.25rem' }}>Geographic Intelligence</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>Live tracking of active routes</div>
          </div>
          <div className={styles.mapWrapper}>
            <MapViewer 
              center={stats.mapMarkers.length > 0 ? [stats.mapMarkers[0].lat, stats.mapMarkers[0].lng] : [40.7128, -74.0060]} 
              zoom={12}
              markers={stats.mapMarkers}
            />
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.activityPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Platform Activity Feed</div>
          </div>
          <div className={styles.activityFeed}>
            {stats.activityFeed.length > 0 ? (
              stats.activityFeed.map((feed: any) => (
                <div key={feed.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{renderIcon(feed.icon, feed.type)}</div>
                  <div className={styles.activityContent}>
                    <h4>{feed.title}</h4>
                    <p>{getRelativeTime(feed.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '1rem' }}>No recent activity found.</div>
            )}
          </div>
        </div>

        {/* Environmental Impact Cards */}
        <div className={styles.envPanel}>
          <div className={styles.envCard}>
            <div className={styles.envIcon}><Leaf size={24} color="#50c864"/></div>
            <div className={styles.envData}>
              <h4>{(stats.total_kg_rescued * 2.5).toFixed(0)}kg</h4>
              <p>CO₂ Prevented</p>
            </div>
          </div>
          <div className={styles.envCard}>
            <div className={styles.envIcon}><Droplets size={24} color="#4ea8de"/></div>
            <div className={styles.envData}>
              <h4>{(stats.total_kg_rescued * 800).toFixed(0)}L</h4>
              <p>Water Saved</p>
            </div>
          </div>
          <div className={styles.envCard}>
            <div className={styles.envIcon}><Wind size={24} color="#90e0ef"/></div>
            <div className={styles.envData}>
              <h4>{(stats.total_kg_rescued * 1.2).toFixed(0)}kg</h4>
              <p>Landfill Reduced</p>
            </div>
          </div>
          <div className={styles.envCard}>
            <div className={styles.envIcon}><Trees size={24} color="#2d6a4f"/></div>
            <div className={styles.envData}>
              <h4>{Math.floor(stats.total_kg_rescued * 0.1)}</h4>
              <p>Trees Equivalent</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
