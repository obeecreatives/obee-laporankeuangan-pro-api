import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { UserProfile } from '../../types/finance';
import { SWITCH_APP_LIST } from '../../data/constants';

interface AppHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile;
  onOpenPinModal: () => void;
  onOpenMobileMenu: () => void;
  gasStatus: { connected: boolean; latencyMs?: number };
  onRefreshData?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenPinModal,
  onOpenMobileMenu,
  gasStatus,
  onRefreshData,
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [isSwitchAppOpen, setIsSwitchAppOpen] = useState(false);
  const switchAppRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switchAppRef.current && !switchAppRef.current.contains(e.target as Node)) {
        setIsSwitchAppOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'input', label: 'Input Transaksi' },
    { key: 'riwayat', label: 'Riwayat Jurnal' },
    { key: 'labarugi', label: 'Laba Rugi' },
    { key: 'neraca', label: 'Neraca' },
    { key: 'integrasi', label: 'Hub Integrasi' },
    { key: 'gas-settings', label: 'Headless GAS' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-slate-100 dark:border-[#1E293B]/80">
        {/* Left: Mobile trigger & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#450A0A] text-red-300 uppercase tracking-wider">
              Finance Hub
            </span>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#F1F5F9] tracking-tight flex items-center gap-1.5">
              <span>Laporan Keuangan</span>
              <span className="hidden sm:inline font-bold text-slate-400 dark:text-[#94A3B8] text-xs">/ obee<span className="text-[#E30000]">creatives</span></span>
            </h1>
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
                : 'Local Cache Mode'}
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh data button */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Switch App Dropdown */}
          <div className="relative" ref={switchAppRef}>
            <button
              onClick={() => setIsSwitchAppOpen(!isSwitchAppOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-[#450A0A]/30 text-[#DC2626] dark:text-red-300 text-xs font-bold hover:bg-red-100 dark:hover:bg-[#450A0A]/60 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch App</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isSwitchAppOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Ekosistem Web Apps
                </div>
                <div className="py-1 space-y-1">
                  <div className="px-3 py-2 rounded-lg bg-[#450A0A] text-red-200 text-xs font-bold flex items-center justify-between">
                    <span>Laporan Keuangan</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900 text-red-100 font-extrabold">
                      Aktif
                    </span>
                  </div>
                  {SWITCH_APP_LIST.map((app, idx) => (
                    <a
                      key={idx}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#0F172A] transition"
                    >
                      <div className="flex flex-col">
                        <span>{app.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#94A3B8]">{app.tag}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#DC2626]" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* PWA Install Button */}
          {(isInstallable || isIOS) && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B80000] text-white text-xs font-semibold shadow-sm transition"
              title="Install Aplikasi"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile & Security PIN Trigger */}
          <button
            onClick={onOpenPinModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] hover:border-red-500 hover:bg-slate-50 dark:hover:bg-[#1E293B] transition ml-1"
            title="Profil & Keamanan PIN"
          >
            <div className="w-7 h-7 rounded-lg bg-[#DC2626] text-white flex items-center justify-center text-xs font-black shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] leading-tight truncate max-w-[120px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] flex items-center gap-0.5 font-medium">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                {currentUser.roleLabel}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="px-4 lg:px-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`py-3.5 px-4 text-sm sm:text-base whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#DC2626] text-[#DC2626] dark:text-[#EF4444] font-black'
                  : 'border-transparent text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 font-bold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
