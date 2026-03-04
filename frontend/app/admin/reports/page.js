'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ category: '', severity: '', search: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    fetch('https://safecity-backend-0083.onrender.com/api/reports')
      .then(r => r.json())
      .then(data => { setReports(data); setFiltered(data); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = reports;
    if (filter.category) result = result.filter(r => r.category === filter.category);
    if (filter.severity) result = result.filter(r => r.severity === parseInt(filter.severity));
    if (filter.status) result = result.filter(r => (r.status || 'pending') === filter.status);
    if (filter.search) result = result.filter(r =>
      r.address?.toLowerCase().includes(filter.search.toLowerCase()) ||
      r.description?.toLowerCase().includes(filter.search.toLowerCase())
    );
    setFiltered(result);
  }, [filter, reports]);

  const severityColor = (s) => s >= 4 ? '#ef4444' : s >= 3 ? '#f59e0b' : '#22c55e';

  const statusConfig = {
    pending: { label: '⏳ Pending', color: '#ef4444' },
    in_progress: { label: '🔄 In Progress', color: '#f59e0b' },
    resolved: { label: '✅ Resolved', color: '#22c55e' },
    fake: { label: '❌ Fake', color: '#6b7280' },
  };

  const updateStatus = async (reportId, status) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`https://safecity-backend-0083.onrender.com/api/reports/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setReports(prev => prev.map(r => r._id === reportId ? { ...r, status } : r));
  };

  const exportCSV = () => {
    const csv = ['Category,Address,Description,Severity,Status,Date,Anonymous'].concat(
      filtered.map(r => `${r.category},${r.address},"${r.description}",${r.severity},${r.status || 'pending'},${new Date(r.createdAt).toLocaleDateString()},${r.anonymous}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'safecity-reports.csv'; a.click();
  };

  const statusCounts = {
    pending: reports.filter(r => !r.status || r.status === 'pending').length,
    in_progress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    fake: reports.filter(r => r.status === 'fake').length,
  };

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
          { icon: '📋', label: 'All Reports', path: '/admin/reports', active: true },
          { icon: '🗺️', label: 'City Heatmap', path: '/admin/map' },
          { icon: '👥', label: 'Users', path: '/admin/users' },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>📋 All Reports</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{filtered.length} reports found</p>
          </div>
          <button onClick={exportCSV} style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>📥 Export CSV</button>
        </div>

        {/* status summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} onClick={() => setFilter(f => ({ ...f, status: f.status === status ? '' : status }))} style={{
              background: filter.status === status ? `${statusConfig[status].color}15` : 'linear-gradient(145deg, #0f0f0f, #151515)',
              border: `1px solid ${filter.status === status ? statusConfig[status].color : '#1a1a1a'}`,
              borderRadius: '16px', padding: '20px', cursor: 'pointer'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{statusConfig[status].label}</p>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: statusConfig[status].color }}>{count}</h3>
            </div>
          ))}
        </div>

        {/* filters */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #151515)',
          border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px',
          marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap'
        }}>
          <input
            placeholder="🔍 Search address or description..."
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            style={{
              flex: 1, minWidth: '200px', background: '#0a0a0a', border: '1px solid #333',
              borderRadius: '10px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none'
            }}
          />
          <select onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{
            background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px',
            padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none'
          }}>
            <option value="">All Categories</option>
            <option value="harassment">Harassment</option>
            <option value="theft">Theft</option>
            <option value="assault">Assault</option>
            <option value="unsafe_area">Unsafe Area</option>
            <option value="poor_lighting">Poor Lighting</option>
            <option value="other">Other</option>
          </select>
          <select onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))} style={{
            background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px',
            padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none'
          }}>
            <option value="">All Severities</option>
            <option value="5">Critical (5)</option>
            <option value="4">High (4)</option>
            <option value="3">Medium (3)</option>
            <option value="2">Low (2)</option>
            <option value="1">Minimal (1)</option>
          </select>
        </div>

        {/* reports grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((report, i) => {
            const currentStatus = report.status || 'pending';
            return (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #0f0f0f, #151515)',
                border: `1px solid ${statusConfig[currentStatus].color}30`,
                borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', textTransform: 'capitalize' }}>
                      {report.category?.replace('_', ' ')}
                    </p>
                    <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    background: `${severityColor(report.severity)}20`,
                    border: `1px solid ${severityColor(report.severity)}40`,
                    color: severityColor(report.severity),
                    padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600'
                  }}>Severity {report.severity}/5</span>
                </div>

                <p style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '13px' }}>📍 {report.address}</p>
                <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>{report.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    background: report.anonymous ? 'rgba(107,114,128,0.2)' : 'rgba(239,68,68,0.1)',
                    color: report.anonymous ? '#6b7280' : '#ef4444',
                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px'
                  }}>{report.anonymous ? '🕵️ Anonymous' : '👤 Public'}</span>
                  <span style={{
                    background: `${statusConfig[currentStatus].color}20`,
                    color: statusConfig[currentStatus].color,
                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600'
                  }}>{statusConfig[currentStatus].label}</span>
                </div>

                {/* status buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #1a1a1a' }}>
                  {Object.entries(statusConfig).map(([s, config]) => (
                    <button key={s} onClick={() => updateStatus(report._id, s)} style={{
                      padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
                      border: `1px solid ${currentStatus === s ? config.color : '#333'}`,
                      background: currentStatus === s ? `${config.color}20` : 'transparent',
                      color: currentStatus === s ? config.color : '#6b7280',
                      fontWeight: currentStatus === s ? '700' : '400'
                    }}>{config.label}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
