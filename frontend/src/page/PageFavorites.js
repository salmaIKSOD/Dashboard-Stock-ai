import React from 'react';
import { Star } from 'lucide-react';

export default function PageFavorites() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#888888', gap: '1rem' }}>
      <Star size={40} style={{ color: '#c5c5c5' }} />
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#555555' }}>Favoris</p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#c5c5c5' }}>Vos articles et dépôts favoris apparaîtront ici.</p>
    </div>
  );
}