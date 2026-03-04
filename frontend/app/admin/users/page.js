'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: 'sans-serif', color: 'white', display: 'flex' }}>
      {/* sidebar */}
      <div style={{
        width: '240px', minWidth: '240px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0
      }}>
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Safe<span style={{ color: '#ef4444' }}>City</span></h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>NGO ADMIN PORTAL</p>
        </div>
        {[
          { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
          { icon: '📋', label: 'All Reports', path: '/admin/reports' },
          { icon: '🗺️', label: 'City Heatmap', path: '/admin/map' },
          { icon: '👥', label: 'Users', path: '/admin/users', active: true },
        ].map((item, i) => (
          <div key={i} onClick={() => router.push(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '10px', marginBottom: '4px', cursor: 'pointer',
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

      {/* content */}
      <div style={{ marginLeft: '240px', padding: '32px', flex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>👥 Registered Users</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{users.length} users registered on SafeCity</p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #151515)',
          border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Name', 'Email', 'Phone', 'Role', 'Contacts', 'Joined'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</td></tr>
              ) : users.map((user, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0f0f0f' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(239,68,68,0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                      }}>👤</div>
                      {user.name}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{user.email}</td>
                  <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{user.phone || 'N/A'}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      background: user.role === 'ngo' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: user.role === 'ngo' ? '#ef4444' : '#22c55e',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '12px'
                    }}>{user.role || 'user'}</span>
                  </td>
                  <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{user.trustedContacts?.length || 0}</td>
                  <td style={{ padding: '14px 12px', color: '#6b7280', fontSize: '12px' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
