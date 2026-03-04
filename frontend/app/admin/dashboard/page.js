'use client';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, today: 0, resolved: 0, users: 0, categories: {} });
  const [loading, setLoading] = useState(true);
  const [sosAlert, setSosAlert] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }

    fetch('https://safecity-backend-0083.onrender.com/api/reports')
      .then(r => r.json())
      .then(async data => {
        setReports(data);
        const today = new Date().toDateString();
        const todayReports = data.filter(r => new Date(r.createdAt).toDateString() === today);
        const highSeverity = data.filter(r => r.severity >= 4);
        const resolved = data.filter(r => r.status === 'resolved');
        const categories = {};
        data.forEach(r => { categories[r.category] = (categories[r.category] || 0) + 1; });

        // fetch total users
        const usersRes = await fetch('https://safecity-backend-0083.onrender.com/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => []);
        const totalUsers = Array.isArray(usersRes) ? usersRes.length : 0;

        setStats({ total: data.length, high: highSeverity.length, today: todayReports.length, resolved: resolved.length, users: totalUsers, categories });
        setLoading(false);
      });

    const socket = io('https://safecity-backend-0083.onrender.com');
    socket.on('sos_alert', (data) => {
      setSosAlert(data);
      setTimeout(() => setSosAlert(null), 15000);
    });

    return () => socket.disconnect();
  }, []);

  const severityColor = (s) => s >= 4 ? '#ef4444' : s >= 3 ? '#f59e0b' : '#22c55e';
  const adminUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('adminUser') || '{}') : {};

  const statusConfig = {
    pending: { label: '⏳ Pending', color: '#ef4444' },
    in_progress: { label: '🔄 In Progress', color: '#f59e0b' },
    resolved: { label: '✅ Resolved', color: '#22c55e' },
    fake: { label: '❌ Fake', color: '#6b7280' },
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      reports: reports.filter(r => new Date(r.createdAt).toDateString() === d.toDateString()).length
    };
  });

  const pieData = [
    { name: 'Critical (5)', value: reports.filter(r => r.severity === 5).length },
    { name: 'High (4)', value: reports.filter(r => r.severity === 4).length },
    { name: 'Medium (3)', value: reports.filter(r => r.severity === 3).length },
    { name: 'Low (1-2)', value: reports.filter(r => r.severity <= 2).length },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#050505', fontFamily: 'sans-serif', color: 'white', display: 'flex' }}>

      {/* live SOS popup */}
      {sosAlert && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'linear-gradient(135deg, #1a0000, #2d0000)',
          border: '2px solid #ef4444', borderRadius: '16px', padding: '20px 24px',
          boxShadow: '0 0 40px rgba(220,38,38,0.6)', maxWidth: '360px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🚨</span>
            <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '16px', letterSpacing: '1px' }}>LIVE SOS ALERT!</span>
          </div>
          <p style={{ margin: '0 0 6px 0', fontWeight: '700', fontSize: '15px' }}>👤 {sosAlert.userName}</p>
          <p style={{ margin: '0 0 6px 0', color: '#9ca3af', fontSize: '13px' }}>📞 {sosAlert.userPhone}</p>
          <p style={{ margin: '0 0 6px 0', color: '#9ca3af', fontSize: '13px' }}>🚔 {sosAlert.nearestStation}</p>
          <a href={sosAlert.locationLink} target="_blank" rel="noreferrer" style={{
            display: 'block', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444',
            borderRadius: '8px', padding: '8px 12px', color: '#ef4444', fontSize: '13px',
            textDecoration: 'none', textAlign: 'center', marginTop: '10px', fontWeight: '600'
          }}>📍 View Live Location →</a>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>
            {new Date(sosAlert.timestamp).toLocaleTimeString('en-IN')}
          </p>
          <button onClick={() => setSosAlert(null)} style={{
            position: 'absolute', top: '10px', right: '12px',
            background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px'
          }}>✕</button>
        </div>
      )}

      {/* sidebar */}
      <div style={{
        width: '240px', minWidth: '240px', background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0
      }}>
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            Safe<span style={{ color: '#ef4444' }}>City</span>
          </h1>
          <p style={{ color: '#ef4444', fontSize: '10px', margin: '4px 0 0 0', letterSpacing: '2px' }}>NGO ADMIN PORTAL</p>
        </div>
        {[
          { icon: '📊', label: 'Dashboard', path: '/admin/dashboard', active: true },
          { icon: '📋', label: 'All Reports', path: '/admin/reports' },
          { icon: '🗺️', label: 'City Heatmap', path: '/admin/map' },
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
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280' }}>LOGGED IN AS</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>🏢 {adminUser?.name}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#ef4444' }}>NGO ADMIN</p>
          </div>
          <button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); router.push('/admin'); }} style={{
            width: '100%', background: 'transparent', border: '1px solid #222',
            color: '#6b7280', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
          }}>← Logout</button>
        </div>
      </div>

      {/* main */}
      <div style={{ marginLeft: '240px', padding: '32px', flex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>📊 NGO Admin Dashboard</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Real-time city safety overview — {new Date().toDateString()}</p>
        </div>

        {/* stats - 6 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Reports', value: stats.total, icon: '📋', color: '#ef4444' },
            { label: 'High Severity', value: stats.high, icon: '🚨', color: '#ef4444' },
            { label: 'Reports Today', value: stats.today, icon: '📅', color: '#f59e0b' },
            { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#22c55e' },
            { label: 'Total Users', value: stats.users, icon: '👥', color: '#84cc16' },
            { label: 'Categories', value: Object.keys(stats.categories).length, icon: '🏷️', color: '#a855f7' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: stat.color }}>{loading ? '--' : stat.value}</h3>
                </div>
                <span style={{ fontSize: '22px' }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>📊 Reports by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Object.entries(stats.categories).map(([name, value]) => ({ name: name.replace('_', ' '), value }))}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>🥧 Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={{ stroke: '#6b7280' }}>
                  {['#dc2626', '#ef4444', '#f59e0b', '#22c55e'].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* line chart */}
        <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>📈 Reports Over Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7Days}>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: 'white' }} />
              <Line type="monotone" dataKey="reports" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* high severity */}
        <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>🚨 High Severity Reports</h3>
          {reports.filter(r => r.severity >= 4).slice(0, 5).map((report, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{report.category?.replace('_', ' ')}</p>
                <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>📍 {report.address}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  background: `${statusConfig[report.status || 'pending'].color}20`,
                  color: statusConfig[report.status || 'pending'].color,
                  padding: '3px 10px', borderRadius: '6px', fontSize: '11px'
                }}>{statusConfig[report.status || 'pending'].label}</span>
                <div style={{
                  background: `${severityColor(report.severity)}20`,
                  border: `1px solid ${severityColor(report.severity)}`,
                  color: severityColor(report.severity),
                  padding: '4px 10px', borderRadius: '8px', fontSize: '12px'
                }}>{report.severity}/5</div>
              </div>
            </div>
          ))}
        </div>

        {/* all reports table */}
        <div style={{ background: 'linear-gradient(145deg, #0f0f0f, #151515)', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>📋 All Reports</h3>
            <button onClick={() => {
              const csv = ['Category,Address,Severity,Status,Date,Anonymous'].concat(
                reports.map(r => `${r.category},${r.address},${r.severity},${r.status || 'pending'},${new Date(r.createdAt).toLocaleDateString()},${r.anonymous}`)
              ).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'safecity-reports.csv'; a.click();
            }} style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e', padding: '8px 16px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600'
            }}>📥 Export CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Category', 'Address', 'Description', 'Severity', 'Date', 'Status'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => {
                  const currentStatus = report.status || 'pending';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #0f0f0f' }}>
                      <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{report.category?.replace('_', ' ')}</td>
                      <td style={{ padding: '12px', color: '#9ca3af' }}>{report.address}</td>
                      <td style={{ padding: '12px', color: '#9ca3af', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.description}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: `${severityColor(report.severity)}20`, color: severityColor(report.severity), padding: '3px 10px', borderRadius: '6px', fontSize: '12px' }}>{report.severity}/5</span>
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px' }}>{new Date(report.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: `${statusConfig[currentStatus].color}20`,
                          color: statusConfig[currentStatus].color,
                          padding: '3px 10px', borderRadius: '6px', fontSize: '12px'
                        }}>{statusConfig[currentStatus].label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
