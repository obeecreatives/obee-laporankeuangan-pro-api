import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { WORKSPACE_MODULES } from '../../data/constants';
import { WorkspaceModule, UserRole } from '../../types/finance';

interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenDrawer: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
  activeModuleId: string;
  onSelectModule: (module: WorkspaceModule) => void;
  userRole: UserRole;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  isOpenDrawer,
  onCloseDrawer,
  onOpenDrawer,
  activeModuleId,
  onSelectModule,
  userRole,
}) => {
  const isRoleAdmin = userRole === 'super_admin' || userRole === 'project_manager';

  const bottomTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'input', label: 'Input', icon: PlusCircle },
    { key: 'riwayat', label: 'Jurnal', icon: FileSpreadsheet },
    { key: 'labarugi', label: 'Laba Rugi', icon: TrendingUp },
    { key: 'neraca', label: 'Neraca', icon: Scale },
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

        {/* More / Menu Drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isOpenDrawer
              ? 'text-[#DC2626] font-bold'
              : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">Modul</span>
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
                  <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">Unified Workspace OS</div>
                </div>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules list */}
            <div className="py-4 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8] mb-2">
                  Daftar 11 Modul Ekosistem
                </div>
                <div className="space-y-1">
                  {WORKSPACE_MODULES.filter((m) => !m.adminOnly || isRoleAdmin).map((mod) => {
                    const isSelected = activeModuleId === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          onSelectModule(mod);
                          onCloseDrawer();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-left transition ${
                          isSelected
                            ? 'bg-[#DC2626] text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-800 dark:text-[#F1F5F9]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span>{mod.name}</span>
                          {mod.status === 'active' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#450A0A] text-red-300 font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        {mod.externalUrl && <ExternalLink className="w-3.5 h-3.5 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra tools */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8] mb-2">
                  Navigasi Laporan Keuangan
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onSelectTab('integrasi');
                      onCloseDrawer();
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-[#1E293B] text-center font-medium text-slate-700 dark:text-[#F1F5F9]"
                  >
                    Hub Integrasi
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab('gas-settings');
                      onCloseDrawer();
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-[#1E293B] text-center font-medium text-slate-700 dark:text-[#F1F5F9]"
                  >
                    Headless GAS
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 text-center text-[10px] text-slate-400 dark:text-[#94A3B8] border-t border-slate-200 dark:border-[#1E293B]">
              Developed by lalumahendra/obeecreatives
            </div>
          </div>
        </div>
      )}
    </>
  );
};
