import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  Award,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  Building
} from 'lucide-react';
import { Veterinarian, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface VeterinariansViewProps {
  vets: Veterinarian[];
  userRole: UserRole;
  initialOpenNew?: boolean;
}

export const VeterinariansView: React.FC<VeterinariansViewProps> = ({
  vets,
  userRole,
  initialOpenNew = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNew);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);

  // Form State (REQ 06)
  const [formName, setFormName] = useState('');
  const [formCrmv, setFormCrmv] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState('Segunda a Sexta: 08:00 - 18:00');

  const handleOpenCreate = () => {
    setEditingVet(null);
    setFormName('');
    setFormCrmv('CRMV-BA ');
    setFormSpecialty('Clínica Geral');
    setFormPhone('');
    setFormEmail('');
    setFormWorkingHours('Segunda a Sexta: 08:00 - 18:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vet: Veterinarian) => {
    setEditingVet(vet);
    setFormName(vet.name);
    setFormCrmv(vet.crmv);
    setFormSpecialty(vet.specialty);
    setFormPhone(vet.phone);
    setFormEmail(vet.email);
    setFormWorkingHours(vet.workingHours);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCrmv.trim()) {
      alert('Nome e registro CRMV são obrigatórios.');
      return;
    }

    const vetToSave: Veterinarian = {
      id: editingVet ? editingVet.id : `vet-${Date.now()}`,
      name: formName.trim(),
      crmv: formCrmv.trim(),
      specialty: formSpecialty.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      workingHours: formWorkingHours.trim(),
      active: true
    };

    StorageService.saveVeterinarian(vetToSave);
    setIsModalOpen(false);
  };

  const handleDelete = (vet: Veterinarian) => {
    if (confirm(`Deseja realmente remover o profissional ${vet.name}?`)) {
      StorageService.deleteVeterinarian(vet.id);
    }
  };

  const filteredVets = vets.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.crmv.toLowerCase().includes(q) ||
      v.specialty.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Corpo Clínico & Veterinários (REQ 06)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastro e gerenciamento dos médicos veterinários da clínica, CRMV, especialidades e escalas.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veterinário</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, CRMV ou especialidade..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Grid of Vets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVets.map(vet => (
          <div
            key={vet.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                    <Stethoscope className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      {vet.name}
                    </h2>
                    <span className="text-xs font-mono font-semibold text-emerald-700 block mt-0.5">
                      {vet.crmv}
                    </span>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(vet)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="Editar veterinário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vet)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Excluir veterinário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{vet.specialty}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500">{vet.workingHours}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{vet.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{vet.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Ativo no Corpo Clínico
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Manter Veterinário (REQ 06) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingVet ? 'Alterar Veterinário (REQ 06)' : 'Cadastrar Veterinário (REQ 06)'}
                </h3>
                <p className="text-xs text-slate-500">Dados do profissional e registro de conselho de classe.</p>
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
                  placeholder="Ex: Dra. Larissa Barbosa Pinheiro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CRMV *</label>
                  <input
                    type="text"
                    required
                    value={formCrmv}
                    onChange={e => setFormCrmv(e.target.value)}
                    placeholder="CRMV-BA 14820"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Especialidade Principal *</label>
                  <input
                    type="text"
                    required
                    value={formSpecialty}
                    onChange={e => setFormSpecialty(e.target.value)}
                    placeholder="Ex: Clínica Médica"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="(71) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="vet@vetcare.com.br"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Escala / Horários de Atendimento</label>
                <input
                  type="text"
                  value={formWorkingHours}
                  onChange={e => setFormWorkingHours(e.target.value)}
                  placeholder="Ex: Segunda a Sexta: 08:00 - 18:00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
