'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setReports(data); setLoading(false); });
  }, []);

  const severityColor = (s) => s >= 4 ? '#ef4444' : s >= 3 ? '#f59e0b' : '#22c55e';
  const categoryEmoji = (c) => ({
    harassment: '😤', theft: '🦹', assault: '⚠️',
    unsafe_area: '🚧', poor_lighting: '💡', other: '📌'
  })[c] || '📌';

  return (
    <main style={{
      minHeight: '100vh', background: '#050505',
      fontFamily: 'sans-serif', color: 'white', display: 'flex'
    }}>
      {/* sidebar */}
      <div style={{
        width: '220px', minWidth: '220px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>PROTECTION NETWORK</p>
        </div>
        {[
          { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
          { icon: '🗺️', label: 'Safety Map', path: '/map' },
          { icon: '📍', label: 'Report Incident', path: '/report' },
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts' },
          { icon: '📊', label: 'My Reports', path: '/my-reports', active: true },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '10px', marginBottom: '4px',
            cursor: 'pointer',
            background: item.active ? 'rgba(239,68,68,0.1)' : 'transparent',
            borderLeft: item.active ? '3px solid #ef4444' : '3px solid transparent',
            color: item.active ? 'white' : '#6b7280', fontSize: '14px'
          }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* content */}
      <div style={{ flex: 1, padding: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>📊 My Reports</h2>
        <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: '14px' }}>All incidents reported by the community</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #151515)',
            border: '1px solid #1a1a1a', borderRadius: '20px',
            padding: '60px', textAlign: 'center', color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ margin: 0 }}>No reports yet. Be the first to report an incident!</p>
            <button
              onClick={() => router.push('/report')}
              style={{
                marginTop: '20px', background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: 'none', borderRadius: '12px', padding: '12px 24px',
                color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
              }}
            >+ Report Incident</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {reports.map((report, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{categoryEmoji(report.category)}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', textTransform: 'capitalize' }}>
                        {report.category?.replace('_', ' ')}
                      </p>
                      <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                        {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    background: `${severityColor(report.severity)}20`,
                    border: `1px solid ${severityColor(report.severity)}40`,
                    color: severityColor(report.severity),
                    padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600'
                  }}>
                    Severity {report.severity}/5
                  </div>
                </div>

                <p style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '13px' }}>
                  📍 {report.address}
                </p>
                <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>
                  {report.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: report.anonymous ? 'rgba(107,114,128,0.2)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${report.anonymous ? '#374151' : 'rgba(239,68,68,0.2)'}`,
                    color: report.anonymous ? '#6b7280' : '#ef4444',
                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px'
                  }}>
                    {report.anonymous ? '🕵️ Anonymous' : '👤 Public'}
                  </span>
                  <button
                    onClick={() => router.push('/map')}
                    style={{
                      background: 'transparent', border: '1px solid #333',
                      color: '#9ca3af', padding: '4px 12px',
                      borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
                    }}
                  >View on Map →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
