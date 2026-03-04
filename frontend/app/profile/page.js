'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    const u = JSON.parse(userData);
    setUser(u);
    setForm({ name: u.name, phone: u.phone || '' });

    fetch('https://safecity-backend-0083.onrender.com/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setReports(data));
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('https://safecity-backend-0083.onrender.com/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
    setUser({ ...user, ...form });
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const totalReports = reports.length;
  const highSeverity = reports.filter(r => r.severity >= 4).length;

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: 'sans-serif', color: 'white', display: 'flex' }}>

      {/* sidebar */}
      <div style={{
        width: '220px', minWidth: '220px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, bottom: 0, left: 0
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
          { icon: '🤖', label: 'Danger Prediction', path: '/danger-prediction' },
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts' },
          { icon: '📊', label: 'My Reports', path: '/my-reports' },
          { icon: '👤', label: 'Profile', path: '/profile', active: true },
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
      </div>

      {/* content */}
      <div style={{ marginLeft: '220px', padding: '32px', flex: 1, maxWidth: '800px' }}>
        <h2 style={{ margin: '0 0 32px 0', fontSize: '24px', fontWeight: '700' }}>👤 My Profile</h2>

        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', borderRadius: '12px', padding: '14px', marginBottom: '24px', color: '#22c55e' }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* profile card */}
        <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '700'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>{user?.name}</h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{user?.email}</p>
              <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', display: 'inline-block' }}>✅ Verified User</span>
            </div>
            <button onClick={() => setEditing(!editing)} style={{
              marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px'
            }}>{editing ? 'Cancel' : '✏️ Edit Profile'}</button>
          </div>

          {editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
                  padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }} />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
                  padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }} />
              </div>
              <button onClick={handleSave} style={{
                gridColumn: '1 / -1', background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: 'none', borderRadius: '12px', padding: '14px', color: 'white',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer'
              }}>Save Changes →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: user?.phone || 'Not set' },
                { label: 'Role', value: user?.role || 'user' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', textTransform: 'capitalize' }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Reports', value: totalReports, icon: '📋', color: '#ef4444' },
            { label: 'High Severity', value: highSeverity, icon: '🚨', color: '#f59e0b' },
            { label: 'Safety Score', value: '--', icon: '🛡️', color: '#22c55e' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                  <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: stat.color }}>{stat.value}</h3>
                </div>
                <span style={{ fontSize: '28px' }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
