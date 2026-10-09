import React, { useState, useEffect } from 'react';
import { RailSidebar } from './components/layout/RailSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { DashboardView } from './components/finance/DashboardView';
import { InputTransaksiView } from './components/finance/InputTransaksiView';
import { RiwayatJurnalView } from './components/finance/RiwayatJurnalView';
import { BukuBesarView } from './components/finance/BukuBesarView';
import { LabaRugiView } from './components/finance/LabaRugiView';
import { NeracaView } from './components/finance/NeracaView';
import { IntegrasiHubView } from './components/finance/IntegrasiHubView';
import { HeadlessGasPanel } from './components/finance/HeadlessGasPanel';
import { GasService } from './services/gasService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // GAS Connection status
  const [gasStatus, setGasStatus] = useState<{ connected: boolean; latencyMs?: number }>({
    connected: true,
    latencyMs: 95,
  });

  // Data version trigger to refresh components
  const [dataVersion, setDataVersion] = useState(0);

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

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-[#F1F5F9] transition-colors selection:bg-red-500/20 selection:text-[#EF4444]`}>
      {/* Desktop/Tablet Dedicated Financial Sidebar */}
      <RailSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        gasConnected={gasStatus.connected}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          gasStatus={gasStatus}
          onRefreshData={handleManualRefresh}
        />

        {/* Financial View Router */}
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

          {activeTab === 'bukubesar' && <BukuBesarView />}

          {activeTab === 'labarugi' && <LabaRugiView />}

          {activeTab === 'neraca' && <NeracaView />}

          {activeTab === 'gas-settings' && (
            <HeadlessGasPanel
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
              onRefreshData={() => setDataVersion((v) => v + 1)}
            />
          )}

          {activeTab === 'integrasi' && (
            <IntegrasiHubView
              onSuccess={(msg) => {
                showToast(msg, 'success');
                setDataVersion((v) => v + 1);
              }}
              onRefreshData={() => setDataVersion((v) => v + 1)}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenDrawer={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        gasConnected={gasStatus.connected}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/40'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-black/50'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="max-w-md">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
