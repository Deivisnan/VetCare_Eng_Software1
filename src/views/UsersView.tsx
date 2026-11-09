import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  Shield,
  Edit2,
  Trash2,
  X,
  Lock,
  Phone,
  Mail
} from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { formatDateTime } from '../utils/formatters';

interface UsersViewProps {
  users: User[];
  currentUserId: string;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State (REQ 01)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('veterinario');
  const [formPhone, setFormPhone] = useState('');
  const [formCrmv, setFormCrmv] = useState('');
  const [formActive, setFormActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('veterinario');
    setFormPhone('');
    setFormCrmv('CRMV-BA ');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPhone(user.phone || '');
    setFormCrmv(user.crmv || '');
    setFormActive(user.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert('Nome e e-mail são obrigatórios.');
      return;
    }

    const userToSave: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      phone: formPhone.trim() || undefined,
      crmv: formRole === 'veterinario' ? formCrmv.trim() : undefined,
      active: formActive,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
    };

    StorageService.saveUser(userToSave);
    setIsModalOpen(false);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUserId) {
      alert('Você não pode excluir o seu próprio usuário enquanto estiver conectado.');
      return;
    }
    if (confirm(`Deseja realmente excluir o acesso do usuário ${user.name}?`)) {
      StorageService.deleteUser(user.id);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.crmv?.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', icon: Shield, style: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'veterinario':
        return { label: 'Veterinário(a)', icon: Stethoscope, style: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'recepcionista':
        return { label: 'Recepcionista', icon: HeartHandshake, style: 'text-sky-800 bg-sky-50 border-sky-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Controle de Usuários do Sistema (REQ 01)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de credenciais, controle de acesso e perfis de segurança (Administrador, Recepcionista, Veterinário).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Usuário (REQ 01)</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou perfil..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nome do Usuário</th>
                <th className="py-3 px-4">E-mail de Login</th>
                <th className="py-3 px-4">Perfil de Acesso (Segurança)</th>
                <th className="py-3 px-4">Registro CRMV</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                const isSelf = user.id === currentUserId;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                            Você
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {user.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${roleBadge.style}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {user.crmv || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {user.phone || '-'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        user.active ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                          title="Alterar usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manter Usuário (REQ 01) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Alterar Usuário (REQ 01)' : 'Cadastrar Usuário (REQ 01)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Defina o nome, credenciais de acesso e perfil com restrições.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Login *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="usuario@vetcare.com.br"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perfil de Acesso (Segurança) *</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="veterinario">Veterinário(a) (Consultas, Prontuário, Vacinação, Prescrições)</option>
                  <option value="recepcionista">Recepcionista (Agenda, Tutores, Animais, Pagamentos)</option>
                  <option value="admin">Administrador (Acesso Total, Usuários, Relatórios)</option>
                </select>
              </div>

              {formRole === 'veterinario' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número do CRMV *</label>
                  <input
                    type="text"
                    required
                    value={formCrmv}
                    onChange={e => setFormCrmv(e.target.value)}
                    placeholder="CRMV-BA 14820"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="(71) 99999-9999"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Usuário Ativo com permissão de login</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
