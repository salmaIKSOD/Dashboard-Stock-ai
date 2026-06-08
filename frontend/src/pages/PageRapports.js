// Utilisez ce template pour chaque page
import React from 'react';
import { PackageSearch } from 'lucide-react'; // changez l'icône

export default function PageStockJournalier() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(18,166,224,0.08)] flex items-center justify-center">
        <PackageSearch size={28} color="#12a6e0" />
      </div>
      <h2 className="text-[#0d0c0c] text-lg font-semibold m-0">Stock journalier</h2>
      <p className="text-[#aaaaaa] text-sm m-0">Cette section est en cours de développement.</p>
    </div>
  );
}