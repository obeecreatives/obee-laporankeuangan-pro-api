import React from 'react';
import { ExternalLink, Layers, X, Shield, ArrowRight } from 'lucide-react';
import { WorkspaceModule } from '../../types/finance';

interface ModuleModalProps {
  module: WorkspaceModule | null;
  onClose: () => void;
  onNavigateToFinance: () => void;
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  module,
  onClose,
  onNavigateToFinance,
}) => {
  if (!module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-[#E30000] dark:bg-red-950 dark:text-red-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                {module.name}
              </h3>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Kategori: {module.category}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#161B26] border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed">
            {module.description}
          </div>

          <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>Status Integrasi:</span>
              <span className="font-bold text-[#E30000]">
                {module.status === 'active'
                  ? 'Aktif (Sedang Dibuka)'
                  : 'Terhubung (Next-Gen V2)'}
              </span>
            </div>

            {module.sheetId && (
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Spreadsheet Database:</span>
                <span className="font-mono text-[11px] font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                  {module.sheetId}
                </span>
              </div>
            )}

            {module.adminOnly && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-semibold pt-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Modul ini dilindungi hak akses Admin & Project Manager.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {module.externalUrl ? (
            <a
              href={module.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#E30000] hover:bg-[#B80000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Buka Web App {module.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={() => {
                onNavigateToFinance();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Buka Modul Laporan Keuangan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
