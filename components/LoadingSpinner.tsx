import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-inep-200 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg border border-inep-100">
            <Loader2 className="w-8 h-8 text-inep-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Processando Avaliação</h3>
      <p className="text-sm text-slate-500 max-w-xs text-center leading-relaxed">
        Calibrando rigor pedagógico e aplicando Taxonomia de Bloom...
      </p>
    </div>
  );
};