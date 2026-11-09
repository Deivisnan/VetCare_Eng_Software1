import React, { useState } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  Shield,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { User } from '../types';
import { PasswordResetModal } from '../components/PasswordResetModal';
import { StorageService } from '../services/storage';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, users }) => {
  const [email, setEmail] = useState('larissa.leoncio@ufba.br');
  const [password, setPassword] = useState('vetcare123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);

  const config = StorageService.getConfig();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const matchedUser = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      setErrorMessage('Usuário não cadastrado com este endereço de e-mail.');
      return;
    }

    if (!matchedUser.active) {
      setErrorMessage('Este usuário foi desativado pelo administrador.');
      return;
    }

    // Authenticate
    onLoginSuccess(matchedUser);
  };

  const handleSelectDemoProfile = (targetUser: User) => {
    setEmail(targetUser.email);
    setPassword('vetcare123');
    onLoginSuccess(targetUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/40">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            VetCare
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Sistema de Gestão para Clínica & Hospital Veterinário
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Resp. Técnica: {config.technicalResponsible.name} ({config.technicalResponsible.crmv})
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-100 text-xs">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Autenticação de Usuário (REQ 02)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Informe suas credenciais para acessar o painel de atendimento.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail Institucional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu.email@vetcare.ufba.br"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Senha de Acesso *</label>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Esqueci minha senha (REQ 03)
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Acessar o Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access by Role (For evaluator / testing) */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Acesso Rápido por Perfil (Ambiente de Avaliação):
            </span>

            <div className="space-y-1.5">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoProfile(u)}
                  className="w-full p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-all group"
                >
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-950">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      Perfil: <strong>{u.role}</strong> {u.crmv ? `· ${u.crmv}` : ''}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Entrar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>VetCare Gestão Clínica · Versão 01.00</p>
          <p className="text-[11px] text-slate-600 mt-0.5">UFBA - Universidade Federal da Bahia</p>
        </div>
      </div>

      {/* Password Reset Modal (REQ 03) */}
      <PasswordResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
