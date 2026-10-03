import React, { useState, useEffect } from 'react';
import { RailSidebar } from './components/layout/RailSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { DashboardView } from './components/finance/DashboardView';
import { InputTransaksiView } from './components/finance/InputTransaksiView';
import { RiwayatJurnalView } from './components/finance/RiwayatJurnalView';
import { LabaRugiView } from './components/finance/LabaRugiView';
import { NeracaView } from './components/finance/NeracaView';
import { IntegrasiHubView } from './components/finance/IntegrasiHubView';
import { HeadlessGasPanel } from './components/finance/HeadlessGasPanel';
import { PinModal } from './components/modals/PinModal';
import { ModuleModal } from './components/modals/ModuleModal';
import { GasService } from './services/gasService';
import { StorageService } from './services/storageService';
import { INITIAL_USERS } from './data/constants';
import { WorkspaceModule, UserProfile } from './types/finance';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<string>('laporan-keuangan');
  const [selectedModule, setSelectedModule] = useState<WorkspaceModule | null>(null);

  // Dark / Light Theme (Mode Gelap — Default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('obee_theme');
    if (saved) return saved === 'dark';
    return true; // Default Dark Mode
  });

  // Sidebar Rail Collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('obee_sidebar_collapsed') === 'true';
  });

  // Current User (RBAC & PIN)
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // GAS Connection status
  const [gasStatus, setGasStatus] = useState<{ connected: boolean; latencyMs?: number }>({
    connected: true,
    latencyMs: 95,
  });

  // Apply dark theme class to <html> and <body>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('obee_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('obee_theme', 'light');
    }
  }, [isDarkMode]);

  // Data version trigger to refresh components
  const [dataVersion, setDataVersion] = useState(0);

  // Initial connection check & live sheet sync
  useEffect(() => {
    GasService.testConnection().then((res) => {
      setGasStatus({ connected: res.success, latencyMs: res.latencyMs });
      if (res.success) {
        GasService.pullRealSheetData().then((syncRes) => {
          if (syncRes.success) {
            setDataVersion((v) => v + 1);
            showToast(syncRes.message, 'success');
          }
        });
      }
    });
  }, []);

  const handleManualRefresh = async () => {
    const res = await GasService.pullRealSheetData();
    if (res.success) {
      setDataVersion((v) => v + 1);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      showToast(next ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan');
      return next;
    });
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('obee_sidebar_collapsed', String(!prev));
      return !prev;
    });
  };

  const handleSelectModule = (mod: WorkspaceModule) => {
    if (mod.id === 'laporan-keuangan') {
      setActiveModuleId('laporan-keuangan');
      setActiveTab('dashboard');
    } else {
      setSelectedModule(mod);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-[#F1F5F9] transition-colors selection:bg-red-500/20 selection:text-[#EF4444]`}>
      {/* Desktop/Tablet Rail Sidebar */}
      <RailSidebar
        activeModuleId={activeModuleId}
        onSelectModule={handleSelectModule}
        userRole={currentUser.role}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenPinModal={() => setIsPinModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          gasStatus={gasStatus}
          onRefreshData={handleManualRefresh}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" key={dataVersion}>
          {activeTab === 'dashboard' && (
            <DashboardView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'input' && (
            <InputTransaksiView
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'riwayat' && (
            <RiwayatJurnalView
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
            />
          )}

          {activeTab === 'labarugi' && <LabaRugiView />}

          {activeTab === 'neraca' && <NeracaView />}

          {activeTab === 'integrasi' && (
            <IntegrasiHubView
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
            />
          )}

          {activeTab === 'gas-settings' && (
            <HeadlessGasPanel
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
              onRefreshData={() => setDataVersion((v) => v + 1)}
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer & Bottom Nav */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenDrawer={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        activeModuleId={activeModuleId}
        onSelectModule={handleSelectModule}
        userRole={currentUser.role}
      />

      {/* Profile & PIN Security Modal */}
      <PinModal
        currentUser={currentUser}
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onUpdateCurrentUser={setCurrentUser}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Workspace Other Modules Preview Modal */}
      <ModuleModal
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
        onNavigateToFinance={() => {
          setActiveModuleId('laporan-keuangan');
          setActiveTab('dashboard');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 border border-gray-800 dark:border-gray-200 animate-in fade-in slide-in-from-top-3 duration-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
