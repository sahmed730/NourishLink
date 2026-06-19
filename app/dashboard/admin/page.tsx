'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, BarChart3, Gift, Building2, Map, Settings, 
  LogOut, Globe, Activity
} from 'lucide-react'
import styles from './page.module.css'

import OverviewTab from '@/components/dashboard/admin/OverviewTab'
import AnalyticsTab from '@/components/dashboard/admin/AnalyticsTab'
import DonationsTab from '@/components/dashboard/admin/DonationsTab'
import OrganizationsTab from '@/components/dashboard/admin/OrganizationsTab'
import RoutesTab from '@/components/dashboard/admin/RoutesTab'
import OperationsTab from '@/components/dashboard/admin/OperationsTab'
import ImpactTab from '@/components/dashboard/admin/ImpactTab'
import SettingsTab from '@/components/dashboard/admin/SettingsTab'

type Stats = { 
  total_donations: number; 
  total_kg_rescued: number; 
  total_pickups_completed: number; 
  total_users: number; 
  total_restaurants: number; 
  total_ngos: number;
  chartData: number[];
  insights: { type: string, text: string }[];
  activityFeed: { id: string, type: string, title: string, time: string, icon: string }[];
  mapMarkers: { id: number, lat: number, lng: number, title: string, description: string }[];
}

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return { Authorization: `Bearer ${t}` }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [user, setUser] = useState<{ fullName: string }>({ fullName: '' })
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    if (parsed.role !== 'admin') { router.push('/login'); return }
    setUser(parsed)
    fetch('/api/analytics/platform', { headers: authHeader() })
      .then(r => r.json()).then(setStats)
  }, [router])

  function logout() { localStorage.clear(); router.push('/') }

  if (!stats) return <div className={styles.dashboard} style={{ justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab stats={stats} />
      case 'analytics': return <AnalyticsTab stats={stats} />
      case 'donations': return <DonationsTab />
      case 'organizations': return <OrganizationsTab stats={stats} />
      case 'routes': return <RoutesTab stats={stats} />
      case 'operations': return <OperationsTab stats={stats} />
      case 'impact': return <ImpactTab stats={stats} />
      case 'settings': return <SettingsTab user={user} />
      default: return <OverviewTab stats={stats} />
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.noiseOverlay} />
      
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>NOURISH<span>LINK</span></div>
          <div className={styles.missionStatement}>Food Rescue Network</div>
        </div>
        
        <div className={styles.nav}>
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'donations', icon: Gift, label: 'Donations' },
            { id: 'organizations', icon: Building2, label: 'Organizations' },
            { id: 'routes', icon: Map, label: 'Routes' },
            { id: 'operations', icon: Activity, label: 'Operations' },
            { id: 'impact', icon: Globe, label: 'Impact' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button 
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <span className={styles.profileName}>{user.fullName}</span>
            <div className={styles.statusIndicator}>
              <div className={styles.statusDot}/> Online
            </div>
          </div>
          <div className={styles.systemHealth}>System Health: 99.9% Uptime</div>
          <button className={styles.logoutBtn} onClick={logout}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <LogOut size={12} /> Sign Out
            </span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {renderActiveTab()}
      </main>
    </div>
  )
}
