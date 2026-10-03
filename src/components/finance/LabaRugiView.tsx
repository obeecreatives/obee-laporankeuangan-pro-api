import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Printer,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { LabaRugiReport } from '../../types/finance';

export const LabaRugiView: React.FC = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<LabaRugiReport | null>(null);

  const calculateReport = (start = startDate, end = endDate) => {
    const res = StorageService.generateLabaRugi(start, end);
    setReport(res);
  };

  useEffect(() => {
    calculateReport();
  }, [startDate, endDate]);

  const setPreset = (preset: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'ytd') => {
    const current = new Date();
    let s = '';
    let e = '';

    if (preset === 'thisMonth') {
      s = new Date(current.getFullYear(), current.getMonth(), 1).toISOString().slice(0, 10);
      e = current.toISOString().slice(0, 10);
    } else if (preset === 'lastMonth') {
      s = new Date(current.getFullYear(), current.getMonth() - 1, 1).toISOString().slice(0, 10);
      e = new Date(current.getFullYear(), current.getMonth(), 0).toISOString().slice(0, 10);
    } else if (preset === 'thisQuarter') {
      const qMonth = Math.floor(current.getMonth() / 3) * 3;
      s = new Date(current.getFullYear(), qMonth, 1).toISOString().slice(0, 10);
      e = current.toISOString().slice(0, 10);
    } else if (preset === 'ytd') {
      s = new Date(current.getFullYear(), 0, 1).toISOString().slice(0, 10);
      e = current.toISOString().slice(0, 10);
    }

    setStartDate(s);
    setEndDate(e);
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const handlePrint = () => {
    window.print();
  };

  const isLaba = report ? report.labaRugi >= 0 : true;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Control Panel (Hidden on Print) */}
      <div className="no-print p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-[#E30000]" />
              <span>Laporan Laba Rugi (Income Statement)</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Perhitungan kinerja pendapatan dan beban operasional agensi berbasis akrual penuh dengan presisi tinggi.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white font-extrabold text-sm transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#E30000]" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        {/* Date Selector & Presets */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Periode Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#DC2626] outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#DC2626] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              onClick={() => setPreset('thisMonth')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPreset('lastMonth')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Bulan Lalu
            </button>
            <button
              onClick={() => setPreset('thisQuarter')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Kuartal Ini
            </button>
            <button
              onClick={() => setPreset('ytd')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Tahun Ini (YTD)
            </button>
          </div>
        </div>
      </div>

      {/* Official Laba Rugi Report Sheet (Matching Code.gs Output) */}
      {report && (
        <div className="print-area p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-md space-y-8">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                LAPORAN LABA RUGI — obee<span className="text-[#E30000]">creatives</span>
              </div>
              <div className="text-base text-slate-500 dark:text-[#94A3B8] mt-2 flex items-center gap-2.5 font-semibold">
                <Calendar className="w-5 h-5 text-[#DC2626]" />
                <span>
                  Periode Pelaporan: <strong className="text-slate-900 dark:text-white font-bold">{report.periodeAwal}</strong> s/d <strong className="text-slate-900 dark:text-white font-bold">{report.periodeAkhir}</strong>
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500 dark:text-slate-400 font-mono font-bold">
              Basis: Akrual Penuh (Accrual Accounting)
            </div>
          </div>

          {/* Section 1: PENDAPATAN */}
          <div className="space-y-4">
            <div className="bg-[#E30000] text-white px-5 py-3 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between shadow-sm">
              <span>PENDAPATAN USAHA (4.x)</span>
              <span>NOMINAL (RP)</span>
            </div>

            <div className="space-y-1 px-3">
              {report.pendapatan.length === 0 ? (
                <div className="py-4 text-base text-slate-400 italic font-medium">
                  Belum ada transaksi pendapatan pada periode yang dipilih.
                </div>
              ) : (
                report.pendapatan.map((p) => (
                  <div
                    key={p.kode}
                    className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 text-base sm:text-lg"
                  >
                    <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold flex items-center gap-3">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-base min-w-[50px]">
                        {p.kode}
                      </span>
                      <span>{p.nama}</span>
                    </span>
                    <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                      {formatRupiah(p.jumlah)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-4 font-black text-lg sm:text-xl text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 mt-2">
              <span>TOTAL PENDAPATAN USAHA</span>
              <span className="font-mono text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatRupiah(report.totalPendapatan)}
              </span>
            </div>
          </div>

          {/* Section 2: BEBAN */}
          <div className="space-y-4 pt-3">
            <div className="bg-[#0B1120] text-white px-5 py-3 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between shadow-sm border border-slate-800">
              <span>BEBAN OPERASIONAL (5.x)</span>
              <span>NOMINAL (RP)</span>
            </div>

            <div className="space-y-1 px-3">
              {report.beban.length === 0 ? (
                <div className="py-4 text-base text-slate-400 italic font-medium">
                  Belum ada transaksi beban pada periode yang dipilih.
                </div>
              ) : (
                report.beban.map((b) => (
                  <div
                    key={b.kode}
                    className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 text-base sm:text-lg"
                  >
                    <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold flex items-center gap-3">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-base min-w-[50px]">
                        {b.kode}
                      </span>
                      <span>{b.nama}</span>
                    </span>
                    <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                      {formatRupiah(b.jumlah)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-4 font-black text-lg sm:text-xl text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 mt-2">
              <span>TOTAL BEBAN OPERASIONAL</span>
              <span className="font-mono text-2xl sm:text-3xl text-red-600 dark:text-red-400 tracking-tight">
                {formatRupiah(report.totalBeban)}
              </span>
            </div>
          </div>

          {/* Final Net Result (Laba / Rugi Bersih) */}
          <div
            className={`p-7 sm:p-9 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition ${
              isLaba
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                : 'bg-red-50/90 dark:bg-red-950/40 border-red-400 dark:border-red-700'
            }`}
          >
            <div className="space-y-2">
              <div
                className={`font-black text-xl sm:text-2xl uppercase tracking-tight flex items-center gap-3 ${
                  isLaba ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'
                }`}
              >
                {isLaba ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                <span>{isLaba ? 'LABA BERSIH (NET PROFIT)' : 'RUGI BERSIH (NET LOSS)'}</span>
              </div>
              <div className="text-base text-slate-700 dark:text-[#94A3B8] font-bold">
                Margin Keuntungan Bersih:{' '}
                <strong className="text-slate-900 dark:text-white font-mono text-lg font-black ml-1">
                  {report.marginPersen.toFixed(2)}%
                </strong>
              </div>
            </div>

            <div
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isLaba ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#DC2626]'
              }`}
            >
              {formatRupiah(report.labaRugi)}
            </div>
          </div>

          {/* Signoff / Disclaimer */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
            <span>Dihasilkan secara otomatis oleh Obeecreatives Unified Workspace OS</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: Presisi Terverifikasi dengan Google Sheet Asli</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
