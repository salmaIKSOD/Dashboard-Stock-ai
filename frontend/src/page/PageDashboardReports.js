import React from 'react';
import { FileText } from 'lucide-react';

export default function PageDashboardReports() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#888888', gap: '1rem' }}>
      <FileText size={40} style={{ color: '#c5c5c5' }} />
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#555555' }}>Rapports</p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#c5c5c5' }}>Les rapports du tableau de bord seront affichés ici.</p>
    </div>
  );
}