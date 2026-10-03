import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  DownloadCloud,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { GasService } from '../../services/gasService';
import { JurnalEntry, TransactionType, DivisionType } from '../../types/finance';
import { DIVISI_LIST, TIPE_TRANSAKSI } from '../../data/constants';

interface RiwayatJurnalViewProps {
  onSuccess: (message: string) => void;
}

export const RiwayatJurnalView: React.FC<RiwayatJurnalViewProps> = ({ onSuccess }) => {
  const [entries, setEntries] = useState<JurnalEntry[]>(() => StorageService.getJurnalEntries());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipe, setSelectedTipe] = useState<string>('ALL');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortAsc, setSortAsc] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; deskripsi: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const reloadData = () => {
    setEntries(StorageService.getJurnalEntries());
  };

  const handlePullRealData = async () => {
    setIsSyncing(true);
    try {
      const res = await GasService.pullRealSheetData();
      if (res.success) {
        reloadData();
        onSuccess(res.message);
      } else {
        onSuccess(res.message);
      }
    } catch (err: unknown) {
      onSuccess(`Gagal sinkronisasi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    StorageService.deleteJurnalEntry(pendingDelete.id);
    reloadData();
    onSuccess(`Transaksi "${pendingDelete.deskripsi}" telah dihapus.`);
    setPendingDelete(null);
  };

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((item) => {
        const matchSearch =
          item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.namaAkun.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kodeAkun.includes(searchTerm) ||
          item.divisi.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipe = selectedTipe === 'ALL' || item.tipe === selectedTipe;
        const matchDivisi = selectedDivisi === 'ALL' || item.divisi === selectedDivisi;
        const matchStatus =
          selectedStatus === 'ALL' ||
          (selectedStatus === 'LUNAS' && item.statusBayar.startsWith('Lunas')) ||
          (selectedStatus === 'BELUM' && item.statusBayar.startsWith('Belum Lunas'));

        return matchSearch && matchTipe && matchDivisi && matchStatus;
      })
      .sort((a, b) => {
        const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
        return sortAsc ? -diff : diff;
      });
  }, [entries, searchTerm, selectedTipe, selectedDivisi, selectedStatus, sortAsc]);

  // Statistics calculation for filtered results
  const stats = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    filteredEntries.forEach((item) => {
      if (item.tipe === 'Pendapatan Proyek' || item.tipe === 'Pelunasan Piutang') {
        masuk += item.jumlah;
      } else {
        keluar += item.jumlah;
      }
    });
    return { count: filteredEntries.length, masuk, keluar };
  }, [filteredEntries]);

  // CSV Export
  const exportToCsv = () => {
    const headers = [
      'No',
      'Tanggal',
      'Tipe Transaksi',
      'Divisi',
      'Deskripsi',
      'Kode Akun',
      'Nama Akun',
      'Jumlah (Rp)',
      'Status Bayar',
      'Sumber',
    ];

    const rows = filteredEntries.map((e, idx) => [
      idx + 1,
      e.tanggal,
      `"${e.tipe}"`,
      `"${e.divisi}"`,
      `"${e.deskripsi.replace(/"/g, '""')}"`,
      e.kodeAkun,
      `"${e.namaAkun}"`,
      e.jumlah,
      `"${e.statusBayar}"`,
      e.sumberIntegrasi || 'MANUAL',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jurnal_Transaksi_Obeecreatives_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onSuccess('File Jurnal Transaksi berhasil di-export ke format CSV.');
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span>Buku Jurnal Transaksi Umum</span>
            <span className="text-sm px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
              {stats.count} Baris Transaksi
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
            Audit transaksi Pendapatan, Beban, Hutang, dan Piutang terhubung presisi dengan master Google Sheet.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePullRealData}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-[#450A0A]/30 text-[#DC2626] dark:text-red-300 hover:bg-red-100 dark:hover:bg-[#450A0A]/60 text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
            title="Tarik data asli dari Google Sheet"
          >
            <DownloadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Tarik Sheet Asli'}</span>
          </button>

          <button
            onClick={reloadData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center gap-2 transition"
            title="Muat Ulang Tampilan"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportToCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-extrabold text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-[#E30000]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi, klien, akun..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
          </div>

          {/* Filter Tipe Transaksi */}
          <div>
            <select
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="ALL">Semua Tipe Transaksi</option>
              {TIPE_TRANSAKSI.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Divisi */}
          <div>
            <select
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="ALL">Semua Divisi</option>
              {DIVISI_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Bayar */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="ALL">Semua Status Bayar</option>
              <option value="LUNAS">Hanya Lunas (Kas Masuk/Keluar)</option>
              <option value="BELUM">Belum Lunas (Piutang / Hutang)</option>
            </select>
          </div>
        </div>

        {/* Quick summary strip of filtered results */}
        <div className="flex flex-wrap items-center justify-between text-sm sm:text-base pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              Total Masuk (Pendapatan/Piutang Lunas):{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-black ml-1">
                {formatRupiah(stats.masuk)}
              </strong>
            </div>
            <div>
              Total Keluar (Beban/Hutang Lunas):{' '}
              <strong className="text-red-600 dark:text-red-400 font-mono text-base font-black ml-1">
                {formatRupiah(stats.keluar)}
              </strong>
            </div>
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-[#DC2626] transition mt-2 sm:mt-0"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Urutan: {sortAsc ? 'Terlama' : 'Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Container with Large, High-Legibility Font */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#0B1120] border-b-2 border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-[#94A3B8] uppercase text-xs sm:text-sm font-black tracking-wider">
              <tr>
                <th className="py-4 px-4 w-14 text-center">No</th>
                <th className="py-4 px-4">Tanggal</th>
                <th className="py-4 px-4">Tipe Transaksi</th>
                <th className="py-4 px-4">Divisi</th>
                <th className="py-4 px-4">Deskripsi / Klien / Proyek</th>
                <th className="py-4 px-4">Akun (COA)</th>
                <th className="py-4 px-4 text-right">Jumlah</th>
                <th className="py-4 px-4">Status Bayar</th>
                <th className="py-4 px-3 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400 text-base font-medium">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item, idx) => {
                  const isBelumLunas = item.statusBayar.startsWith('Belum Lunas');
                  const isPendapatan = item.tipe === 'Pendapatan Proyek';
                  const isBeban = item.tipe === 'Beban';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/90 dark:hover:bg-[#0B1120]/70 transition group text-base"
                    >
                      <td className="py-4 px-4 font-mono text-center text-slate-400 font-bold text-sm">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-700 dark:text-[#94A3B8] whitespace-nowrap text-sm sm:text-base font-bold">
                        {item.tanggal}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold ${
                            isPendapatan
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isBeban
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : item.tipe === 'Pelunasan Piutang'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {item.tipe}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-[#94A3B8] whitespace-nowrap text-sm sm:text-base">
                        {item.divisi || '-'}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-[#F1F5F9] max-w-sm sm:max-w-md truncate text-base sm:text-lg">
                        {item.deskripsi}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm sm:text-base text-slate-700 dark:text-[#94A3B8] whitespace-nowrap">
                        <span className="font-black text-[#DC2626] dark:text-[#EF4444]">{item.kodeAkun}</span>{' '}
                        <span className="text-slate-400">•</span> {item.namaAkun}
                      </td>
                      <td className="py-4 px-4 text-right font-black font-mono text-lg sm:text-xl text-slate-900 dark:text-[#F1F5F9] whitespace-nowrap tracking-tight">
                        {formatRupiah(item.jumlah)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold ${
                            isBelumLunas
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isBelumLunas ? 'Belum Lunas' : 'Lunas'}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => setPendingDelete({ id: item.id, deskripsi: item.deskripsi })}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition opacity-0 group-hover:opacity-100"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Konfirmasi Hapus Transaksi</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus baris transaksi berikut:{' '}
              <strong className="text-slate-900 dark:text-white block mt-1">"{pendingDelete.deskripsi}"</strong>?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm transition"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
