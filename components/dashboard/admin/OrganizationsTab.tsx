import React, { useEffect, useState } from 'react'
import { Building2, Plus, Filter } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return { Authorization: `Bearer ${t}` }
}

export default function OrganizationsTab({ stats }: { stats: any }) {
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/organizations', { headers: authHeader() })
      .then(res => res.json())
      .then(data => {
        if (data.items) setOrgs(data.items)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Organizations</h1>
          <p className={styles.pageSubtitle}>Manage registered restaurants and NGOs.</p>
        </div>
        <button style={{ background: 'var(--color-brand-500, #3D9A4E)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Plus size={16} /> Add Organization
        </button>
      </div>

      <div className={styles.dashboardGrid}>
         <div className={styles.kpiGrid} style={{ gridColumn: '1 / -1' }}>
            <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle}>Total Organizations</div>
              <div className={styles.kpiValue}>{stats.total_restaurants + stats.total_ngos}</div>
            </div>
            <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle}>Restaurants</div>
              <div className={styles.kpiValue}>{stats.total_restaurants}</div>
            </div>
            <div className={`${styles.panelCard} ${styles.kpiCard}`}>
              <div className={styles.panelTitle}>NGOs</div>
              <div className={styles.kpiValue}>{stats.total_ngos}</div>
            </div>
         </div>

        <div className={styles.panelCard} style={{ gridColumn: '1 / -1', padding: '1rem', minHeight: '300px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Joined</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No organizations found.
                    </td>
                  </tr>
                ) : orgs.map((o, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={16} color="#888" />
                        {o.name || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: '#aaa' }}>{o.type}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ color: o.status === 'Active' ? '#50c864' : '#ff5050' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: '#666' }}>{o.joined}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
