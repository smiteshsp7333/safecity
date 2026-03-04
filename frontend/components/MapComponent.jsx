'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const severityColor = (severity) => {
  if (severity >= 4) return '#ef4444';
  if (severity >= 3) return '#f59e0b';
  return '#22c55e';
};

function HeatmapLayer({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!reports || reports.length === 0) return;

    const heatData = reports.map(report => [
      report.location.coordinates[1],
      report.location.coordinates[0],
      report.severity * 0.2
    ]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: {
        0.0: '#22c55e',
        0.4: '#f59e0b',
        0.7: '#ef4444',
        1.0: '#7f1d1d'
      }
    }).addTo(map);

    return () => map.removeLayer(heatLayer);
  }, [reports, map]);

  return null;
}

export default function MapComponent({ reports }) {
  return (
    <MapContainer
      center={[18.5204, 73.8567]}
      zoom={13}
      style={{ height: 'calc(100vh - 130px)', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      <HeatmapLayer reports={reports} />

      {reports.map((report, i) => (
        <CircleMarker
          key={i}
          center={[report.location.coordinates[1], report.location.coordinates[0]]}
          radius={10}
          fillColor={severityColor(report.severity)}
          color={severityColor(report.severity)}
          weight={2}
          opacity={0.9}
          fillOpacity={0.7}
        >
          <Popup>
            <div style={{ background: '#111', color: 'white', padding: '8px', borderRadius: '8px', minWidth: '150px' }}>
              <strong style={{ color: '#ef4444' }}>{report.category?.toUpperCase()}</strong>
              <p style={{ margin: '4px 0' }}>{report.address}</p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#9ca3af' }}>{report.description}</p>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>Severity: {'⭐'.repeat(report.severity)}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}