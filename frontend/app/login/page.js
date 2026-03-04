'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://safecity-backend-0083.onrender.com/api/auth/login', form);
      const data = res.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ngo' || data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top right, #3b0000 0%, #000 50%, #1a0000 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🚨</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: 0 }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>Welcome back. Stay safe.</p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #111, #1a1a1a)',
          border: '1px solid #2a2a2a', borderRadius: '20px', padding: '32px',
          boxShadow: '0 0 80px rgba(220,38,38,0.15)'
        }}>
          {error && (
            <div style={{
              background: 'rgba(153,27,27,0.3)', border: '1px solid #991b1b',
              color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
              marginBottom: '20px', fontSize: '14px'
            }}>⚠️ {error}</div>
          )}

          {[
            { label: 'Email', key: 'email', type: 'email', placeholder: 'priya@gmail.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: '16px' }}>
              <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333',
                  borderRadius: '12px', padding: '12px 16px', color: 'white',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', marginTop: '8px',
            background: loading ? '#7f1d1d' : 'linear-gradient(135deg, #dc2626, #991b1b)',
            border: 'none', borderRadius: '12px', padding: '14px', color: 'white',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 30px rgba(220,38,38,0.4)'
          }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>

          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <span onClick={() => router.push('/register')} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>
              Register
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
