import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Dog,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Tutor, Animal, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { maskCPF, maskPhone } from '../utils/formatters';

interface TutorsViewProps {
  tutors: Tutor[];
  animals: Animal[];
  userRole: UserRole;
  onNavigateToAnimalsWithTutor: (tutorId: string) => void;
  onNavigateToNotificationsForTutor: (tutorId: string) => void;
  initialOpenNew?: boolean;
}

export const TutorsView: React.FC<TutorsViewProps> = ({
  tutors,
  animals,
  userRole,
  onNavigateToAnimalsWithTutor,
  onNavigateToNotificationsForTutor,
  initialOpenNew = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNew);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

  // Form State (REQ 04)
  const [formName, setFormName] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('Salvador');
  const [formState, setFormState] = useState('BA');
  const [formZipCode, setFormZipCode] = useState('40000-000');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenCreate = () => {
    setEditingTutor(null);
    setFormName('');
    setFormCpf('');
    setFormPhone('');
    setFormEmail('');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('');
    setFormCity('Salvador');
    setFormState('BA');
    setFormZipCode('40000-000');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setFormName(tutor.name);
    setFormCpf(tutor.cpf);
    setFormPhone(tutor.phone);
    setFormEmail(tutor.email);
    setFormStreet(tutor.address.street);
    setFormNumber(tutor.address.number);
    setFormComplement(tutor.address.complement || '');
    setFormNeighborhood(tutor.address.neighborhood);
    setFormCity(tutor.address.city);
    setFormState(tutor.address.state);
    setFormZipCode(tutor.address.zipCode);
    setFormNotes(tutor.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Nome e telefone são campos obrigatórios.');
      return;
    }

    const tutorToSave: Tutor = {
      id: editingTutor ? editingTutor.id : `tut-${Date.now()}`,
      name: formName.trim(),
      cpf: maskCPF(formCpf),
      phone: maskPhone(formPhone),
      email: formEmail.trim(),
      address: {
        street: formStreet.trim() || 'Rua Principal',
        number: formNumber.trim() || 'S/N',
        complement: formComplement.trim() || undefined,
        neighborhood: formNeighborhood.trim() || 'Centro',
        city: formCity.trim() || 'Salvador',
        state: formState.trim() || 'BA',
        zipCode: formZipCode.trim() || '40000-000'
      },
      notes: formNotes.trim() || undefined,
      createdAt: editingTutor ? editingTutor.createdAt : new Date().toISOString()
    };

    StorageService.saveTutor(tutorToSave);
    setIsModalOpen(false);
  };

  const handleDelete = (tutor: Tutor) => {
    const tutorAnimals = animals.filter(a => a.tutorId === tutor.id);
    if (tutorAnimals.length > 0) {
      alert(`Não é possível excluir o tutor ${tutor.name} pois existem ${tutorAnimals.length} animal(is) vinculados a ele. Remova ou transfira os animais primeiro.`);
      return;
    }
    if (confirm(`Deseja realmente excluir o cadastro do tutor ${tutor.name}?`)) {
      StorageService.deleteTutor(tutor.id);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tutor.name.toLowerCase().includes(q) ||
      tutor.cpf.toLowerCase().includes(q) ||
      tutor.phone.toLowerCase().includes(q) ||
      tutor.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tutores / Clientes (REQ 04)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de tutores responsáveis, dados cadastrais de contato, endereço e pets vinculados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Tutor</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone ou e-mail..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg"
          />
        </div>
        <span className="text-slate-400 text-xs hidden sm:inline">
          {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor listado' : 'tutores listados'}
        </span>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredTutors.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Nenhum tutor encontrado.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
            >
              + Cadastrar primeiro tutor
            </button>
          </div>
        ) : (
          filteredTutors.map(tutor => {
            const tutorPets = animals.filter(a => a.tutorId === tutor.id);

            return (
              <div
                key={tutor.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {tutor.name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        CPF: {tutor.cpf}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(tutor)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Editar cadastro do tutor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(tutor)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          title="Excluir tutor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contacts & Address */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {tutor.phone}
                      </span>
                      {tutor.email && (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {tutor.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {tutor.address.street}, {tutor.address.number}
                        {tutor.address.complement ? ` - ${tutor.address.complement}` : ''} · {tutor.address.neighborhood}, {tutor.address.city}/{tutor.address.state}
                      </span>
                    </div>

                    {tutor.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                        {tutor.notes}
                      </p>
                    )}
                  </div>

                  {/* Associated Pets */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Animais vinculados ({tutorPets.length}):
                      </span>
                      <button
                        onClick={() => onNavigateToAnimalsWithTutor(tutor.id)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        + Adicionar Animal
                      </button>
                    </div>

                    {tutorPets.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum animal cadastrado para este tutor ainda.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {tutorPets.map(pet => (
                          <span
                            key={pet.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-800 font-medium"
                          >
                            <Dog className="w-3 h-3 text-emerald-600" />
                            {pet.name} ({pet.species})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => onNavigateToNotificationsForTutor(tutor.id)}
                    className="w-full sm:w-auto text-xs sm:text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Enviar Notificação / WhatsApp (REQ 16)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Manter Tutor (REQ 04) - Mobile Bottom Sheet on smartphone, Centered dialog on desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingTutor ? 'Alterar Tutor (REQ 04)' : 'Cadastrar Novo Tutor (REQ 04)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os dados do responsável pelo paciente.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                aria-label="Fechar"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Tutor *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Maria Clara Santos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={formCpf}
                    onChange={e => setFormCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="(71) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="tutor@email.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Endereço */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="font-semibold text-slate-800 block">Endereço de Residência</span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={e => setFormStreet(e.target.value)}
                      placeholder="Ex: Rua das Hortênsias"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={formNumber}
                      onChange={e => setFormNumber(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={e => setFormNeighborhood(e.target.value)}
                      placeholder="Pituba"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formState}
                      onChange={e => setFormState(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações ou Preferências de Contato</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ex: Prefere confirmações via mensagem de WhatsApp..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
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
                  Salvar Tutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
