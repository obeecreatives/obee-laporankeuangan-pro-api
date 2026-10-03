import React, { useState } from 'react';
import {
  KanbanSquare,
  Briefcase,
  Users,
  DollarSign,
  FileText,
  FolderOpen,
  Camera,
  Package,
  Share2,
  UserCheck,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WORKSPACE_MODULES } from '../../data/constants';
import { WorkspaceModule, UserRole } from '../../types/finance';

interface RailSidebarProps {
  activeModuleId: string;
  onSelectModule: (module: WorkspaceModule) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const RailSidebar: React.FC<RailSidebarProps> = ({
  activeModuleId,
  onSelectModule,
  userRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Icon mapping helper
  const getIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'KanbanSquare':
        return <KanbanSquare className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'DollarSign':
        return <DollarSign className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'FolderOpen':
        return <FolderOpen className={className} />;
      case 'Camera':
        return <Camera className={className} />;
      case 'Package':
        return <Package className={className} />;
      case 'Share2':
        return <Share2 className={className} />;
      case 'UserCheck':
        return <UserCheck className={className} />;
      case 'UserPlus':
        return <UserPlus className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const categories = [
    { key: 'core', label: 'Core Operations' },
    { key: 'finance', label: 'Finance & Legal' },
    { key: 'creative', label: 'Creative & Assets' },
    { key: 'people', label: 'People & Talent' },
  ];

  const isRoleAdmin = userRole === 'super_admin' || userRole === 'project_manager';

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
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-[#94A3B8]">
                Workspace OS
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Categories Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {categories.map((cat) => {
          const modulesInCat = WORKSPACE_MODULES.filter(
            (m) => m.category === cat.key && (!m.adminOnly || isRoleAdmin)
          );

          if (modulesInCat.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8]">
                  {cat.label}
                </div>
              )}

              {modulesInCat.map((module) => {
                const isActive = activeModuleId === module.id;
                const isHovered = hoveredModule === module.id;

                return (
                  <div key={module.id} className="relative">
                    <button
                      onClick={() => onSelectModule(module)}
                      onMouseEnter={() => setHoveredModule(module.id)}
                      onMouseLeave={() => setHoveredModule(null)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group ${
                        isActive
                          ? 'bg-[#DC2626] text-white shadow-md shadow-red-600/25 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <div className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-[#94A3B8] group-hover:text-[#DC2626]'}`}>
                        {getIcon(module.icon)}
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{module.name}</span>
                          {module.status === 'active' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#450A0A] text-red-300'
                            }`}>
                              Aktif
                            </span>
                          )}
                          {module.externalUrl && (
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Tooltip on collapsed rail mode */}
                    {isCollapsed && isHovered && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap border border-gray-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="font-bold flex items-center gap-2">
                          {module.name}
                          {module.status === 'active' && (
                            <span className="text-[9px] bg-[#E30000] text-white px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 max-w-xs truncate">
                          {module.description}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Rail Collapse Toggle & Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
          title={isCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#DC2626]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Ciutkan Rail</span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="pt-2 px-2 text-[10px] text-slate-400 dark:text-[#94A3B8] text-center flex items-center justify-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-[#DC2626]" />
            <span>Next-Gen V2 Architecture</span>
          </div>
        )}
      </div>
    </aside>
  );
};
