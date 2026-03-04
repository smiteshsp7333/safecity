'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/sos/contacts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setContacts(data.contacts));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone) return alert('Fill all fields!');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://safecity-backend-0083.onrender.com/api/sos/add-contact', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data.contacts);
      setForm({ name: '', phone: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Something went wrong');
    }
    setLoading(false);
  };

  const handleDelete = async (contactId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`https://safecity-backend-0083.onrender.com/api/sos/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setContacts(data.contacts);
  };

  return (
    <main style={{
      minHeight: '100vh', background: '#050505',
      fontFamily: 'sans-serif', color: 'white', display: 'flex'
    }}>
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
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts', active: true },
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

      <div style={{ flex: 1, padding: '32px', maxWidth: '700px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>👥 Trusted Contacts</h2>
        <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: '14px' }}>These people will be alerted when you press SOS</p>

        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e',
            borderRadius: '12px', padding: '16px', marginBottom: '24px',
            color: '#22c55e', fontSize: '14px'
          }}>✅ Contact added successfully!</div>
        )}

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #151515)',
          border: '1px solid #1a1a1a', borderRadius: '20px', padding: '28px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>➕ Add New Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Name</label>
              <input
                value={form.name}
                placeholder="Mom, Sister, Friend..."
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333',
                  borderRadius: '12px', padding: '12px 16px', color: 'white',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
              <input
                value={form.phone}
                placeholder="9999999999"
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333',
                  borderRadius: '12px', padding: '12px 16px', color: 'white',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          <button onClick={handleAdd} disabled={loading} style={{
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            border: 'none', borderRadius: '12px', padding: '12px 24px',
            color: 'white', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.3)'
          }}>
            {loading ? 'Adding...' : '+ Add Contact'}
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #151515)',
          border: '1px solid #1a1a1a', borderRadius: '20px', padding: '28px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>📋 Your Contacts ({contacts.length})</h3>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
              <p style={{ margin: 0 }}>No contacts added yet!</p>
            </div>
          ) : (
            contacts.map((contact, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid #1f1f1f', borderRadius: '12px', marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>👤</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>{contact.name}</p>
                    <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '13px' }}>📱 +91 {contact.phone}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#22c55e', padding: '6px 12px', borderRadius: '8px', fontSize: '12px'
                  }}>✓ Active</div>
                  <button
                    onClick={() => handleDelete(contact._id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444', padding: '6px 12px',
                      borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
                    }}
                  >🗑️ Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
