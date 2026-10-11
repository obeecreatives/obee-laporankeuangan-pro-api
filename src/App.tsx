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
import { InstallModal } from './components/modals/InstallModal';
import { QuickSearchModal } from './components/modals/QuickSearchModal';
import { GasCenterModal } from './components/modals/GasCenterModal';
import { GasService } from './services/gasService';
import { CheckCircle2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { RBACRole } from './types/finance';
import { getRoleConfig } from './data/rbacRoles';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // RBAC Role Switcher State
  const [currentRole, setCurrentRole] = useState<RBACRole>(() => {
    const saved = localStorage.getItem('obee_active_role');
    if (saved && ['admin', 'project_manager', 'site_engineer', 'staff', 'vendor_client', 'publik'].includes(saved)) {
      return saved as RBACRole;
    }
    return 'admin';
  });

  // Quick Search & GAS Center Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGasCenterOpen, setIsGasCenterOpen] = useState(false);

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
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // PWA install status
  const { isInstalled, isInstallable, install } = usePWAInstall();

  // Banner dismissed state in session
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return sessionStorage.getItem('obee_pwa_banner_dismissed') === 'true';
  });

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

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    sessionStorage.setItem('obee_pwa_banner_dismissed', 'true');
  };

  const handleChangeRole = (role: RBACRole) => {
    setCurrentRole(role);
    localStorage.setItem('obee_active_role', role);
    const cfg = getRoleConfig(role);
    showToast(`Beralih ke peran: ${cfg.label}`, 'success');
  };

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        showToast('Aplikasi berhasil dipasang di perangkat Anda!', 'success');
        return;
      }
    }
    // Jika perlu panduan atau iOS, buka modal instruksi yang mudah
    setIsInstallModalOpen(true);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-[#F1F5F9] transition-colors selection:bg-red-500/20 selection:text-[#EF4444]`}>
      {/* 1. Full-Width Global Topbar / Header (Penuh di Atas) */}
      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        gasStatus={gasStatus}
        onRefreshData={handleManualRefresh}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
        currentRole={currentRole}
        onChangeRole={handleChangeRole}
      />

      {/* Mobile Friendly Quick Install Banner (Khusus HP / Layar belum terpasang aplikasi) */}
      {!isInstalled && !isBannerDismissed && (
        <aside 
          aria-label="Pemberitahuan Pemasangan Aplikasi"
          className="md:hidden bg-gradient-to-r from-red-600 via-[#E30000] to-orange-600 text-white px-3.5 py-2.5 flex items-center justify-between text-xs shadow-md shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="p-1 rounded-lg bg-white/20 shrink-0">
              <Download className="w-4 h-4 text-white" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold truncate leading-tight">
                Install Aplikasi di HP?
              </span>
              <span className="text-[10px] text-white/90 truncate leading-tight">
                Buka lebih cepat & tampilan layar penuh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerInstall}
              className="px-3 py-1 rounded-lg bg-white text-[#E30000] font-black text-[11px] shadow hover:bg-slate-100 active:scale-95 transition"
            >
              Pasang
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 text-white/70 hover:text-white"
              aria-label="Tutup Banner"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* 2. Body Container (Sidebar Terkunci di Bawah Header + Main View Area) */}
      <div className="flex-1 flex min-h-[calc(100vh-3.5rem)]">
        {/* Desktop/Tablet Dedicated Financial Sidebar (Terkunci Sticky di Samping Kiri) */}
        <RailSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          gasConnected={gasStatus.connected}
        />

        {/* Main Workspace Frame (Mobile-optimised padding & bottom spacing) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto pb-24 md:pb-8" key={dataVersion}>
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

      {/* Mobile Sticky Navigation (Native App Bottom Tab Bar) */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenDrawer={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        gasConnected={gasStatus.connected}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        currentRole={currentRole}
        onChangeRole={handleChangeRole}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
      />

      {/* Quick Search Global Command Palette (⌘K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* GAS Center & Two-Way Sync Trigger Modal */}
      <GasCenterModal
        isOpen={isGasCenterOpen}
        onClose={() => setIsGasCenterOpen(false)}
        gasStatus={gasStatus}
        onRefreshData={handleManualRefresh}
        onNavigateTab={setActiveTab}
      />

      {/* Install Modal Popup (Direct install on Chrome/Android/Edge & iOS quick helper) */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstalledSuccess={() => showToast('Aplikasi berhasil dipasang di perangkat Anda!', 'success')}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold border backdrop-blur-md ${
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
