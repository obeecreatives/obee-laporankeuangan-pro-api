import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileSpreadsheet,
  DownloadCloud,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { FinancialDashboardSummary, JurnalEntry } from '../../types/finance';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onQuickAction?: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const summary: FinancialDashboardSummary = StorageService.getDashboardSummary();
  const entries: JurnalEntry[] = StorageService.getJurnalEntries().slice(0, 5);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const isLaba = summary.labaRugi >= 0;

  // Division breakdown calculation
  const allEntries = StorageService.getJurnalEntries();
  const divStats: Record<string, number> = {};
  allEntries
    .filter((e) => e.tipe === 'Pendapatan Proyek')
    .forEach((e) => {
      divStats[e.divisi] = (divStats[e.divisi] || 0) + e.jumlah;
    });

  const totalRev = Object.values(divStats).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-7 pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#0B1120] via-[#0F172A] to-[#1E293B] text-white border border-[#1E293B] shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E30000] animate-ping" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-400">
              Periode Aktif: {summary.bulanIni}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ringkasan Keuangan Agensi
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-medium">
            Sistem akrual otomatis terintegrasi langsung dengan CRM Clients, Database Staff Payroll, dan Fee Konten Project Control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('input')}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B80000] text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition transform active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Input Transaksi</span>
          </button>
          <button
            onClick={() => onNavigateTab('gas-settings')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
          >
            <DownloadCloud className="w-4 h-4 text-red-400" />
            <span>Tarik Data Sheet</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid with Large Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Pendapatan */}
        <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-sm flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">
              Total Pendapatan (Bulan Ini)
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              {formatRupiah(summary.totalPendapatan)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Diakui akrual (Kontrak & Invoice CRM)</span>
            </div>
          </div>
        </div>

        {/* Total Beban */}
        <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-sm flex flex-col justify-between hover:border-red-400 dark:hover:border-red-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">
              Total Beban Operasional
            </span>
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              {formatRupiah(summary.totalBeban)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 dark:text-[#94A3B8] font-semibold">
              <span>Gaji Staf, Fee Kreator, & Operasional</span>
            </div>
          </div>
        </div>

        {/* Laba / Rugi Bersih */}
        <div
          className={`p-7 rounded-2xl border-2 shadow-sm flex flex-col justify-between transition ${
            isLaba
              ? 'bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/40 dark:to-[#1E293B] border-emerald-400 dark:border-emerald-700'
              : 'bg-gradient-to-br from-red-50/90 to-white dark:from-red-950/40 dark:to-[#1E293B] border-red-400 dark:border-red-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-700 dark:text-[#F1F5F9] uppercase tracking-wider">
              {isLaba ? 'Laba Bersih Berjalan' : 'Rugi Bersih Berjalan'}
            </span>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isLaba
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-[#DC2626] text-white shadow-md shadow-red-500/25'
              }`}
            >
              {isLaba ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
            </div>
          </div>
          <div className="mt-5">
            <div
              className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight ${
                isLaba ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#DC2626]'
              }`}
            >
              {formatRupiah(summary.labaRugi)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm font-bold">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  isLaba
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'
                }`}
              >
                Margin: {summary.totalPendapatan > 0 ? ((summary.labaRugi / summary.totalPendapatan) * 100).toFixed(1) : 0}%
              </span>
              <span className="text-slate-600 dark:text-[#94A3B8]">Bulan Berjalan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Position Cards: Kas, Piutang, Hutang */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Kas & Bank */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
              Kas & Bank Tersedia (1.1.1)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-[#F1F5F9] truncate mt-1">
              {formatRupiah(summary.totalKas)}
            </div>
          </div>
        </div>

        {/* Piutang Usaha */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
              Piutang Usaha Klien (1.1.2)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-[#F1F5F9] truncate mt-1">
              {formatRupiah(summary.totalPiutang)}
            </div>
          </div>
        </div>

        {/* Total Hutang */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
              Total Hutang & Kewajiban (2.x)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-[#F1F5F9] truncate mt-1">
              {formatRupiah(summary.totalHutang)}
            </div>
          </div>
        </div>
      </div>

      {/* Division Revenue Distribution & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division Revenue Breakdown */}
        <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-[#F1F5F9]">
              Distribusi Pendapatan Divisi
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-[#94A3B8]">Tahun Berjalan</span>
          </div>

          <div className="space-y-4">
            {Object.entries(divStats).map(([divisi, amount]) => {
              const pct = Math.round((amount / totalRev) * 100);
              return (
                <div key={divisi} className="space-y-2">
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold">
                    <span className="text-slate-800 dark:text-[#94A3B8] truncate">{divisi}</span>
                    <span className="text-slate-900 dark:text-[#F1F5F9] font-mono font-black">{formatRupiah(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#DC2626] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Table with High Legibility */}
        <div className="lg:col-span-2 p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#DC2626]" />
              <h3 className="text-lg font-black text-slate-900 dark:text-[#F1F5F9]">
                Transaksi Terkini (Live Verified Sheet)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('riwayat')}
              className="text-sm font-bold text-[#DC2626] hover:underline"
            >
              Lihat Semua Jurnal →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs sm:text-sm font-black">
                  <th className="pb-3 px-3">Tanggal</th>
                  <th className="pb-3 px-3">Tipe</th>
                  <th className="pb-3 px-3">Deskripsi / Klien</th>
                  <th className="pb-3 px-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-base">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-[#94A3B8] whitespace-nowrap text-sm sm:text-base font-bold">
                      {entry.tanggal}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold ${
                          entry.tipe === 'Pendapatan Proyek'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : entry.tipe === 'Beban'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {entry.tipe}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-[#F1F5F9] max-w-sm truncate text-base">
                      {entry.deskripsi}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-[#F1F5F9] whitespace-nowrap font-mono text-base sm:text-lg">
                      {formatRupiah(entry.jumlah)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('bukubesar')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              <span>Buku Besar & Neraca Saldo</span>
            </button>
            <button
              onClick={() => onNavigateTab('labarugi')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              <span>Buka Laba Rugi</span>
            </button>
            <button
              onClick={() => onNavigateTab('neraca')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="w-5 h-5 text-blue-500" />
              <span>Buka Laporan Neraca</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
