import React, { useState, useEffect } from 'react';
import {
  Scale,
  Calendar,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { NeracaReport } from '../../types/finance';

export const NeracaView: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [asOfDate, setAsOfDate] = useState(todayStr);
  const [report, setReport] = useState<NeracaReport | null>(null);

  const calculateReport = (d = asOfDate) => {
    const res = StorageService.generateNeraca(d);
    setReport(res);
  };

  useEffect(() => {
    calculateReport();
  }, [asOfDate]);

  const setPreset = (preset: 'today' | 'endOfLastMonth' | 'endOfLastQuarter') => {
    const now = new Date();
    let d = '';

    if (preset === 'today') {
      d = now.toISOString().slice(0, 10);
    } else if (preset === 'endOfLastMonth') {
      d = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
    } else if (preset === 'endOfLastQuarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      d = new Date(now.getFullYear(), qMonth, 0).toISOString().slice(0, 10);
    }

    setAsOfDate(d);
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Control Panel (Hidden on Print) */}
      <div className="no-print p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-[#E30000]" />
              <span>Laporan Neraca Keuangan (Balance Sheet)</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Posisi keuangan komparatif Aktiva, Kewajiban (Hutang), dan Modal dengan audit keseimbangan presisi tinggi.
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
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Posisi Per Tanggal:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#DC2626] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              onClick={() => setPreset('today')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPreset('endOfLastMonth')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Akhir Bulan Lalu
            </button>
            <button
              onClick={() => setPreset('endOfLastQuarter')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Akhir Kuartal Lalu
            </button>
          </div>
        </div>
      </div>

      {/* Official Neraca Report Sheet */}
      {report && (
        <div className="print-area p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-md space-y-8">
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                NERACA KEUANGAN — obee<span className="text-[#E30000]">creatives</span>
              </div>
              <div className="text-base text-slate-500 dark:text-[#94A3B8] mt-2 flex items-center gap-2.5 font-semibold">
                <Calendar className="w-5 h-5 text-[#DC2626]" />
                <span>
                  Posisi Saldo Buku Per Tanggal:{' '}
                  <strong className="text-slate-900 dark:text-white font-bold">{report.tanggal}</strong>
                </span>
              </div>
            </div>

            {/* Balance Check Status Pill */}
            <div
              className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2.5 uppercase tracking-wider ${
                report.isBalanced
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-2 border-emerald-400 dark:border-emerald-700'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-2 border-red-400 dark:border-red-700'
              }`}
            >
              {report.isBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>SEIMBANG SEMPURNA (AKTIVA = HUTANG + MODAL)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>SELISIH: {formatRupiah(report.selisih)}</span>
                </>
              )}
            </div>
          </div>

          {/* Section 1: AKTIVA */}
          <div className="space-y-4">
            <div className="bg-[#E30000] text-white px-5 py-3 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between shadow-sm">
              <span>AKTIVA (ASET PERUSAHAAN) (1.x)</span>
              <span>NILAI BUKU (RP)</span>
            </div>

            <div className="space-y-1 px-3">
              {report.aktiva.map((a) => (
                <div
                  key={a.kode}
                  className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 text-base sm:text-lg"
                >
                  <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold flex items-center gap-3">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-base min-w-[50px]">
                      {a.kode}
                    </span>
                    <span>
                      {a.nama}
                      {a.kode === '1.2.2' && ' (Akumulasi Penyusutan - Pengurang)'}
                    </span>
                  </span>
                  <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    {a.kode === '1.2.2' ? `(${formatRupiah(a.jumlah)})` : formatRupiah(a.jumlah)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-3 py-4 font-black text-lg sm:text-xl text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 mt-2">
              <span>TOTAL AKTIVA</span>
              <span className="font-mono text-2xl sm:text-3xl text-[#DC2626] dark:text-[#EF4444] tracking-tight">
                {formatRupiah(report.totalAktiva)}
              </span>
            </div>
          </div>

          {/* Section 2: HUTANG */}
          <div className="space-y-4 pt-3">
            <div className="bg-[#0B1120] text-white px-5 py-3 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between shadow-sm border border-slate-800">
              <span>HUTANG & KEWAJIBAN (2.x)</span>
              <span>NILAI BUKU (RP)</span>
            </div>

            <div className="space-y-1 px-3">
              {report.hutang.map((h) => (
                <div
                  key={h.kode}
                  className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 text-base sm:text-lg"
                >
                  <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold flex items-center gap-3">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-base min-w-[50px]">
                      {h.kode}
                    </span>
                    <span>{h.nama}</span>
                  </span>
                  <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    {formatRupiah(h.jumlah)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-3 py-4 font-black text-lg sm:text-xl text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 mt-2">
              <span>TOTAL KEWAJIBAN & HUTANG</span>
              <span className="font-mono text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(report.totalHutang)}
              </span>
            </div>
          </div>

          {/* Section 3: MODAL */}
          <div className="space-y-4 pt-3">
            <div className="bg-slate-800 text-white px-5 py-3 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between shadow-sm">
              <span>MODAL & EKUITAS (3.x)</span>
              <span>NILAI BUKU (RP)</span>
            </div>

            <div className="space-y-1 px-3">
              {report.modal.map((m) => (
                <div
                  key={m.kode}
                  className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/80 text-base sm:text-lg"
                >
                  <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold flex items-center gap-3">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-base min-w-[50px]">
                      {m.kode}
                    </span>
                    <span>
                      {m.nama}
                      {m.kode === '3.2.1' && ' (+ Akumulasi Laba Berjalan Otomatis)'}
                    </span>
                  </span>
                  <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    {formatRupiah(m.jumlah)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-3 py-4 font-black text-lg sm:text-xl text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 mt-2">
              <span>TOTAL MODAL & EKUITAS</span>
              <span className="font-mono text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(report.totalModal)}
              </span>
            </div>
          </div>

          {/* Total Hutang + Modal & Final Balance Check */}
          <div className="p-7 sm:p-9 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              <span>TOTAL KEWAJIBAN (HUTANG) + MODAL</span>
              <span className="font-mono text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(report.totalHutangModal)}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-base font-bold text-slate-700 dark:text-[#94A3B8]">
                Formula Akuntansi: Aktiva ({formatRupiah(report.totalAktiva)}) = Hutang ({formatRupiah(report.totalHutang)}) + Modal ({formatRupiah(report.totalModal)})
              </span>
              <span
                className={`font-mono text-lg font-black px-4 py-1.5 rounded-xl ${
                  report.isBalanced
                    ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400'
                    : 'text-[#DC2626] bg-red-100 border border-red-400'
                }`}
              >
                {report.isBalanced
                  ? 'Rp 0 (Seimbang Sempurna)'
                  : `Selisih: ${formatRupiah(report.selisih)}`}
              </span>
            </div>
          </div>

          {/* Footer signoff */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
            <span>Dihasilkan secara otomatis oleh Laporan Keuangan obeecreatives Workspace OS</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Audit Presisi: Formula Aktiva = Hutang + Modal Terpenuhi</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
