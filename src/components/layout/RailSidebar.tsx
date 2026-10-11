import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  BookOpen,
  TrendingUp,
  Scale,
  RefreshCw,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface RailSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  gasConnected?: boolean;
}

export const RailSidebar: React.FC<RailSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  gasConnected = true,
}) => {
  const financialGroups = [
    {
      group: 'Pembukuan Utama',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          desc: 'Ikhtisar & ringkasan saldo',
          icon: LayoutDashboard,
        },
        {
          key: 'input',
          label: 'Input Transaksi',
          desc: 'Catat kas masuk/keluar',
          icon: PlusCircle,
          highlight: true,
        },
        {
          key: 'riwayat',
          label: 'Buku Jurnal Umum',
          desc: 'Daftar transaksi jurnal',
          icon: FileSpreadsheet,
        },
        {
          key: 'bukubesar',
          label: 'Buku Besar & Saldo',
          desc: 'Mutasi & Neraca Saldo akun',
          icon: BookOpen,
        },
      ],
    },
    {
      group: 'Laporan Keuangan',
      items: [
        {
          key: 'labarugi',
          label: 'Laporan Laba Rugi',
          desc: 'Kinerja laba/rugi akrual',
          icon: TrendingUp,
        },
        {
          key: 'neraca',
          label: 'Laporan Neraca',
          desc: 'Posisi aktiva vs pasiva',
          icon: Scale,
        },
      ],
    },
    {
      group: 'Integrasi Sheet',
      items: [
        {
          key: 'gas-settings',
          label: 'Koneksi Live Sheet',
          desc: 'Headless Google Apps Script',
          icon: RefreshCw,
        },
        {
          key: 'integrasi',
          label: 'Tarik Data Eksternal',
          desc: 'Import invoice CRM & payroll',
          icon: DownloadCloud,
        },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r transition-all duration-300 z-20 select-none sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#0B1120] border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-[#F1F5F9] shadow-sm`}
    >
      {/* 1. TOP TOGGLE BUTTON: Posisi toggle ciutkan sidebar sekarang berada di atas */}
      <div className="p-2.5 border-b border-slate-200/80 dark:border-[#1E293B]/80 flex items-center justify-between bg-slate-50/60 dark:bg-[#0E1526]">
        {!isCollapsed && (
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-1.5">
            <Menu className="w-3.5 h-3.5 text-slate-400" />
            <span>Menu Keuangan</span>
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E293B] transition-all text-xs font-semibold ${
            isCollapsed ? 'mx-auto' : 'ml-auto'
          }`}
          title={isCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
          aria-label={isCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#E30000]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-[#E30000]" />
              <span className="text-[11px]">Ciutkan</span>
            </>
          )}
        </button>
      </div>

      {/* 2. NAVIGATION GROUPS (Bisa di-scroll tersendiri jika layar vertikal kecil) */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {financialGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8]">
                {group.group}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group ${
                    isActive
                      ? 'bg-[#DC2626] text-white shadow-md shadow-red-600/25 font-bold'
                      : item.highlight
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#DC2626]'
                        : 'text-slate-400 dark:text-[#94A3B8] group-hover:text-[#DC2626]'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="truncate font-bold leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] truncate leading-tight mt-0.5 ${
                          isActive
                            ? 'text-red-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  )}

                  {!isCollapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. FOOTER GAS STATUS */}
      <div className="p-2.5 border-t border-slate-200 dark:border-[#1E293B]">
        {!isCollapsed ? (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  gasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                Google Sheet GAS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {gasConnected ? 'Terhubung & Sinkron' : 'Mode Offline / Cache'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-1" title={gasConnected ? 'GAS Terhubung' : 'GAS Offline'}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                gasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
