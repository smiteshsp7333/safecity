'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://safecity-backend-0083.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      if (false) {
        setError('Access denied. NGO credentials required.');
        setLoading(false);
        return;
      }
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <main style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', margin: '0 0 8px 0' }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#ef4444', fontSize: '11px', letterSpacing: '3px', margin: '0 0 8px 0' }}>NGO ADMIN PORTAL</p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Authorized personnel only</p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #151515)',
          border: '1px solid #1a1a1a', borderRadius: '20px', padding: '32px'
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
              borderRadius: '10px', padding: '12px', marginBottom: '20px',
              color: '#ef4444', fontSize: '14px'
            }}>⚠️ {error}</div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              placeholder="ngo@safecity.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', background: '#0a0a0a', border: '1px solid #333',
                borderRadius: '12px', padding: '12px 16px', color: 'white',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', background: '#0a0a0a', border: '1px solid #333',
                borderRadius: '12px', padding: '12px 16px', color: 'white',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            border: 'none', borderRadius: '12px', padding: '14px',
            color: 'white', fontSize: '16px', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 4px 30px rgba(220,38,38,0.4)'
          }}>
            {loading ? 'Signing in...' : 'Access Admin Portal →'}
          </button>

          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '20px', marginBottom: 0 }}>
            🔒 Restricted to NGO and Government personnel only
          </p>
        </div>
      </div>
    </main>
  );
}
