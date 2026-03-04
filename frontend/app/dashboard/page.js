'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import ShakeDetector from '../../components/ShakeDetector';

const HELPLINES = [
  { name: 'Police', number: '100', icon: '👮', color: '#ef4444' },
  { name: 'Women Helpline', number: '1091', icon: '👩', color: '#f59e0b' },
  { name: 'Ambulance', number: '108', icon: '🚑', color: '#22c55e' },
  { name: 'Child Helpline', number: '1098', icon: '👶', color: '#84cc16' },
  { name: 'Cyber Crime', number: '1930', icon: '💻', color: '#a855f7' },
  { name: 'Fire Brigade', number: '101', icon: '🔥', color: '#f97316' },
];

const SAFETY_TIPS = [
  { tip: 'Share your live location with trusted contacts when travelling alone at night', icon: '📍' },
  { tip: 'Trust your instincts — if something feels wrong, leave immediately', icon: '🧠' },
  { tip: 'Keep emergency numbers saved and accessible on your phone', icon: '📱' },
  { tip: 'Avoid isolated areas especially after dark', icon: '🌙' },
  { tip: 'Always inform someone about your travel plans and expected arrival time', icon: '🗓️' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [safetyScore, setSafetyScore] = useState(null);
  const [safetyLabel, setSafetyLabel] = useState('Calculating...');
  const [safetyColor, setSafetyColor] = useState('#22c55e');
  const [time, setTime] = useState('');
  const [liveAlert, setLiveAlert] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Reports Today', value: '--', change: '', icon: '📍' },
    { label: 'Active Alerts', value: '--', change: '', icon: '⚠️' },
    { label: 'Safe Routes', value: '12', change: '+2', icon: '🛡️' },
    { label: 'Volunteers', value: '89', change: '+5', icon: '👥' },
  ]);

  const recentAlerts = [
    { area: 'Shivaji Nagar', type: 'Harassment', time: '2 min ago', severity: 'high' },
    { area: 'Koregaon Park', type: 'Poor Lighting', time: '15 min ago', severity: 'medium' },
    { area: 'Kothrud', type: 'Unsafe Area', time: '1 hr ago', severity: 'low' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    setUser(JSON.parse(userData));

    const socket = io('https://safecity-backend-0083.onrender.com');
    socket.on('new_report', (report) => {
      setLiveAlert(report);
      setTimeout(() => setLiveAlert(null), 5000);
    });

    fetch('https://safecity-backend-0083.onrender.com/api/reports')
      .then(r => r.json())
      .then(data => {
        const today = new Date().toDateString();
        const todayCount = data.filter(r => new Date(r.createdAt).toDateString() === today).length;
        const highSeverity = data.filter(r => r.severity >= 4).length;
        setStats([
          { label: 'Reports Today', value: todayCount, change: `+${todayCount}`, icon: '📍' },
          { label: 'Active Alerts', value: highSeverity, change: `+${highSeverity}`, icon: '⚠️' },
          { label: 'Safe Routes', value: '12', change: '+2', icon: '🛡️' },
          { label: 'Volunteers', value: '89', change: '+5', icon: '👥' },
        ]);

        fetch('http://localhost:5001/predict-danger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reports: data })
        }).then(r => r.json()).then(res => setPredictions(res.predictions?.slice(0, 3) || []));
      });

    fetch('https://safecity-backend-0083.onrender.com/api/sos/contacts', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setContacts(data.contacts || []));

    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const reps = await fetch('https://safecity-backend-0083.onrender.com/api/reports').then(r => r.json());
      const aiRes = await fetch('http://localhost:5001/safety-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, reports: reps })
      }).then(r => r.json());
      setSafetyScore(aiRes.score);
      setSafetyLabel(aiRes.label);
      setSafetyColor(aiRes.color);
    });

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => { clearInterval(interval); socket.disconnect(); };
  }, []);

  const handleSOS = async () => {
    setSosActive(true);
    if (!navigator.geolocation) { alert('Geolocation not supported'); setSosActive(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const token = localStorage.getItem('token');
      const res = await fetch('https://safecity-backend-0083.onrender.com/api/sos/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude, longitude })
      });
      const data = await res.json();
      alert(data.message);
      setSosActive(false);
    });
  };

  const scoreDeg = safetyScore ? (safetyScore / 100) * 360 : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: "'Inter', sans-serif", color: 'white' }}>
      <ShakeDetector onShake={handleSOS} />

      {liveAlert && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          background: 'linear-gradient(135deg, #1a0000, #2d0000)',
          border: '1px solid #ef4444', borderRadius: '16px', padding: '16px 20px',
          boxShadow: '0 0 30px rgba(220,38,38,0.4)', maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>NEW ALERT</span>
          </div>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '15px', textTransform: 'capitalize' }}>{liveAlert.category?.replace('_', ' ')}</p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>📍 {liveAlert.address}</p>
          <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>Severity: {liveAlert.severity}/5</p>
        </div>
      )}

      {/* sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px',
        background: '#0a0a0a', borderRight: '1px solid #1a1a1a',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 100
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Safe<span style={{ color: '#ef4444' }}>City</span></h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>PROTECTION NETWORK</p>
        </div>
        {[
          { icon: '⊞', label: 'Dashboard', path: '/dashboard', active: true },
          { icon: '🗺️', label: 'Safety Map', path: '/map' },
          { icon: '📍', label: 'Report Incident', path: '/report' },
          { icon: '🤖', label: 'Danger Prediction', path: '/danger-prediction' },
          { icon: '👥', label: 'Trusted Contacts', path: '/contacts' },
          { icon: '📊', label: 'My Reports', path: '/my-reports' },
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
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280' }}>LOGGED IN AS</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>👤 {user?.name}</p>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} style={{
            width: '100%', background: 'transparent', border: '1px solid #222',
            color: '#6b7280', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
          }}>← Logout</button>
        </div>
      </div>

      {/* main content */}
      <div style={{ marginLeft: '220px', padding: '32px' }}>

        {/* top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Good {greeting}, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Here's what's happening in your city right now</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{time}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date().toDateString()}</div>
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0f0f0f, #151515)',
              border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                  <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>{stat.value}</h3>
                </div>
                <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#22c55e', fontSize: '12px' }}>{stat.change} today</p>
            </div>
          ))}
        </div>

        {/* row 1 - SOS + AI score + safety tips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 300px', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #151515)',
            border: '1px solid #1a1a1a', borderRadius: '20px', padding: '28px',
            display: 'flex', alignItems: 'center', gap: '32px'
          }}>
            <button onClick={handleSOS} disabled={sosActive} style={{
              background: sosActive ? '#7f1d1d' : 'linear-gradient(135deg, #dc2626, #991b1b)',
              border: 'none', borderRadius: '50%', width: '120px', height: '120px', minWidth: '120px',
              fontSize: '14px', fontWeight: '900', color: 'white', cursor: 'pointer',
              boxShadow: sosActive ? 'none' : '0 0 50px rgba(220,38,38,0.5)', letterSpacing: '2px'
            }}>
              🚨<br />SOS<br /><span style={{ fontSize: '9px', fontWeight: '400' }}>PRESS FOR HELP</span>
            </button>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Emergency SOS</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '13px', lineHeight: '1.6' }}>
                Instantly alert trusted contacts with your GPS location and nearest police station.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['📱 SMS Alert', '📍 Live Location', '🚔 Police Alert'].map((tag, i) => (
                  <div key={i} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', color: '#ef4444' }}>{tag}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Safety Score</p>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `conic-gradient(${safetyColor} 0deg ${scoreDeg}deg, #1a1a1a ${scoreDeg}deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#0f0f0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '800', color: safetyColor
              }}>{safetyScore || '--'}</div>
            </div>
            <p style={{ margin: 0, color: safetyColor, fontSize: '14px', fontWeight: '600' }}>{safetyLabel}</p>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '11px' }}>Based on nearby reports</p>
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 Safety Tips</p>
            {SAFETY_TIPS.slice(0, 1).map((tip, i) => (
              <div key={i}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{tip.icon}</div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.7', color: '#d1d5db' }}>{tip.tip}</p>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
              {SAFETY_TIPS.slice(1, 4).map((tip, i) => (
                <p key={i} style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>{tip.icon} {tip.tip.substring(0, 50)}...</p>
              ))}
            </div>
          </div>
        </div>

        {/* row 2 - recent alerts + predictions + contacts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>⚠️ Recent Alerts</h3>
              <span onClick={() => router.push('/map')} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>View Map →</span>
            </div>
            {recentAlerts.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < recentAlerts.length - 1 ? '1px solid #1a1a1a' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#22c55e' }}></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{alert.area}</p>
                    <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '11px' }}>{alert.type}</p>
                  </div>
                </div>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{alert.time}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>🤖 AI Predictions</h3>
              <span onClick={() => router.push('/danger-prediction')} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>View All →</span>
            </div>
            {predictions.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Analyzing patterns...</p>
            ) : predictions.map((pred, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < predictions.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>📍 {pred.area}</span>
                  <span style={{ color: pred.color, fontSize: '12px', fontWeight: '700' }}>{pred.risk_level}</span>
                </div>
                <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '4px' }}>
                  <div style={{ background: pred.color, height: '4px', borderRadius: '4px', width: `${pred.risk_score}%` }}></div>
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '11px' }}>{pred.most_common_crime} • {pred.risk_score}% risk</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>👥 Trusted Contacts</h3>
              <span onClick={() => router.push('/contacts')} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Manage →</span>
            </div>
            {contacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>No contacts added yet</p>
                <button onClick={() => router.push('/contacts')} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'
                }}>+ Add Contact</button>
              </div>
            ) : contacts.slice(0, 3).map((contact, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0', borderBottom: i < contacts.length - 1 ? '1px solid #1a1a1a' : 'none'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{contact.name}</p>
                  <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '11px' }}>+91 {contact.phone}</p>
                </div>
                <span style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '6px', fontSize: '10px' }}>Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* row 3 - helplines + quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700' }}>📞 Emergency Helplines</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {HELPLINES.map((h, i) => (
                <div key={i} onClick={() => window.open(`tel:${h.number}`)} style={{
                  background: `${h.color}10`, border: `1px solid ${h.color}30`,
                  borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{h.icon}</div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '13px' }}>{h.name}</p>
                  <p style={{ margin: 0, color: h.color, fontSize: '20px', fontWeight: '900' }}>{h.number}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Actions</h3>
            {[
              { icon: '📍', label: 'Report Incident', path: '/report' },
              { icon: '👥', label: 'Add Trusted Contact', path: '/contacts' },
              { icon: '🗺️', label: 'View Safety Map', path: '/map' },
              { icon: '🤖', label: 'AI Predictions', path: '/danger-prediction' },
              { icon: '📊', label: 'My Reports', path: '/my-reports' },
            ].map((action, i) => (
              <button key={i} onClick={() => router.push(action.path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f1f',
                borderRadius: '10px', padding: '11px 14px', color: 'white',
                cursor: 'pointer', marginBottom: '8px', fontSize: '13px', textAlign: 'left'
              }}>
                <span>{action.icon}</span>
                <span>{action.label}</span>
                <span style={{ marginLeft: 'auto', color: '#6b7280' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* row 4 - profile widget */}
        <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700' }}>👤 My Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr auto', gap: '24px', alignItems: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: '700'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '16px' }}>{user?.name}</p>
              <p style={{ margin: '0 0 6px 0', color: '#6b7280', fontSize: '13px' }}>{user?.email}</p>
              <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 10px', borderRadius: '6px', fontSize: '11px' }}>✅ Verified User</span>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Reports Today</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{stats[0].value}</p>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Contacts</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>{contacts.length}</p>
            </div>
            <button onClick={() => router.push('/profile')} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '12px 24px', borderRadius: '12px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
            }}>✏️ Edit Profile</button>
          </div>
        </div>

      </div>
    </main>
  );
}
