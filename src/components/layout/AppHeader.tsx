import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RefreshCw,
  PlusCircle,
  Menu,
  Download,
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Zap,
  Sparkles,
  DownloadCloud,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { RBACRole } from '../../types/finance';
import { RBAC_ROLES, getRoleConfig } from '../../data/rbacRoles';

interface AppHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  gasStatus: { connected: boolean; latencyMs?: number };
  onRefreshData?: () => void;
  onOpenInstallModal?: () => void;
  onOpenSearch: () => void;
  onOpenGasCenter: () => void;
  currentRole: RBACRole;
  onChangeRole: (role: RBACRole) => void;
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
  onOpenSearch,
  onOpenGasCenter,
  currentRole,
  onChangeRole,
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstalled } = usePWAInstall();

  // Dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  const activeRoleConfig = getRoleConfig(currentRole);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14">
        {/* ================= LEFT SECTION: BRAND & GAS STATUS ================= */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Title */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#E30000] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20 group-hover:scale-105 transition shrink-0">
              <span className="text-base sm:text-lg tracking-tighter">O</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#F1F5F9] tracking-tight leading-none">
                  obee<span className="text-[#E30000]">creatives</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-[#450A0A] dark:text-red-300 uppercase tracking-wider">
                  Finance
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] hidden sm:block leading-tight mt-0.5">
                Two-Way Sync Google Sheet
              </span>
            </div>
          </div>

          {/* Auto-Sync Status & GAS Center Trigger (Clickable) */}
          <button
            onClick={onOpenGasCenter}
            className={`hidden md:flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full font-medium transition cursor-pointer border hover:shadow-sm ${
              gasStatus.connected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/70'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100/70'
            }`}
            title="Klik untuk membuka GAS Center & Kontrol Auto-Sync"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gasStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold">
              {gasStatus.connected ? 'Two-Way Live' : 'Cache Lokal'}
            </span>
            <span className="text-[10px] opacity-75 font-mono">
              ({gasStatus.latencyMs ?? 85}ms)
            </span>
            <Zap className="w-3 h-3 text-amber-500 ml-0.5" />
          </button>
        </div>

        {/* ================= MIDDLE SECTION: QUICK SEARCH ================= */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-400 text-xs border border-slate-200/70 dark:border-slate-700/60 transition group shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition" />
              <span className="text-slate-500 dark:text-slate-400">Cari transaksi / akun...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ================= RIGHT SECTION: ROLE SWITCHER & ACTIONS ================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button (Mobile/Tablet Icon Trigger) */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Pencarian Cepat (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Actions Dropdown (+ Button) */}
          <div className="relative" ref={quickActionRef}>
            <button
              onClick={() => setIsQuickActionOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#E30000] text-white text-xs sm:text-xs font-bold shadow-sm hover:bg-red-700 active:scale-95 transition"
              title="Aksi Cepat"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aksi Cepat</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Aksi Keuangan
                </div>
                <button
                  onClick={() => {
                    onSelectTab('input');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition text-left"
                >
                  <PlusCircle className="w-4 h-4 text-red-600" />
                  <span>Catat Transaksi Baru</span>
                </button>
                <button
                  onClick={() => {
                    if (onRefreshData) onRefreshData();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition text-left"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>Sinkronkan Sheet Sekarang</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('integrasi');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition text-left"
                >
                  <DownloadCloud className="w-4 h-4 text-blue-600" />
                  <span>Tarik Invoice CRM / Payroll</span>
                </button>
                <button
                  onClick={() => {
                    onOpenGasCenter();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition text-left"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>GAS Center & Two-Way Sync</span>
                </button>
              </div>
            )}
          </div>

          {/* ================= ROLE SWITCHER DROPDOWN ================= */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition text-left"
              title="Ganti Peran Akses (RBAC Role)"
            >
              <div className="w-6 h-6 rounded-lg bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                {activeRoleConfig.shortLabel.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                  {activeRoleConfig.shortLabel}
                </span>
                <span className="text-[9px] text-slate-400 leading-none">
                  {activeRoleConfig.badgeText}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu List */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role-Based Access Control (RBAC)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih peran untuk mensimulasikan hak akses aplikasi:
                  </div>
                </div>

                <div className="p-1 space-y-0.5 max-h-80 overflow-y-auto">
                  {RBAC_ROLES.map((role) => {
                    const isSelected = role.id === currentRole;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onChangeRole(role.id);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-red-50/80 dark:bg-red-950/40 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${role.badgeBg}`}
                        >
                          {role.shortLabel.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{role.label}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* In-App Install Button (HP / PC) */}
          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold border border-slate-700/80 hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm"
              title="Install aplikasi di HP atau Laptop"
            >
              <Download className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              <span className="hidden xl:inline">Install</span>
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
        </div>
      </div>
    </header>
  );
};
