import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Dog,
  Stethoscope,
  Menu
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserRole } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
  userRole: UserRole;
  todayAppointmentCount: number;
  pendingVaccineCount: number;
  isEasyMode: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu,
  userRole,
  todayAppointmentCount,
  pendingVaccineCount,
  isEasyMode
}) => {
  const isClinical = userRole !== 'recepcionista';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Início',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'agenda' as NavTab,
      label: 'Agenda',
      icon: CalendarDays,
      badge: todayAppointmentCount > 0 ? todayAppointmentCount : undefined
    },
    {
      id: 'animals' as NavTab,
      label: 'Pacientes',
      icon: Dog,
      badge: undefined
    },
    {
      id: (isClinical ? 'attendance' : 'records') as NavTab,
      label: isClinical ? 'Atender' : 'Prontuário',
      icon: Stethoscope,
      badge: undefined
    }
  ];

  return (
    <nav 
      aria-label="Navegação Principal Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] no-print pb-safe"
    >
      <div className="grid grid-cols-5 items-stretch h-16 max-w-lg mx-auto px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-100 text-emerald-800 scale-105' : ''
                  }`}
                >
                  <Icon className={isEasyMode ? 'w-6 h-6' : 'w-5 h-5'} />
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`tracking-tight truncate max-w-[64px] ${isEasyMode ? 'text-xs mt-0.5' : 'text-[11px] mt-0.5'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 absolute bottom-1" />
              )}
            </button>
          );
        })}

        {/* 5th Tab: Menu Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-500 hover:text-slate-800 transition-all relative"
        >
          <div className="relative">
            <div className="p-1 rounded-xl">
              <Menu className={isEasyMode ? 'w-6 h-6' : 'w-5 h-5'} />
            </div>
            {pendingVaccineCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </div>
          <span className={`tracking-tight truncate max-w-[64px] ${isEasyMode ? 'text-xs mt-0.5 font-medium' : 'text-[11px] mt-0.5'}`}>
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
};
