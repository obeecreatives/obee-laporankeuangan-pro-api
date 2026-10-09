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
  FileCheck2,
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenDrawer: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
  gasConnected?: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  isOpenDrawer,
  onCloseDrawer,
  onOpenDrawer,
  gasConnected = true,
}) => {
  const bottomTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'input', label: 'Input', icon: PlusCircle },
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
      {/* Bottom Sticky Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-around h-16 px-2 shadow-lg">
        {bottomTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive
                  ? 'text-[#DC2626] font-bold'
                  : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}

        {/* Menu Drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isOpenDrawer
              ? 'text-[#DC2626] font-bold'
              : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">Menu</span>
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-black text-sm">
                  O
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    obee<span className="text-[#E30000]">creatives</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Sistem Laporan Keuangan
                  </div>
                </div>
              </div>

              <button
                onClick={onCloseDrawer}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-4 space-y-6">
              {allFinancialMenus.map((grp) => (
                <div key={grp.group} className="space-y-1">
                  <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                            ? 'bg-[#DC2626] text-white shadow-md'
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
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    gasConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>Google Sheet: {gasConnected ? 'Terhubung' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
