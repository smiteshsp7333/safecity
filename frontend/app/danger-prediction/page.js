'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DangerPrediction() {
  const router = useRouter();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeContext, setTimeContext] = useState('');
  const [dayContext, setDayContext] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [totalAreas, setTotalAreas] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const reports = await fetch('https://safecity-backend-0083.onrender.com/api/reports').then(r => r.json());
      const res = await fetch('http://localhost:5001/predict-danger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports })
      }).then(r => r.json());
      setPredictions(res.predictions || []);
      setTimeContext(res.time_context);
      setDayContext(res.day_context);
      setGeneratedAt(res.generated_at);
      setTotalAreas(res.total_areas_analyzed);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

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
          { icon: '🤖', label: 'Danger Prediction', path: '/danger-prediction', active: true },
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
      </div>

      {/* content */}
      <div style={{ marginLeft: '220px', padding: '32px', flex: 1 }}>

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>🤖 AI Danger Prediction</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Predicting unsafe areas based on historical crime patterns
            </p>
          </div>
          <button onClick={fetchPredictions} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', padding: '10px 20px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>🔄 Refresh</button>
        </div>

        {/* context cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Time Period', value: timeContext, icon: '🕐', color: '#f59e0b' },
              { label: 'Day Type', value: dayContext, icon: '📅', color: '#22c55e' },
              { label: 'Areas Analyzed', value: totalAreas, icon: '📍', color: '#ef4444' },
              { label: 'Generated At', value: generatedAt, icon: '🤖', color: '#84cc16' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: item.color }}>{item.value}</p>
                  </div>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #151515)',
            border: '1px solid #1a1a1a', borderRadius: '20px', padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>AI is analyzing crime patterns...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #151515)',
            border: '1px solid #1a1a1a', borderRadius: '20px', padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <p style={{ color: '#22c55e', fontSize: '18px', fontWeight: '700' }}>No danger zones detected!</p>
            <p style={{ color: '#6b7280' }}>Not enough crime data to make predictions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {predictions.map((pred, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                border: `1px solid ${pred.color}40`,
                borderRadius: '20px', padding: '24px',
                boxShadow: `0 4px 20px ${pred.color}15`
              }}>
                {/* header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📍 {pred.area}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      {pred.incident_count} total incidents • {pred.recent_incidents} this week
                    </p>
                  </div>
                  <div style={{
                    background: `${pred.color}20`, border: `1px solid ${pred.color}`,
                    color: pred.color, padding: '6px 12px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: '700'
                  }}>{pred.risk_level}</div>
                </div>

                {/* risk score bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Risk Score</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: pred.color }}>{pred.risk_score}%</span>
                  </div>
                  <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '8px' }}>
                    <div style={{
                      background: `linear-gradient(90deg, ${pred.color}, ${pred.color}aa)`,
                      height: '8px', borderRadius: '4px',
                      width: `${pred.risk_score}%`,
                      transition: 'width 1s ease'
                    }}></div>
                  </div>
                </div>

                {/* details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Common Crime', value: pred.most_common_crime },
                    { label: 'Time Factor', value: pred.time_factor },
                    { label: 'Day Factor', value: pred.day_factor },
                    { label: 'Recent (7d)', value: pred.recent_incidents },
                  ].map((item, j) => (
                    <div key={j} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 12px' }}>
                      <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* advice */}
                <div style={{
                  background: `${pred.color}10`, border: `1px solid ${pred.color}30`,
                  borderRadius: '10px', padding: '12px', fontSize: '13px', lineHeight: '1.5'
                }}>
                  {pred.advice}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
