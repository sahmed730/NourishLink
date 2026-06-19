import React, { useEffect, useState } from 'react'
import { Filter, Search } from 'lucide-react'
import styles from '../../../app/dashboard/admin/page.module.css'

function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return { Authorization: `Bearer ${t}` }
}

export default function DonationsTab() {
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/donations', { headers: authHeader() })
      .then(res => res.json())
      .then(data => {
        if (data.items) setDonations(data.items)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const getRelativeTime = (dateString: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (new Date(dateString).getTime() - Date.now()) / 1000;
    
    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  }

  return (
    <>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>Donations Management</h1>
          <p className={styles.pageSubtitle}>Monitor and manage all donations across the network.</p>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.panelCard} style={{ gridColumn: '1 / -1', padding: '1rem', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <div style={{ background: '#111', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #333' }}>
                 <Search size={14} color="#666" />
                 <input type="text" placeholder="Search ID or Restaurant..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
               </div>
               <button style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Filter size={14} /> Filter Status
               </button>
             </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Restaurant</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Items</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No donations found on the platform.
                    </td>
                  </tr>
                ) : donations.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', color: '#ccc' }}>DON-{d.id}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{d.restaurant?.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem 0.5rem', color: '#aaa' }}>{d.quantityKg}kg {d.foodType}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        background: 
                          d.status === 'available' ? '#1f5a2c' : 
                          d.status === 'matched' ? '#1b3f6e' : 
                          d.status === 'picked_up' ? '#3d256e' : 
                          d.status === 'expired' ? '#333' : '#222',
                        color: 
                          d.status === 'available' ? '#82bc8a' : 
                          d.status === 'matched' ? '#62a8ff' : 
                          d.status === 'picked_up' ? '#a57fff' : 
                          d.status === 'expired' ? '#888' : '#aaa',
                        textTransform: 'uppercase'
                      }}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: '#666', fontSize: '0.85rem' }}>{getRelativeTime(d.createdAt)}</td>
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
