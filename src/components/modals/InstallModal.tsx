import React from 'react';
import {
  Download,
  Share,
  PlusSquare,
  Monitor,
  Smartphone,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalledSuccess?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onInstalledSuccess,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      if (onInstalledSuccess) onInstalledSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Identity */}
        <div className="relative bg-gradient-to-br from-[#1E293B] via-[#0B0F17] to-[#1E0808] p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E30000] p-1 shadow-lg shadow-red-500/30 flex items-center justify-center mb-3">
            <span className="text-3xl font-black text-white tracking-tighter">O</span>
          </div>

          <h3 className="text-lg font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Install Laporan Keuangan</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Pasang langsung ke layar utama HP / Laptop untuk akses cepat seperti aplikasi resmi tanpa perlu buka browser terus-menerus.
          </p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bebas Repot • 1 Klik
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Layar Penuh (App Mode)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {isInstalled ? (
            <div className="text-center py-4 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Aplikasi Sudah Terpasang!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan Keuangan sudah aktif sebagai aplikasi mandiri di perangkat ini.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          ) : isInstallable ? (
            /* DIRECT 1-CLICK NATIVE INSTALL BUTTON (Android / Chrome Desktop / Edge) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#E30000]" />
                  <span>Siap Diinstall Langsung</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Browser mendeteksi aplikasi ini siap dipasang langsung ke perangkat Anda dalam 1 kali klik tanpa membuka menu titik tiga.
                </p>
              </div>

              <button
                onClick={handleDirectInstall}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#E30000] hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>Klik untuk Install Sekarang</span>
              </button>

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                Ikon aplikasi akan otomatis muncul di Layar Utama / Home Screen Anda.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Interactive Guide */
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                <p className="font-bold mb-1">Panduan Cepat iOS Safari:</p>
                <p className="text-[11px] leading-relaxed">
                  Apple mewajibkan penambahan PWA melalui tombol Bagikan (Share) Safari:
                </p>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>
                    Sentuh tombol <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) di bilah bawah Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>
                    Gulir sedikit ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700 dark:text-slate-200" />).
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>
                    Sentuh <strong>Tambah (Add)</strong> di pojok kanan atas. Selesai!
                  </span>
                </li>
              </ol>

              <button
                onClick={onClose}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Saya Mengerti
              </button>
            </div>
          ) : (
            /* Universal Fallback Guide for Android / PC when beforeinstallprompt is in cooldown */
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isDesktop ? <Monitor className="w-4 h-4 text-blue-500" /> : <Smartphone className="w-4 h-4 text-emerald-500" />}
                  <span>Petunjuk Pasang di {isDesktop ? 'PC / Laptop' : 'Ponsel (HP)'}</span>
                </div>
                {isDesktop ? (
                  <p className="text-[11px] leading-relaxed">
                    Di Google Chrome / Microsoft Edge di Laptop/PC, Anda cukup menekan ikon <strong>Install Aplikasi</strong> (<Download className="w-3.5 h-3.5 inline text-[#E30000]" />) yang ada di bilah alamat (URL bar) sebelah kanan, atau tekan tombol Pasang.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed">
                    Jika Anda menggunakan browser Android, tekan tombol <strong>Tambahkan ke Layar Utama</strong> atau <strong>Install Aplikasi</strong> pada notifikasi browser yang muncul.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDirectInstall}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#E30000] hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Coba Pasang Otomatis</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
