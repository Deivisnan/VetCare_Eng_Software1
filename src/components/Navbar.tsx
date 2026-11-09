import React from 'react';
import { 
  User, 
  Stethoscope, 
  LogOut, 
  Bell, 
  Shield, 
  UserCheck, 
  HeartHandshake,
  Download,
  RotateCcw,
  Type
} from 'lucide-react';
import { User as UserType } from '../types';
import { StorageService } from '../services/storage';

interface NavbarProps {
  currentUser: UserType;
  onLogout: () => void;
  onSwitchUser: (user: UserType) => void;
  allUsers: UserType[];
  pendingVaccineCount: number;
  todayAppointmentCount: number;
  isEasyMode: boolean;
  onToggleEasyMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers,
  pendingVaccineCount,
  todayAppointmentCount,
  isEasyMode,
  onToggleEasyMode
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const config = StorageService.getConfig();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', icon: Shield, style: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'veterinario':
        return { label: 'Veterinário(a)', icon: Stethoscope, style: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'recepcionista':
        return { label: 'Recepção', icon: HeartHandshake, style: 'text-sky-800 bg-sky-50 border-sky-200' };
      default:
        return { label: role, icon: UserCheck, style: 'text-slate-800 bg-slate-50 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between no-print">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="#dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            VetCare
          </span>
        </a>
        <span className="hidden sm:inline text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
          {config.clinicName.replace('VetCare ', '')}
        </span>
      </div>

      {/* Zone 2: Navigation contextual reminders */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{todayAppointmentCount} {todayAppointmentCount === 1 ? 'consulta hoje' : 'consultas hoje'}</span>
        </div>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${pendingVaccineCount > 0 ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
          <span>{pendingVaccineCount} {pendingVaccineCount === 1 ? 'vacina pendente' : 'vacinas pendentes'}</span>
        </div>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Resp. Técnica: {config.technicalResponsible.name}</span>
      </div>

      {/* Zone 3: 1-2 primary actions and user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Accessibility / Easy Read Toggle (A+) */}
        <button
          onClick={onToggleEasyMode}
          title={isEasyMode ? "Voltar ao texto padrão" : "Ativar Modo Leitura Fácil (Texto e botões maiores)"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
            isEasyMode 
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
              : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Type className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{isEasyMode ? 'Texto Grande: ON' : 'Texto Maior (A+)'}</span>
          <span className="sm:hidden">{isEasyMode ? 'A++' : 'A+'}</span>
        </button>

        {/* Backup / Export quick tool */}
        <button
          onClick={() => StorageService.exportBackup()}
          title="Exportar backup completo de dados (JSON)"
          className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* User profile & Fast switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu do usuário e perfil"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <RoleIcon className="w-2.5 h-2.5" />
                <span>{roleInfo.label}</span>
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">{currentUser.name}</p>
                <p className="text-slate-500">{currentUser.email}</p>
                {currentUser.crmv && (
                  <p className="text-emerald-700 font-mono mt-0.5 text-[11px]">{currentUser.crmv}</p>
                )}
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700">
                  <RoleIcon className="w-3 h-3" />
                  Perfil: {roleInfo.label}
                </div>
              </div>

              {/* Fast role switcher for instant preview of RBAC rules */}
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Alternar Usuário (Teste de Perfis)
                </p>
                <div className="space-y-1">
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        user.id === currentUser.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                      </div>
                      {user.id === currentUser.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset seed data button */}
              <div className="px-4 py-2 border-b border-slate-100">
                <button
                  onClick={() => {
                    if (window.confirm('Deseja restaurar os dados originais de demonstração da clínica?')) {
                      StorageService.resetAll();
                    }
                  }}
                  className="w-full text-left py-1 text-slate-600 hover:text-slate-900 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Dados Iniciais</span>
                </button>
              </div>

              <div className="px-2 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
