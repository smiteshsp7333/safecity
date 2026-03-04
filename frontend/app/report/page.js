'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const QUICK_REPORTS = [
  { emoji: '🚨', label: 'Being Followed', category: 'harassment', description: 'Someone is following me and I feel unsafe', severity: 4 },
  { emoji: '👊', label: 'Physical Attack', category: 'assault', description: 'I am being physically attacked or assaulted', severity: 5 },
  { emoji: '🔦', label: 'Unsafe Dark Area', category: 'poor_lighting', description: 'This area is very dark and unsafe with no street lights', severity: 3 },
  { emoji: '🏃', label: 'Chain Snatching', category: 'theft', description: 'Chain snatching or theft just happened here', severity: 4 },
  { emoji: '😤', label: 'Harassment', category: 'harassment', description: 'I am being verbally harassed and feel threatened', severity: 3 },
  { emoji: '🚧', label: 'Unsafe Area', category: 'unsafe_area', description: 'This area feels very unsafe and isolated', severity: 3 },
];

export default function ReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    address: '', category: '', description: '', severity: 3, anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState('quick'); // 'quick' or 'detailed'

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(f => ({ ...f, coordinates: [pos.coords.longitude, pos.coords.latitude] }));
      alert('📍 Location captured!');
    });
  };

  const handleQuickReport = async (quick) => {
    if (!form.coordinates) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        const token = localStorage.getItem('token');
        await axios.post('https://safecity-backend-0083.onrender.com/api/reports', {
          ...quick,
          address: form.address || 'Location captured via GPS',
          coordinates: coords,
          anonymous: false
        }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess(true);
        setTimeout(() => router.push('/map'), 2000);
      });
    } else {
      const token = localStorage.getItem('token');
      await axios.post('https://safecity-backend-0083.onrender.com/api/reports', {
        ...quick,
        address: form.address || 'Location captured via GPS',
        coordinates: form.coordinates,
        anonymous: false
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setTimeout(() => router.push('/map'), 2000);
    }
  };

  const analyzeReport = async () => {
    if (!form.description) return alert('Write description first!');
    setAnalyzing(true);
    try {
      const res = await axios.post('http://localhost:5001/analyze-report', {
        description: form.description,
        category: form.category,
        address: form.address
      });
      setAnalysis(res.data);
      if (res.data.detected_category) setForm(f => ({ ...f, category: res.data.detected_category, severity: res.data.severity }));
    } catch (err) {
      alert('AI analysis failed');
    }
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!form.coordinates) return alert('Please capture your location first!');
    if (analysis?.is_fake) return alert('⚠️ This report appears to be fake. Please provide genuine information.');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://safecity-backend-0083.onrender.com/api/reports', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => router.push('/map'), 2000);
    } catch (err) {
      alert('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: 'sans-serif', color: 'white', display: 'flex' }}>
      {/* sidebar */}
      <div style={{
        width: '220px', minWidth: '220px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Safe<span style={{ color: '#ef4444' }}>City</span></h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>PROTECTION NETWORK</p>
        </div>
        {[
          { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
          { icon: '🗺️', label: 'Safety Map', path: '/map' },
          { icon: '📍', label: 'Report Incident', path: '/report', active: true },
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts' },
          { icon: '📊', label: 'My Reports', path: '/my-reports' },
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
      </div>

      {/* content */}
      <div style={{ flex: 1, padding: '32px', maxWidth: '900px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>📍 Report an Incident</h2>
        <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>Quick report for emergencies or detailed report with AI analysis</p>

        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#22c55e' }}>
            ✅ Report submitted! Redirecting to map...
          </div>
        )}

        {/* mode toggle */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['quick', 'detailed'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: mode === m ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'transparent',
              border: mode === m ? 'none' : '1px solid #333',
              color: mode === m ? 'white' : '#6b7280',
              boxShadow: mode === m ? '0 4px 20px rgba(220,38,38,0.3)' : 'none'
            }}>
              {m === 'quick' ? '⚡ Quick Report' : '📝 Detailed Report'}
            </button>
          ))}
        </div>

        {/* quick report mode */}
        {mode === 'quick' && (
          <div>
            <div style={{
              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '14px', marginBottom: '24px', fontSize: '14px', color: '#9ca3af'
            }}>
              ⚡ One tap reporting — your GPS location is captured automatically. Use this in emergencies!
            </div>

            {/* address optional */}
            <div style={{ marginBottom: '20px' }}>
              <input
                placeholder="📍 Area name (optional — GPS will be used)"
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333',
                  borderRadius: '12px', padding: '12px 16px', color: 'white',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {QUICK_REPORTS.map((quick, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReport(quick)}
                  style={{
                    background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                    border: '1px solid #1a1a1a', borderRadius: '16px',
                    padding: '24px 16px', cursor: 'pointer', color: 'white',
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.border = '1px solid #ef4444'}
                  onMouseLeave={e => e.currentTarget.style.border = '1px solid #1a1a1a'}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{quick.emoji}</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>{quick.label}</div>
                  <div style={{
                    background: quick.severity >= 4 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: quick.severity >= 4 ? '#ef4444' : '#f59e0b',
                    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', display: 'inline-block'
                  }}>
                    Severity {quick.severity}/5
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* detailed report mode */}
        {mode === 'detailed' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Report Details</h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Location</label>
                <button onClick={getLocation} style={{
                  background: form.coordinates ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${form.coordinates ? '#22c55e' : '#ef4444'}`,
                  color: form.coordinates ? '#22c55e' : '#ef4444',
                  padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px'
                }}>
                  {form.coordinates ? '✅ Location Captured' : '📍 Capture My Location'}
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Address</label>
                <input placeholder="e.g. MG Road, Pune" onChange={e => setForm({ ...form, address: e.target.value })} style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
                  padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Category {analysis && <span style={{ color: '#ef4444' }}>(AI detected)</span>}
                </label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
                  padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                }}>
                  <option value="">Select category</option>
                  <option value="harassment">Harassment</option>
                  <option value="theft">Theft</option>
                  <option value="assault">Assault</option>
                  <option value="unsafe_area">Unsafe Area</option>
                  <option value="poor_lighting">Poor Lighting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea placeholder="Describe what happened..." rows={4} onChange={e => setForm({ ...form, description: e.target.value })} style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
                  padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'none'
                }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  Severity: {form.severity}/5 {analysis && <span style={{ color: '#ef4444' }}>(AI scored)</span>}
                </label>
                <input type="range" min="1" max="5" value={form.severity}
                  onChange={e => setForm({ ...form, severity: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#ef4444' }} />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" onChange={e => setForm({ ...form, anonymous: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#ef4444' }} />
                <label style={{ color: '#9ca3af', fontSize: '14px' }}>Submit anonymously</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={analyzeReport} disabled={analyzing} style={{
                  flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '12px', padding: '12px', color: '#ef4444', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                }}>
                  {analyzing ? '🤖 Analyzing...' : '🤖 AI Analyze'}
                </button>
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 1, background: 'linear-gradient(135deg, #dc2626, #991b1b)', border: 'none',
                  borderRadius: '12px', padding: '12px', color: 'white', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,0.3)'
                }}>
                  {loading ? 'Submitting...' : 'Submit →'}
                </button>
              </div>
            </div>

            {/* AI analysis */}
            <div>
              {!analysis ? (
                <div style={{
                  background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a',
                  borderRadius: '20px', padding: '28px', textAlign: 'center', color: '#6b7280',
                  height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <p style={{ margin: 0 }}>Write description and click AI Analyze</p>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                  border: `1px solid ${analysis.is_fake ? '#ef4444' : '#1a1a1a'}`,
                  borderRadius: '20px', padding: '28px'
                }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>🤖 AI Analysis Result</h3>

                  {analysis.is_fake && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#ef4444' }}>
                      ⚠️ Fake Report Detected: {analysis.fake_reason}
                    </div>
                  )}

                  <div style={{
                    background: `${analysis.priority_color}20`, border: `1px solid ${analysis.priority_color}`,
                    borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center'
                  }}>
                    <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Priority Level</p>
                    <p style={{ margin: 0, color: analysis.priority_color, fontSize: '24px', fontWeight: '900' }}>{analysis.priority}</p>
                  </div>

                  {[
                    { label: 'Detected Category', value: analysis.detected_category?.replace('_', ' ').toUpperCase() },
                    { label: 'AI Severity Score', value: `${analysis.severity}/5` },
                    { label: 'Urgent Case', value: analysis.is_urgent ? '🚨 YES' : '✅ No' },
                    { label: 'Word Count', value: analysis.word_count },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>{item.label}</span>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.value}</span>
                    </div>
                  ))}

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '14px', marginTop: '16px' }}>
                    <p style={{ margin: '0 0 6px 0', color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>AI Recommendation</p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6' }}>{analysis.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
