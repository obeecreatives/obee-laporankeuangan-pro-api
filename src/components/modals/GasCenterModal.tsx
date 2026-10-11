import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GasService } from '../../services/gasService';
import { DEFAULT_GAS_ENDPOINT, SPREADSHEET_IDS } from '../../data/constants';

interface GasCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasStatus: { connected: boolean; latencyMs?: number };
  onRefreshData: () => Promise<void> | void;
  onNavigateTab: (tab: string) => void;
}

export const GasCenterModal: React.FC<GasCenterModalProps> = ({
  isOpen,
  onClose,
  gasStatus,
  onRefreshData,
  onNavigateTab,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await GasService.pullRealSheetData();
      if (res.success) {
        setSyncFeedback(res.message);
        if (onRefreshData) await onRefreshData();
      } else {
        setSyncFeedback('Sinkronisasi gagal: ' + res.message);
      }
    } catch (err: any) {
      setSyncFeedback('Terjadi kesalahan koneksi.');
    } finally {
      setIsSyncing(false);
    }
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_IDS.LAPORAN_KEUANGAN}/edit`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-500/10 via-slate-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                GAS Center & Auto-Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kontrol Sinkronisasi Google Apps Script & Google Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status Koneksi Real-Time
              </span>
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  gasStatus.connected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    gasStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {gasStatus.connected ? 'CONNECTED (Live Two-Way)' : 'CACHE LOKAL'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Kecepatan Respons (Latency):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {gasStatus.latencyMs ?? 85} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Sinkronisasi:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Two-Way Realtime (Input & Delete Otomatis)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Versi API Script:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">v2.5 Standalone</span>
              </div>
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E30000] text-white font-bold hover:bg-red-700 active:scale-98 transition disabled:opacity-50 shadow-md shadow-red-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menarik Data Asli Sheet...' : 'Sinkronkan Data Sheet Sekarang'}</span>
            </button>
            {syncFeedback && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}
          </div>

          {/* Direct Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                  Buka Spreadsheet
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition" />
            </a>

            <button
              onClick={() => {
                onNavigateTab('gas-settings');
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group text-left"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                  Script Code.gs
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Setiap kali Anda menambah transaksi baru atau menghapus baris di Web App ini, perubahan akan langsung dibukukan seketika ke Google Spreadsheet master tanpa reload manual.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
