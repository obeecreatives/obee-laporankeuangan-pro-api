import {
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RefreshCw,
  PlusCircle,
  Menu,
  ShieldCheck,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { UserProfile } from '../../types/finance';

interface AppHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser?: UserProfile;
  onOpenMobileMenu: () => void;
  gasStatus: { connected: boolean; latencyMs?: number };
  onRefreshData?: () => void;
  onOpenInstallModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  onOpenMobileMenu,
  gasStatus,
  onRefreshData,
  onOpenInstallModal,
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstalled } = usePWAInstall();

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'input', label: 'Input Transaksi' },
    { key: 'riwayat', label: 'Jurnal Umum' },
    { key: 'bukubesar', label: 'Buku Besar & Saldo' },
    { key: 'labarugi', label: 'Laba Rugi' },
    { key: 'neraca', label: 'Neraca' },
    { key: 'gas-settings', label: 'Sinkronisasi GAS' },
    { key: 'integrasi', label: 'Tarik Data' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-slate-100 dark:border-[#1E293B]/80">
        {/* Left: Brand logo & titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo mark */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E30000] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20 shrink-0">
              <span className="text-lg tracking-tighter">O</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#F1F5F9] tracking-tight leading-none">
                  obee<span className="text-[#E30000]">creatives</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-[#450A0A] dark:text-red-300 uppercase tracking-wider">
                  Laporan Keuangan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] hidden sm:block leading-tight mt-0.5">
                Sistem Akuntansi & Pembukuan Kas (Sinkronisasi Google Sheet)
              </p>
            </div>
          </div>

          {/* Connection status badge */}
          <div
            className={`hidden xl:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium ${
              gasStatus.connected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gasStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {gasStatus.connected
                ? `GAS Headless Live (${gasStatus.latencyMs ?? 85}ms)`
                : 'Mode Cache Lokal'}
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* In-App Install Button (HP / PC) */}
          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs sm:text-xs font-bold border border-slate-700/80 hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm"
              title="Install aplikasi di HP atau Laptop"
            >
              <Download className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              <span className="hidden xs:inline">Install App</span>
            </button>
          )}

          {/* Quick Catat Transaksi Button */}
          <button
            onClick={() => onSelectTab('input')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E30000] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-red-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Catat Transaksi</span>
          </button>

          {/* Refresh data button */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Sinkronkan dengan Google Sheet Sekarang"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Sinkronkan</span>
            </button>
          )}

          {/* Dark / Light Mode */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:flex"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Indicator */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
            <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E30000] flex items-center justify-center font-bold text-xs">
              LM
            </span>
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-900 dark:text-white leading-none">
                Lalu Mahendra
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                Finance Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation (Horizontal on Top) */}
      <div className="px-4 lg:px-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                isActive
                  ? 'border-[#E30000] text-[#E30000] dark:text-red-400 font-extrabold'
                  : 'border-transparent text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
