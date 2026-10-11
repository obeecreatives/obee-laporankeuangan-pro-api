import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  FileSpreadsheet,
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Scale,
  RefreshCw,
  DownloadCloud,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { JurnalEntry } from '../../types/finance';
import { CHART_OF_ACCOUNTS } from '../../data/constants';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load transactions
  const transactions = useMemo(() => {
    if (!isOpen) return [];
    return StorageService.getJurnalEntries();
  }, [isOpen]);

  // Filtered menus
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard Keuangan', desc: 'Ringkasan kas, pendapatan, beban, dan neraca', icon: LayoutDashboard },
    { key: 'input', label: 'Input Transaksi Baru', desc: 'Pencatatan kas masuk & keluar dua arah', icon: PlusCircle },
    { key: 'riwayat', label: 'Buku Jurnal Umum', desc: 'Daftar seluruh transaksi yang dibukukan', icon: FileSpreadsheet },
    { key: 'bukubesar', label: 'Buku Besar & Neraca Saldo', desc: 'Rekapitulasi per akun COA 1.1.1 - 5.2.6', icon: BookOpen },
    { key: 'labarugi', label: 'Laporan Laba Rugi', desc: 'Laba bersih, pendapatan, dan efisiensi operasional', icon: TrendingUp },
    { key: 'neraca', label: 'Laporan Neraca', desc: 'Posisi aktiva, kewajiban, dan modal usaha', icon: Scale },
    { key: 'gas-settings', label: 'Koneksi Google Apps Script', desc: 'Pusat status koneksi & Two-Way Sync Sheet', icon: RefreshCw },
    { key: 'integrasi', label: 'Hub Integrasi Data', desc: 'Tarik otomatis invoice CRM & payroll staf', icon: DownloadCloud },
  ];

  const filteredMenus = useMemo(() => {
    if (!query.trim()) return menuItems;
    const q = query.toLowerCase();
    return menuItems.filter(
      (m) => m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );
  }, [query]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return transactions
      .filter(
        (t) =>
          t.deskripsi.toLowerCase().includes(q) ||
          t.namaAkun.toLowerCase().includes(q) ||
          t.kodeAkun.toLowerCase().includes(q) ||
          t.divisi.toLowerCase().includes(q) ||
          String(t.no).includes(q) ||
          String(t.jumlah).includes(q)
      )
      .slice(0, 6);
  }, [query, transactions]);

  // Filtered COA
  const filteredAccounts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CHART_OF_ACCOUNTS.filter(
      (a) => a.nama.toLowerCase().includes(q) || a.kode.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-red-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik pencarian cepat (transaksi, akun COA, menu, atau nominal)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs sm:text-sm">
          {/* Quick Menu Navigation */}
          {filteredMenus.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Navigasi Menu
              </div>
              <div className="space-y-1">
                {filteredMenus.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onNavigateTab(item.key);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 group-hover:scale-105 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-sm">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Transactions */}
          {filteredTransactions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span>Transaksi Jurnal Terkait ({filteredTransactions.length})</span>
                <button
                  onClick={() => {
                    onNavigateTab('riwayat');
                    onClose();
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline capitalize"
                >
                  Lihat Semua di Jurnal
                </button>
              </div>
              <div className="space-y-1">
                {filteredTransactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      onNavigateTab('riwayat');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition text-left"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {tx.deskripsi}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{tx.tanggal}</span>
                        <span>•</span>
                        <span>{tx.namaAkun} ({tx.kodeAkun})</span>
                        <span>•</span>
                        <span className="text-slate-500">{tx.divisi}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold font-mono ${tx.tipe.includes('Beban') ? 'text-red-500' : 'text-emerald-500'}`}>
                        Rp {Number(tx.jumlah || 0).toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-400">{tx.statusBayar.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chart of Accounts */}
          {filteredAccounts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Bagan Akun (Chart of Accounts)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredAccounts.map((acc) => (
                  <button
                    key={acc.kode}
                    onClick={() => {
                      onNavigateTab('bukubesar');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500/40 text-left transition bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 text-xs">
                        {acc.kode}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {acc.kategori}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {acc.nama}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredMenus.length === 0 && filteredTransactions.length === 0 && filteredAccounts.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <p>Tidak ditemukan hasil untuk "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci deskripsi, tanggal, atau nomor akun.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pencarian Cepat Obeecreatives Finance</span>
          </div>
          <div>Klik menu untuk langsung berpindah halaman</div>
        </div>
      </div>
    </div>
  );
};
