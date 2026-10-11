import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  BookOpen,
  RefreshCw,
  DownloadCloud,
  Menu,
  X,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

import { RBACRole } from '../../types/finance';
import { RBAC_ROLES, getRoleConfig } from '../../data/rbacRoles';

interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenDrawer: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
  gasConnected?: boolean;
  onOpenInstallModal?: () => void;
  currentRole?: RBACRole;
  onChangeRole?: (role: RBACRole) => void;
  onOpenGasCenter?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  isOpenDrawer,
  onCloseDrawer,
  onOpenDrawer,
  gasConnected = true,
  onOpenInstallModal,
  currentRole,
  onChangeRole,
  onOpenGasCenter,
}) => {
  const { isInstalled } = usePWAInstall();

  const bottomTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'input', label: 'Catat', icon: PlusCircle, isAction: true },
    { key: 'riwayat', label: 'Jurnal', icon: FileSpreadsheet },
    { key: 'labarugi', label: 'Laba Rugi', icon: TrendingUp },
    { key: 'neraca', label: 'Neraca', icon: Scale },
  ];

  const allFinancialMenus = [
    {
      group: 'Pembukuan Utama',
      items: [
        { key: 'dashboard', label: 'Dashboard Keuangan', icon: LayoutDashboard },
        { key: 'input', label: 'Input Transaksi Baru', icon: PlusCircle },
        { key: 'riwayat', label: 'Buku Jurnal Umum', icon: FileSpreadsheet },
        { key: 'bukubesar', label: 'Buku Besar & Neraca Saldo', icon: BookOpen },
      ],
    },
    {
      group: 'Laporan Keuangan',
      items: [
        { key: 'labarugi', label: 'Laporan Laba Rugi', icon: TrendingUp },
        { key: 'neraca', label: 'Laporan Neraca', icon: Scale },
      ],
    },
    {
      group: 'Koneksi & Sinkronisasi',
      items: [
        { key: 'gas-settings', label: 'Koneksi Google Apps Script', icon: RefreshCw },
        { key: 'integrasi', label: 'Tarik Data Eksternal (CRM/Payroll)', icon: DownloadCloud },
      ],
    },
  ];

  return (
    <>
      {/* Bottom Sticky Navigation for Mobile (App-like native tab bar with safe-area padding) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)] px-1 shadow-2xl">
        {bottomTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition active:scale-95 ${
                isActive
                  ? 'text-[#E30000] font-extrabold'
                  : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition ${isActive ? 'bg-red-50 dark:bg-red-950/40' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#E30000]' : ''}`} />
                {item.isAction && !isActive && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#E30000]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Menu Drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition active:scale-95 ${
            isOpenDrawer
              ? 'text-[#E30000] font-extrabold'
              : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-xl ${isOpenDrawer ? 'bg-red-50 dark:bg-red-950/40' : ''}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Menu</span>
        </button>
      </nav>

      {/* Sliding Mobile Drawer Overlay */}
      {isOpenDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseDrawer}
          />

          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#0B1120] h-full shadow-2xl z-10 flex flex-col overflow-y-auto p-4 animate-in slide-in-from-left duration-200">
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E30000] text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-500/20">
                  O
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    obee<span className="text-[#E30000]">creatives</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Sistem Laporan Keuangan
                  </div>
                </div>
              </div>

              <button
                onClick={onCloseDrawer}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Role Switcher for Mobile */}
            {currentRole && onChangeRole && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Peran Aktif (RBAC)
                  </span>
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                    {getRoleConfig(currentRole).shortLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {RBAC_ROLES.map((r) => {
                    const isSelected = r.id === currentRole;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          onChangeRole(r.id);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-left text-xs font-semibold transition truncate ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {r.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In-App Install Quick Card inside Drawer for Mobile */}
            {!isInstalled && onOpenInstallModal && (
              <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-slate-900 border border-red-200/80 dark:border-red-900/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-red-900 dark:text-red-200">
                    Install di Handphone
                  </span>
                  <span className="text-[10px] text-red-700 dark:text-red-300">
                    Akses cepat 1 klik di Home Screen
                  </span>
                </div>
                <button
                  onClick={() => {
                    onCloseDrawer();
                    onOpenInstallModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#E30000] text-white text-xs font-bold shadow-md hover:bg-red-700 transition flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>
              </div>
            )}

            {/* Menu List */}
            <div className="flex-1 py-4 space-y-5">
              {allFinancialMenus.map((grp) => (
                <div key={grp.group} className="space-y-1">
                  <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {grp.group}
                  </div>
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          onSelectTab(item.key);
                          onCloseDrawer();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-[#DC2626] text-white shadow-md font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Status Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B] text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    gasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>Google Sheet: {gasConnected ? 'Terhubung Live' : 'Mode Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
