import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Code,
  Shield,
  Layers,
  DownloadCloud,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { GasService } from '../../services/gasService';
import { SPREADSHEET_IDS } from '../../data/constants';

interface HeadlessGasPanelProps {
  onSuccess: (message: string) => void;
  onRefreshData?: () => void;
}

export const HeadlessGasPanel: React.FC<HeadlessGasPanelProps> = ({
  onSuccess,
  onRefreshData,
}) => {
  const [gasUrl, setGasUrl] = useState(() => StorageService.getGasEndpoint());
  const [testing, setTesting] = useState(false);
  const [pullingReal, setPullingReal] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    isAccessDenied?: boolean;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const entries = StorageService.getJurnalEntries();
  const summary = StorageService.getDashboardSummary();

  const handleSaveUrl = () => {
    StorageService.setGasEndpoint(gasUrl.trim());
    onSuccess('URL Headless GAS berhasil disimpan sebagai endpoint aktif.');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await GasService.testConnection(gasUrl.trim());
      setTestResult(res);
      if (res.success) {
        onSuccess(`Handshake sukses! Latency ${res.latencyMs}ms.`);
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePullRealData = async () => {
    setPullingReal(true);
    try {
      const res = await GasService.pullRealSheetData();
      if (res.success) {
        onSuccess(res.message);
        if (onRefreshData) onRefreshData();
      } else {
        onSuccess(res.message);
      }
    } catch (err: unknown) {
      onSuccess(`Gagal: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPullingReal(false);
    }
  };

  const handleResetSeed = () => {
    StorageService.resetToSeedData();
    if (onRefreshData) onRefreshData();
    onSuccess('Data lokal berhasil di-reset ke Seed Data acuan resmi.');
    setShowResetConfirm(false);
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const recommendedCode = `// ============ UPDATE FUNGSI doGet PADA Code.gs SPREADSHEET ============
function doGet(e) {
  // JIKA DIPANGGIL OLEH REACT WEB APP (HEADLESS API MODE)
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result = { success: true, timestamp: new Date().toISOString() };

    try {
      if (action === "ping") {
        result.status = "CONNECTED";
        result.version = "v2.4 - Headless GAS";
      } else if (action === "getAllData") {
        // Tarik data asli dari seluruh sheet
        result.jurnal = api_getJurnalList(300);
        result.dashboard = api_getDashboardSummary();
        result.saldoAwal = {};
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var saSheet = ss.getSheetByName("Saldo Awal");
        if (saSheet) {
          var saData = saSheet.getDataRange().getDisplayValues();
          for (var i = 1; i < saData.length; i++) {
            if (saData[i][0]) result.saldoAwal[saData[i][0]] = Number(String(saData[i][2]).replace(/[^0-9.-]+/g, "")) || 0;
          }
        }
      } else if (action === "getJurnalList") {
        result.data = api_getJurnalList(Number(e.parameter.limit) || 100);
      } else if (action === "getDashboard") {
        result.data = api_getDashboardSummary();
      }
    } catch (err) {
      result.success = false;
      result.error = err.toString();
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // JIKA DIBUKA MANUAL LEWAT BROWSER BIASA (TAMPILAN LAMA)
  const email = Session.getActiveUser().getEmail();
  const allowed = ALLOWED_EMAILS.map((x) => x.toLowerCase().trim());
  if (!email || allowed.indexOf(email.toLowerCase().trim()) === -1) {
    return HtmlService.createHtmlOutputFromFile("AccessDenied")
      .setTitle("Akses Ditolak - Laporan Keuangan obeecreatives")
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Laporan Keuangan obeecreatives")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(recommendedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-24 md:pb-12 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#E30000]" />
            <span>Koneksi & Sinkronisasi Sheet Asli (Headless GAS)</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
            Verifikasi koneksi REST API langsung ke Google Apps Script dan Google Spreadsheet master obeecreatives.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Code className="w-4 h-4 text-[#E30000]" />
            <span>Lihat Script Integrasi</span>
          </button>
        </div>
      </div>

      {/* Primary Action Card: Pull Real Sheet Data */}
      <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-red-500/10 via-white to-white dark:from-red-950/20 dark:via-[#111622] dark:to-[#111622] border-2 border-red-300 dark:border-red-900/60 shadow-md space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E30000] animate-pulse" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#E30000]">
                Live Google Sheet Data Source
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Tarik Seluruh Baris Transaksi Asli dari Spreadsheet Kantor
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] max-w-2xl font-medium">
              Tombol ini akan mengambil data langsung dari sheet <code>Jurnal Transaksi</code>, <code>Saldo Awal</code>, dan <code>Chart of Accounts</code> asli tanpa jeda, serta memperbarui seluruh laporan Laba Rugi dan Neraca secara presisi.
            </p>
          </div>

          <button
            onClick={handlePullRealData}
            disabled={pullingReal}
            className="flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-[#E30000] hover:bg-[#B80000] text-white font-black text-base shadow-xl shadow-red-600/30 transition transform active:scale-95 disabled:opacity-50 shrink-0"
          >
            <DownloadCloud className={`w-5 h-5 ${pullingReal ? 'animate-bounce' : ''}`} />
            <span>{pullingReal ? 'Menarik Data Asli...' : 'Tarik Data Sheet Asli Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Live Verified Data Audit Card */}
      <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Status Data Terkoneksi & Terverifikasi
            </h3>
          </div>
          <span className="text-sm font-black px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400">
            {entries.length} Transaksi Terverifikasi Live
          </span>
        </div>

        {/* Financial metrics verification summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Pendapatan Terverifikasi
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatRupiah(summary.totalPendapatan)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Beban Terverifikasi
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-red-600 dark:text-red-400 mt-1">
              {formatRupiah(summary.totalBeban)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saldo Kas & Bank (1.1.1)
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {formatRupiah(summary.totalKas)}
            </div>
          </div>
        </div>

        {/* Table of verified transactions */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-slate-50 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 uppercase text-xs font-black">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">Deskripsi Transaksi</th>
                <th className="py-3 px-3">Akun</th>
                <th className="py-3 px-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-xs font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">{item.tanggal}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                      {item.tipe}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold max-w-xs truncate">{item.deskripsi}</td>
                  <td className="py-3 px-3 font-mono text-xs font-bold text-slate-500">{item.kodeAkun}</td>
                  <td className="py-3 px-3 text-right font-mono font-black">{formatRupiah(item.jumlah)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoint Configuration & Handshake Card */}
      <div className="p-7 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span>Web App Script URL (Google Apps Script /exec)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-slate-900 dark:text-white font-mono text-sm font-medium focus:ring-2 focus:ring-[#E30000] outline-none"
            />
            <button
              onClick={handleSaveUrl}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white font-bold text-sm transition"
            >
              Simpan URL
            </button>
          </div>
        </div>

        {/* Handshake Tester */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white font-black text-sm shadow-sm transition disabled:opacity-50"
          >
            <Wifi className="w-4 h-4 text-[#E30000]" />
            <span>{testing ? 'Menguji Handshake...' : 'Uji Koneksi (Handshake)'}</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-sm font-bold transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Seed Data Awal</span>
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="p-5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/80 dark:bg-red-950/40 text-sm space-y-3">
            <div className="font-black text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Konfirmasi Reset Data Lokal</span>
            </div>
            <p className="text-red-700 dark:text-red-300/80 font-medium">
              Apakah Anda yakin ingin mereset seluruh data lokal kembali ke Seed Data awal obeecreatives? Transaksi manual baru akan dikosongkan.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={handleResetSeed}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm"
              >
                Ya, Reset Sekarang
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B26] text-sm font-bold"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Handshake Result Box */}
        {testResult && (
          <div
            className={`p-5 rounded-xl border text-sm space-y-2 animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="font-black flex items-center gap-2 text-base">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span>
                {testResult.success ? 'Koneksi JSON Berhasil (200 OK)' : 'Pemberitahuan Status'}
              </span>
            </div>
            <p className="font-sans leading-relaxed font-medium">{testResult.message}</p>
          </div>
        )}
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-w-3xl w-full bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#E30000]" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Script Google Apps Script (Headless JSON REST)
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Fungsi <code>doGet(e)</code> di <code>Code.gs</code> Google Sheet Anda yang melayani REST API:
            </p>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-y-auto">
              <pre className="whitespace-pre-wrap">{recommendedCode}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E30000] hover:bg-[#B80000] text-white text-sm font-extrabold transition"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
              </button>

              <button
                onClick={() => setShowCodeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
