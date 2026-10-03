import React, { useState } from 'react';
import {
  DownloadCloud,
  Briefcase,
  Users,
  KanbanSquare,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { GasService } from '../../services/gasService';
import { StorageService } from '../../services/storageService';
import { ImportLogEntry } from '../../types/finance';
import { SPREADSHEET_IDS } from '../../data/constants';

interface IntegrasiHubViewProps {
  onSuccess: (message: string) => void;
  onRefreshData?: () => void;
}

export const IntegrasiHubView: React.FC<IntegrasiHubViewProps> = ({
  onSuccess,
  onRefreshData,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  // Date states for the 3 pulls
  const [crmStart, setCrmStart] = useState(firstOfMonthStr);
  const [crmEnd, setCrmEnd] = useState(todayStr);
  const [crmLoading, setCrmLoading] = useState(false);

  const [staffStart, setStaffStart] = useState(firstOfMonthStr);
  const [staffEnd, setStaffEnd] = useState(todayStr);
  const [staffLoading, setStaffLoading] = useState(false);

  const [pcStart, setPcStart] = useState(firstOfMonthStr);
  const [pcEnd, setPcEnd] = useState(todayStr);
  const [pcLoading, setPcLoading] = useState(false);

  const [importLogs, setImportLogs] = useState<ImportLogEntry[]>(() =>
    StorageService.getImportLog()
  );

  const refreshLogs = () => {
    setImportLogs(StorageService.getImportLog());
    if (onRefreshData) onRefreshData();
  };

  // Pull CRM
  const handlePullCrm = async () => {
    setCrmLoading(true);
    try {
      const res = await GasService.pullCrmInvoices(crmStart, crmEnd);
      refreshLogs();
      onSuccess(
        `Sinkronisasi CRM Selesai: ${res.jumlahDiimpor} invoice baru ditambahkan, ${res.jumlahPelunasan} piutang jadi lunas, ${res.jumlahDilewati} dilewati.`
      );
    } catch (err: unknown) {
      onSuccess(`Gagal menarik CRM: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCrmLoading(false);
    }
  };

  // Pull Staff Payroll
  const handlePullStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await GasService.pullStaffPayroll(staffStart, staffEnd);
      refreshLogs();
      onSuccess(
        `Sinkronisasi Payroll Selesai: ${res.jumlahDiimpor} data gaji diimpor sebagai Beban Gaji Staff (5.2.1), ${res.jumlahDilewati} dilewati.`
      );
    } catch (err: unknown) {
      onSuccess(`Gagal menarik Payroll: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setStaffLoading(false);
    }
  };

  // Pull Content Fee
  const handlePullPc = async () => {
    setPcLoading(true);
    try {
      const res = await GasService.pullProjectControlFee(pcStart, pcEnd);
      refreshLogs();
      onSuccess(
        `Sinkronisasi Fee Konten Selesai: ${res.jumlahDiimpor} fee baru dicatat sebagai Beban Fee Freelancer (5.1.1), ${res.jumlahDilewati} dilewati (anti dobel hitung).`
      );
    } catch (err: unknown) {
      onSuccess(`Gagal menarik Fee Konten: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPcLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-[#E30000]" />
            <span>Hub Integrasi Multi-Spreadsheet (GAS V2)</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Laporan Keuangan aktif membaca 3 spreadsheet operasional kantor secara modular dan aman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Triple Dedup Active</span>
          </div>
        </div>
      </div>

      {/* 3 Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: CRM Clients */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 dark:hover:border-red-900 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#E30000] dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tarik Invoice dari CRM
              </h3>
              <div className="text-[11px] text-gray-400 font-mono truncate">
                Sheet: Invoices & PaymentConfirmations
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menghitung total invoice dari <code>itemsJson</code>, mapping divisi otomatis, dan mencatat Pelunasan Piutang saat status invoice lunas.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Mulai</label>
                <input
                  type="date"
                  value={crmStart}
                  onChange={(e) => setCrmStart(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Sampai</label>
                <input
                  type="date"
                  value={crmEnd}
                  onChange={(e) => setCrmEnd(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              onClick={handlePullCrm}
              disabled={crmLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-[#E30000] hover:bg-[#B80000] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>{crmLoading ? 'Menarik Invoice...' : 'Tarik Invoice CRM'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Database Staff Payroll */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-900 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tarik Payroll Staff Aktif
              </h3>
              <div className="text-[11px] text-gray-400 font-mono truncate">
                Sheet: Staff & Payroll
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menarik baris payroll aktual untuk semua staf berstatus aktif (Tetap/PKWT/Magang) langsung menjadi Beban Gaji Staff (5.2.1).
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Mulai</label>
                <input
                  type="date"
                  value={staffStart}
                  onChange={(e) => setStaffStart(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Sampai</label>
                <input
                  type="date"
                  value={staffEnd}
                  onChange={(e) => setStaffEnd(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              onClick={handlePullStaff}
              disabled={staffLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-[#E30000]" />
              <span>{staffLoading ? 'Menarik Payroll...' : 'Tarik Payroll Staff'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Project Control Fee */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-900 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tarik Fee dari Project Control
              </h3>
              <div className="text-[11px] text-gray-400 font-mono truncate">
                Sheet: ContentTracker & FeeLog
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menarik fee konten yang sudah berstatus Approved/RtP. Otomatis cek silang ke Payroll agar tidak dobel hitung!
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Mulai</label>
                <input
                  type="date"
                  value={pcStart}
                  onChange={(e) => setPcStart(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block">Sampai</label>
                <input
                  type="date"
                  value={pcEnd}
                  onChange={(e) => setPcEnd(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161B26] text-xs text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              onClick={handlePullPc}
              disabled={pcLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-[#E30000]" />
              <span>{pcLoading ? 'Menarik Fee...' : 'Tarik Fee Konten'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Log Viewer (Anti-Dobel Hitung Audit) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E30000]" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Log Integrasi & Audit Anti-Dobel-Hitung (Import Log)
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {importLogs.length} Entri Tercatat
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Setiap record yang berhasil ditarik otomatis terkunci ID referensinya di bawah ini. Jika dilakukan penarikan ulang pada periode yang sama, sistem otomatis melewati (skip) untuk mencegah penggelembungan biaya/pendapatan.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#161B26] text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Sumber Integrasi</th>
                <th className="py-2.5 px-4">ID Referensi Asli</th>
                <th className="py-2.5 px-4">Waktu Penarikan</th>
                <th className="py-2.5 px-4">Status Saat Ditarik</th>
                <th className="py-2.5 px-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
              {importLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.sumber === 'CRM_INVOICE'
                          ? 'bg-red-100 text-[#E30000] dark:bg-red-950 dark:text-red-300'
                          : log.sumber === 'PAYROLL'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {log.sumber}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {log.idReferensi}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                    {new Date(log.waktuImport).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {log.statusSaatImport}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatRupiah(log.jumlah)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
