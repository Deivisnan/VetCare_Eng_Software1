import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  ClipboardList,
  Syringe,
  FileText,
  Users,
  Dog,
  UserCheck,
  DollarSign,
  BellRing,
  BarChart3,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'agenda'
  | 'attendance'
  | 'records'
  | 'vaccines'
  | 'prescriptions'
  | 'animals'
  | 'tutors'
  | 'vets'
  | 'financial'
  | 'notifications'
  | 'reports'
  | 'users';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  pendingVaccineCount: number;
  todayAppointmentCount: number;
  isEasyMode?: boolean;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingVaccineCount,
  todayAppointmentCount,
  isEasyMode = false
}) => {
  const clinicalItems: NavItem[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['admin', 'veterinario', 'recepcionista'] },
    { 
      id: 'agenda', 
      label: 'Agenda de Consultas', 
      icon: CalendarDays, 
      roles: ['admin', 'veterinario', 'recepcionista'],
      badgeCount: todayAppointmentCount > 0 ? todayAppointmentCount : undefined
    },
    { id: 'attendance', label: 'Atendimento Clínico', icon: Stethoscope, roles: ['admin', 'veterinario'] },
    { id: 'records', label: 'Prontuários', icon: ClipboardList, roles: ['admin', 'veterinario', 'recepcionista'] },
    { 
      id: 'vaccines', 
      label: 'Vacinação', 
      icon: Syringe, 
      roles: ['admin', 'veterinario', 'recepcionista'],
      badgeCount: pendingVaccineCount > 0 ? pendingVaccineCount : undefined
    },
    { id: 'prescriptions', label: 'Prescrições', icon: FileText, roles: ['admin', 'veterinario'] }
  ];

  const registryItems: NavItem[] = [
    { id: 'animals', label: 'Animais (Pacientes)', icon: Dog, roles: ['admin', 'veterinario', 'recepcionista'] },
    { id: 'tutors', label: 'Tutores (Clientes)', icon: Users, roles: ['admin', 'veterinario', 'recepcionista'] },
    { id: 'vets', label: 'Corpo Clínico', icon: UserCheck, roles: ['admin', 'veterinario', 'recepcionista'] }
  ];

  const managementItems: NavItem[] = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, roles: ['admin', 'recepcionista'] },
    { id: 'notifications', label: 'Notificações', icon: BellRing, roles: ['admin', 'veterinario', 'recepcionista'] },
    { id: 'reports', label: 'Relatórios Gerenciais', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuários do Sistema', icon: ShieldCheck, roles: ['admin'] }
  ];

  const filterByRole = (items: NavItem[]) => items.filter(item => item.roles.includes(userRole));

  const renderSection = (title: string, items: NavItem[]) => {
    const visible = filterByRole(items);
    if (visible.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          {title}
        </h3>
        <ul className="space-y-1">
          {visible.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-semibold border-l-4 border-emerald-600 rounded-l-none'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badgeCount !== undefined && (
                    <span className="ml-2 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 shrink-0 flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)] no-print">
      <div className="overflow-y-auto">
        {renderSection('Atendimento & Clínica', clinicalItems)}
        {renderSection('Cadastros Gerais', registryItems)}
        {renderSection('Administração & Gestão', managementItems)}
      </div>

      {/* Clinic Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 px-3">
        <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>VetCare Gestão v01.00</span>
        </div>
        <p className="text-[11px] text-slate-400">UFBA · Hospital Veterinário</p>
      </div>
    </aside>
  );
};
