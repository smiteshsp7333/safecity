'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../../../components/MapComponent'), { ssr: false });

export default function AdminMap() {
  const router = useRouter();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/reports')
      .then(r => r.json())
      .then(data => setReports(data));
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: 'sans-serif', color: 'white', display: 'flex' }}>

      {/* sidebar */}
      <div style={{
        width: '240px', minWidth: '240px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, bottom: 0, left: 0
      }}>
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>NGO ADMIN PORTAL</p>
        </div>
        {[
          { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
          { icon: '📋', label: 'All Reports', path: '/admin/reports' },
          { icon: '🗺️', label: 'City Heatmap', path: '/admin/map', active: true },
          { icon: '👥', label: 'Users', path: '/admin/users' },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '10px', marginBottom: '4px', cursor: 'pointer',
            background: item.active ? 'rgba(239,68,68,0.1)' : 'transparent',
            borderLeft: item.active ? '3px solid #ef4444' : '3px solid transparent',
            color: item.active ? 'white' : '#6b7280', fontSize: '14px'
          }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); router.push('/admin'); }} style={{
            width: '100%', background: 'transparent', border: '1px solid #222',
            color: '#6b7280', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
          }}>← Logout</button>
        </div>
      </div>

      {/* map */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🗺️ City Heatmap</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>{reports.length} total reports across the city</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { color: '#ef4444', label: 'High Severity' },
              { color: '#f59e0b', label: 'Medium' },
              { color: '#22c55e', label: 'Low' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <MapComponent reports={reports} />
        </div>
      </div>
    </main>
  );
}
