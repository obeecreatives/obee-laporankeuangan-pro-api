import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { BukuBesarAccount, AccountCategory } from '../../types/finance';

export const BukuBesarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'neraca-saldo' | 'buku-besar'>('neraca-saldo');

  const bukuBesarData = useMemo(() => {
    return StorageService.generateBukuBesar();
  }, []);

  const filteredAccounts = useMemo(() => {
    return bukuBesarData.filter((akun) => {
      const matchCat = selectedCategory === 'ALL' || akun.kategori === selectedCategory;
      const matchSearch =
        akun.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        akun.nama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [bukuBesarData, selectedCategory, searchQuery]);

  // Total trial balance calculations
  const totals = useMemo(() => {
    let totalDebitAwal = 0;
    let totalKreditAwal = 0;
    let totalMutasiDebit = 0;
    let totalMutasiKredit = 0;
    let totalDebitAkhir = 0;
    let totalKreditAkhir = 0;

    bukuBesarData.forEach((a) => {
      if (a.normalBalance === 'Debit') {
        totalDebitAwal += a.saldoAwal;
        totalDebitAkhir += a.saldoAkhir;
      } else {
        totalKreditAwal += a.saldoAwal;
        totalKreditAkhir += a.saldoAkhir;
      }
      totalMutasiDebit += a.totalDebit;
      totalMutasiKredit += a.totalKredit;
    });

    return {
      totalDebitAwal,
      totalKreditAwal,
      totalMutasiDebit,
      totalMutasiKredit,
      totalDebitAkhir,
      totalKreditAkhir,
    };
  }, [bukuBesarData]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.abs(val || 0).toLocaleString('id-ID');
  };

  const getKategoriBadge = (kategori: AccountCategory) => {
    switch (kategori) {
      case 'AKTIVA':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'HUTANG':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'MODAL':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'PENDAPATAN':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'BEBAN':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Kode Akun,Nama Akun,Kategori,Normal Balance,Saldo Awal,Total Debit,Total Kredit,Saldo Akhir\n';
    bukuBesarData.forEach((a) => {
      csv += `"${a.kode}","${a.nama}","${a.kategori}","${a.normalBalance}",${a.saldoAwal},${a.totalDebit},${a.totalKredit},${a.saldoAkhir}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `buku-besar-neraca-saldo-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Struktur GAS Akuntansi
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Buku Besar & Neraca Saldo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-[#E30000]" />
            <span>Buku Besar & Neraca Saldo (General Ledger)</span>
          </h2>
          <p className="text-base text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
            Rekapitulasi mutasi debit/kredit dan pergerakan saldo per kode akun (1.1.1 s/d 5.2.6) dari Sheet Google Spreadsheet.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('neraca-saldo')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeSubTab === 'neraca-saldo'
                  ? 'bg-white dark:bg-[#161B26] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Neraca Saldo
            </button>
            <button
              onClick={() => setActiveSubTab('buku-besar')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeSubTab === 'buku-besar'
                  ? 'bg-white dark:bg-[#161B26] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detail Mutasi Akun
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E30000] text-white text-sm font-bold shadow-md shadow-red-600/20 hover:bg-red-700 transition"
            title="Cetak Laporan"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {['ALL', 'AKTIVA', 'HUTANG', 'MODAL', 'PENDAPATAN', 'BEBAN'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'Semua Akun' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama akun..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* VIEW 1: NERACA SALDO TAB (TRIAL BALANCE TABLE) */}
      {activeSubTab === 'neraca-saldo' && (
        <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Neraca Saldo (Trial Balance)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Pemeriksaan keseimbangan saldo awal, mutasi debit/kredit, dan saldo akhir akun akuntansi
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{filteredAccounts.length} Akun Terdaftar</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0F17] text-[13px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Akun</th>
                  <th className="py-3.5 px-3">Kategori</th>
                  <th className="py-3.5 px-3 text-center">Posisi Normal</th>
                  <th className="py-3.5 px-4 text-right">Saldo Awal</th>
                  <th className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">Mutasi Debit</th>
                  <th className="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400">Mutasi Kredit</th>
                  <th className="py-3.5 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm font-medium">
                {filteredAccounts.map((akun) => {
                  const hasMutasi = akun.totalDebit > 0 || akun.totalKredit > 0;
                  return (
                    <tr
                      key={akun.kode}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        hasMutasi ? 'font-semibold' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {akun.kode}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-200 font-bold">
                        {akun.nama}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getKategoriBadge(akun.kategori)}`}>
                          {akun.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-xs font-semibold text-slate-500">
                        {akun.normalBalance}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatRupiah(akun.saldoAwal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {akun.totalDebit > 0 ? formatRupiah(akun.totalDebit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                        {akun.totalKredit > 0 ? formatRupiah(akun.totalKredit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-base tabular-nums">
                        {formatRupiah(akun.saldoAkhir)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setExpandedAccount(akun.kode);
                            setActiveSubTab('buku-besar');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-[#E30000] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          title="Lihat Mutasi Transaksi"
                        >
                          Mutasi ({akun.transaksi.length})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Total Footer */}
              <tfoot>
                <tr className="bg-slate-100/80 dark:bg-[#0B0F17] font-black text-sm border-t-2 border-slate-300 dark:border-slate-700">
                  <td colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider text-slate-700 dark:text-slate-300 font-extrabold">
                    Total Mutasi & Saldo
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {formatRupiah(totals.totalDebitAwal)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-700 dark:text-emerald-400 text-base">
                    {formatRupiah(totals.totalMutasiDebit)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-rose-700 dark:text-rose-400 text-base">
                    {formatRupiah(totals.totalMutasiKredit)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-white text-lg">
                    {formatRupiah(totals.totalDebitAkhir)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: BUKU BESAR DETAIL MUTASI TAB */}
      {activeSubTab === 'buku-besar' && (
        <div className="space-y-6">
          {filteredAccounts.map((akun) => {
            const isExpanded = expandedAccount === akun.kode || expandedAccount === null;
            return (
              <div
                key={akun.kode}
                className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Account Card Header */}
                <div
                  onClick={() => setExpandedAccount(expandedAccount === akun.kode ? null : akun.kode)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition border-b border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#E30000] font-mono font-black text-sm sm:text-base flex items-center justify-center shrink-0">
                      {akun.kode}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {akun.nama}
                        </h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getKategoriBadge(akun.kategori)}`}>
                          {akun.kategori}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Normal Balance: <span className="font-bold text-slate-600 dark:text-slate-300">{akun.normalBalance}</span> • {akun.transaksi.length} Transaksi Tercatat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Saldo Akhir</div>
                      <div className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
                        {formatRupiah(akun.saldoAkhir)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Account Ledger Transactions Table */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-bold block">Saldo Awal</span>
                        <span className="text-base font-mono font-black text-slate-800 dark:text-slate-200">
                          {formatRupiah(akun.saldoAwal)}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">Total Debit</span>
                        <span className="text-base font-mono font-black text-emerald-700 dark:text-emerald-300">
                          {formatRupiah(akun.totalDebit)}
                        </span>
                      </div>
                      <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40">
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">Total Kredit</span>
                        <span className="text-base font-mono font-black text-rose-700 dark:text-rose-300">
                          {formatRupiah(akun.totalKredit)}
                        </span>
                      </div>
                      <div className="p-3 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40">
                        <span className="text-xs text-red-600 dark:text-red-400 font-bold block">Saldo Akhir</span>
                        <span className="text-base font-mono font-black text-[#E30000] dark:text-red-400">
                          {formatRupiah(akun.saldoAkhir)}
                        </span>
                      </div>
                    </div>

                    {akun.transaksi.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm italic bg-slate-50/50 dark:bg-slate-900/30 rounded-xl">
                        Tidak ada mutasi transaksi pada periode ini untuk akun ini.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-[#0B0F17] text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                              <th className="py-2.5 px-3">Tanggal</th>
                              <th className="py-2.5 px-3">Keterangan / Deskripsi</th>
                              <th className="py-2.5 px-3">Tipe</th>
                              <th className="py-2.5 px-3 text-right text-emerald-600">Debit</th>
                              <th className="py-2.5 px-3 text-right text-rose-600">Kredit</th>
                              <th className="py-2.5 px-3 text-right">Saldo Berjalan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                            {akun.transaksi.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  {t.tanggal}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                                  {t.deskripsi}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">
                                  {t.tipe}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  {t.debit > 0 ? formatRupiah(t.debit) : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                  {t.kredit > 0 ? formatRupiah(t.kredit) : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                  {formatRupiah(t.saldoBerjalan)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
