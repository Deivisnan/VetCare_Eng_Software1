import React from 'react';
import {
  X,
  ClipboardList,
  Syringe,
  FileText,
  Users,
  UserCheck,
  DollarSign,
  BellRing,
  BarChart3,
  ShieldCheck,
  Building2,
  LogOut,
  Type,
  Check,
  HeartHandshake,
  Shield,
  Stethoscope
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserRole, User as UserType } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  currentUser: UserType;
  allUsers: UserType[];
  onSwitchUser: (user: UserType) => void;
  onLogout: () => void;
  pendingVaccineCount: number;
  isEasyMode: boolean;
  onToggleEasyMode: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  userRole,
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  pendingVaccineCount,
  isEasyMode,
  onToggleEasyMode
}) => {
  if (!isOpen) return null;

  const navigateAndClose = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  const menuSections = [
    {
      title: 'Clínica & Cuidados',
      items: [
        { id: 'records' as NavTab, label: 'Prontuários Clínicos', icon: ClipboardList, roles: ['admin', 'veterinario', 'recepcionista'] },
        { 
          id: 'vaccines' as NavTab, 
          label: 'Vacinas & Imunização', 
          icon: Syringe, 
          roles: ['admin', 'veterinario', 'recepcionista'],
          badge: pendingVaccineCount > 0 ? `${pendingVaccineCount} pendente(s)` : undefined
        },
        { id: 'prescriptions' as NavTab, label: 'Receituário & Prescrições', icon: FileText, roles: ['admin', 'veterinario'] },
      ]
    },
    {
      title: 'Contatos & Cadastros',
      items: [
        { id: 'tutors' as NavTab, label: 'Tutores (Clientes)', icon: Users, roles: ['admin', 'veterinario', 'recepcionista'] },
        { id: 'vets' as NavTab, label: 'Corpo Clínico (Veterinários)', icon: UserCheck, roles: ['admin', 'veterinario', 'recepcionista'] },
      ]
    },
    {
      title: 'Gestão & Administrativo',
      items: [
        { id: 'financial' as NavTab, label: 'Financeiro & Caixa', icon: DollarSign, roles: ['admin', 'recepcionista'] },
        { id: 'notifications' as NavTab, label: 'Notificações (WhatsApp)', icon: BellRing, roles: ['admin', 'veterinario', 'recepcionista'] },
        { id: 'reports' as NavTab, label: 'Relatórios Gerenciais', icon: BarChart3, roles: ['admin'] },
        { id: 'users' as NavTab, label: 'Usuários do Sistema', icon: ShieldCheck, roles: ['admin'] },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Sheet Content */}
      <div className="relative bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-10 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mais Opções do VetCare</h3>
            <p className="text-xs text-slate-500">Navegue pelas funções adicionais da clínica</p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar menu"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility Toggle Banner (Pensado especialmente para Idosos e Jovens) */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">
                Modo Leitura Fácil (Texto Grande)
              </span>
              <span className="text-xs text-slate-600 block mt-0.5">
                {isEasyMode ? 'Ativado: textos ampliados e botões maiores' : 'Toque para ampliar textos e botões'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleEasyMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 min-h-[44px] ${
              isEasyMode 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'bg-white text-emerald-900 border border-emerald-300'
            }`}
          >
            {isEasyMode ? 'Desativar' : 'Ativar'}
          </button>
        </div>

        {/* Menu items by sections */}
        <div className="space-y-4">
          {menuSections.map(section => {
            const availableItems = section.items.filter(item => item.roles.includes(userRole));
            if (availableItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                  {section.title}
                </span>

                <div className="space-y-1">
                  {availableItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateAndClose(item.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left min-h-[50px] ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-600'
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`${isEasyMode ? 'text-base font-semibold' : 'text-sm font-medium'}`}>
                            {item.label}
                          </span>
                        </div>

                        {item.badge && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Account / Profile Switcher on Mobile */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Usuário Conectado
            </span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              Perfil: {currentUser.role}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="truncate">
                <span className="font-bold text-sm text-slate-900 block truncate">{currentUser.name}</span>
                <span className="text-xs text-slate-500 block truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Quick Switch Profiles */}
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                Trocar Perfil (Teste de Usuários):
              </span>
              <div className="grid grid-cols-1 gap-1">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      onClose();
                    }}
                    className={`p-2 rounded-lg text-left text-xs flex items-center justify-between ${
                      u.id === currentUser.id 
                        ? 'bg-emerald-100/70 text-emerald-900 font-bold' 
                        : 'hover:bg-slate-200/50 text-slate-700'
                    }`}
                  >
                    <span>{u.name} ({u.role})</span>
                    {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 bg-rose-50 text-rose-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors min-h-[48px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
