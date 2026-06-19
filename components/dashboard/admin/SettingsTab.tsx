import React from 'react'
import { Settings, User, Bell, Shield, Save } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

export default function SettingsTab({ user }: { user: any }) {
  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your profile and platform preferences.</p>
        </div>
        <button style={{ background: 'var(--color-brand-500, #3D9A4E)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className={styles.dashboardGrid}>
         <div className={styles.panelCard} style={{ gridColumn: '1 / span 1', padding: '1rem', alignSelf: 'start' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ padding: '0.75rem 1rem', background: '#222', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}><User size={16} /> Profile</li>
              <li style={{ padding: '0.75rem 1rem', color: '#888', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Bell size={16} /> Notifications</li>
              <li style={{ padding: '0.75rem 1rem', color: '#888', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Shield size={16} /> Security</li>
              <li style={{ padding: '0.75rem 1rem', color: '#888', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Settings size={16} /> Preferences</li>
            </ul>
         </div>

         <div className={styles.panelCard} style={{ gridColumn: '2 / span 2', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Profile Information
            </h2>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#888', fontSize: '0.9rem' }}>Full Name</label>
                <input type="text" defaultValue={user.fullName} style={{ padding: '0.75rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#888', fontSize: '0.9rem' }}>Email Address</label>
                <input type="email" defaultValue="admin@nourishlink.org" disabled style={{ padding: '0.75rem', background: '#0a0a0a', border: '1px solid #222', color: '#666', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Email address cannot be changed.</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#888', fontSize: '0.9rem' }}>Role</label>
                <input type="text" defaultValue="Administrator" disabled style={{ padding: '0.75rem', background: '#0a0a0a', border: '1px solid #222', color: '#666', borderRadius: '4px' }} />
              </div>
            </form>
         </div>
      </div>
    </>
  )
}
