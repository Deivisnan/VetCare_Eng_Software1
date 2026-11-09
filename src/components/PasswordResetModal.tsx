import React, { useState } from 'react';
import { KeyRound, Mail, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ''
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  if (!isOpen) return null;

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Simulate sending an SMS/Email code (e.g. 849201)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResetCode(code); // Pre-fill for convenience of demonstration
    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('As senhas digitadas não coincidem.');
      return;
    }
    setStep(3);
  };

  const handleFinish = () => {
    setStep(1);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recuperar Senha (REQ 03)</h3>
              <p className="text-[11px] text-slate-500">Recupere o acesso à sua conta da clínica VetCare.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Informe o seu e-mail institucional cadastrado para enviarmos as instruções e o código de recuperação:
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-mail Cadastrado *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="larissa.leoncio@ufba.br"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>Enviar Código</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px]">
              <strong>Código de verificação simulado enviado:</strong> Um código de 6 dígitos foi enviado para <em>{email}</em>.
              <span className="block mt-1 font-mono font-bold text-xs text-emerald-800">
                Código gerado: {generatedCode}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código de 6 Dígitos *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={e => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-center tracking-widest text-base font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirmar Senha *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Redefinir Senha
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Senha Alterada com Sucesso!</h4>
            <p className="text-slate-500 text-xs">
              Sua nova senha foi salva com segurança. Agora você já pode se autenticar utilizando suas novas credenciais.
            </p>
            <button
              onClick={handleFinish}
              className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Fazer Login Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
