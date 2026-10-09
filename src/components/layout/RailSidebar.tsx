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
  ShieldCheck,
  FileCheck2,
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
      group: 'Laporan Keuangan Resmi',
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
      group: 'Integrasi Data Sheet',
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
      className={`relative hidden md:flex flex-col border-r transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#0B1120] border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-[#F1F5F9] shadow-sm`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#E30000] flex items-center justify-center text-white font-black shadow-md shadow-red-500/25 shrink-0">
            <span className="text-xl tracking-tighter">O</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                obee<span className="text-[#E30000]">creatives</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-[#94A3B8] flex items-center gap-1">
                <FileCheck2 className="w-3 h-3 text-[#E30000]" />
                <span>Laporan Keuangan</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {financialGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8]">
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
                      <div className="truncate font-bold">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
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

      {/* Footer Connection & Collapse Status */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  gasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Google Sheet GAS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {gasConnected ? 'Terhubung & Sinkron' : 'Mode Offline / Cache'}
            </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
          title={isCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Ciutkan Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
