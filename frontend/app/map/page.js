'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../../components/MapComponent'), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/reports')
      .then(r => r.json())
      .then(data => setReports(data));
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      fontFamily: 'sans-serif',
      color: 'white',
      display: 'flex'
    }}>
      {/* sidebar */}
      <div style={{
        width: '220px', minWidth: '220px',
        background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>PROTECTION NETWORK</p>
        </div>

        {[
          { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
          { icon: '🗺️', label: 'Safety Map', path: '/map', active: true },
          { icon: '📍', label: 'Report Incident', path: '/report' },
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts' },
          { icon: '📊', label: 'My Reports', path: '/my-reports' },
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

      {/* map area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🗺️ Safety Map</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>Live crime reports and danger zones near you</p>
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
