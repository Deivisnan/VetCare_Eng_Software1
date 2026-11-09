import React, { useState } from 'react';
import {
  Syringe,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  X,
  Dog,
  Clock,
  Filter
} from 'lucide-react';
import { VaccinationRecord, Animal, Tutor, Veterinarian, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { formatDate, getVaccineStatusInfo } from '../utils/formatters';

interface VaccinationsViewProps {
  vaccinations: VaccinationRecord[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  userRole: UserRole;
  onNavigateToNotifications: (params: { tutorId: string; animalId: string; vaccineName: string; dueDate: string }) => void;
  initialOpenNew?: boolean;
}

export const VaccinationsView: React.FC<VaccinationsViewProps> = ({
  vaccinations,
  animals,
  tutors,
  vets,
  userRole,
  onNavigateToNotifications,
  initialOpenNew = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'upcoming' | 'uptodate'>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNew);

  // New Vaccine Form (REQ 12)
  const [formAnimalId, setFormAnimalId] = useState(animals[0]?.id || '');
  const [formVaccineName, setFormVaccineName] = useState('V10 Polivalente Canina');
  const [formBatchNumber, setFormBatchNumber] = useState('LOTE-');
  const [formManufacturer, setFormManufacturer] = useState('Zoetis');
  const [formAppDate, setFormAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNextDoseDate, setFormNextDoseDate] = useState(() => {
    const next = new Date();
    next.setFullYear(next.getFullYear() + 1);
    return next.toISOString().split('T')[0];
  });
  const [formVetId, setFormVetId] = useState(vets[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');

  const getAnimal = (id: string) => animals.find(a => a.id === id);
  const getTutor = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getVet = (id: string) => vets.find(v => v.id === id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAnimalId || !formVaccineName.trim() || !formNextDoseDate) {
      alert('Animal, nome da vacina e data da próxima dose são obrigatórios.');
      return;
    }

    const newVac: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      animalId: formAnimalId,
      vaccineName: formVaccineName.trim(),
      batchNumber: formBatchNumber.trim() || 'S/L',
      manufacturer: formManufacturer.trim() || undefined,
      applicationDate: formAppDate,
      nextDoseDate: formNextDoseDate,
      vetId: formVetId,
      status: 'Aplicada',
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    StorageService.saveVaccination(newVac);
    setIsModalOpen(false);
  };

  const filteredVaccinations = vaccinations.filter(vac => {
    const statusInfo = getVaccineStatusInfo(vac.nextDoseDate);
    if (statusFilter === 'overdue' && statusInfo.label !== 'Atrasada') return false;
    if (statusFilter === 'upcoming' && statusInfo.label !== 'Vence em breve') return false;
    if (statusFilter === 'uptodate' && statusInfo.label !== 'Em dia') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const animal = getAnimal(vac.animalId);
      const tutor = animal ? getTutor(animal.tutorId) : null;
      return (
        vac.vaccineName.toLowerCase().includes(q) ||
        vac.batchNumber.toLowerCase().includes(q) ||
        animal?.name.toLowerCase().includes(q) ||
        tutor?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Controle de Vacinação (REQ 12)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro das vacinas aplicadas, lotes, data da aplicação e previsão da próxima dose de reforço.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Vacinação (REQ 12)</span>
        </button>
      </div>

      {/* Filter and Status Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Control (DO: functional button tabs) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({vaccinations.length})
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'overdue' ? 'bg-white text-rose-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atrasadas
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'upcoming' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vencendo em Breve
            </button>
            <button
              onClick={() => setStatusFilter('uptodate')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'uptodate' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Em Dia
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por vacina, pet ou tutor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card List (smartphones) */}
      <div className="md:hidden space-y-3">
        {filteredVaccinations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Nenhum registro vacinal encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredVaccinations.map(vac => {
            const animal = getAnimal(vac.animalId);
            const tutor = animal ? getTutor(animal.tutorId) : null;
            const statusInfo = getVaccineStatusInfo(vac.nextDoseDate);

            return (
              <div
                key={vac.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-base text-slate-900 block">
                      {animal?.name} ({animal?.species})
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Tutor: {tutor?.name}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.colorClass}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="font-semibold text-slate-800 text-sm">{vac.vaccineName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Lote: {vac.batchNumber} {vac.manufacturer ? `· ${vac.manufacturer}` : ''}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">Dose aplicada: <strong>{formatDate(vac.applicationDate)}</strong></span>
                    <span className="text-slate-700">Previsão: <strong className="text-emerald-800 font-mono font-bold">{formatDate(vac.nextDoseDate)}</strong></span>
                  </div>
                </div>

                {tutor && animal && (
                  <button
                    onClick={() => onNavigateToNotifications({
                      tutorId: tutor.id,
                      animalId: animal.id,
                      vaccineName: vac.vaccineName,
                      dueDate: vac.nextDoseDate
                    })}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Notificar Tutor no WhatsApp (REQ 16)</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Vaccinations Table */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Paciente (Animal)</th>
                <th className="py-3 px-4">Tutor</th>
                <th className="py-3 px-4">Vacina & Lote</th>
                <th className="py-3 px-4">Data Aplicação</th>
                <th className="py-3 px-4">Previsão Próxima Dose</th>
                <th className="py-3 px-4">Status da Imunização</th>
                <th className="py-3 px-4 text-right">Ação Preventiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVaccinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhum registro vacinal encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredVaccinations.map(vac => {
                  const animal = getAnimal(vac.animalId);
                  const tutor = animal ? getTutor(animal.tutorId) : null;
                  const vet = getVet(vac.vetId);
                  const statusInfo = getVaccineStatusInfo(vac.nextDoseDate);

                  return (
                    <tr key={vac.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{animal?.name}</div>
                        <div className="text-[11px] text-slate-500">{animal?.species} · {animal?.breed}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{tutor?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{tutor?.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{vac.vaccineName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Lote: {vac.batchNumber} {vac.manufacturer ? `· ${vac.manufacturer}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                        {formatDate(vac.applicationDate)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {formatDate(vac.nextDoseDate)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusInfo.colorClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {tutor && animal && (
                          <button
                            onClick={() => onNavigateToNotifications({
                              tutorId: tutor.id,
                              animalId: animal.id,
                              vaccineName: vac.vaccineName,
                              dueDate: vac.nextDoseDate
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold text-xs transition-colors"
                            title="Notificar tutor sobre o reforço (REQ 16)"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Notificar Tutor (REQ 16)</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Vacinação (REQ 12) - Mobile Bottom Sheet on smartphone, Centered dialog on desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Aplicação de Vacina (REQ 12)
                </h3>
                <p className="text-xs text-slate-500">
                  Cadastre o tipo, lote, data da dose e previsão da próxima dose de reforço.
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

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paciente (Animal) *</label>
                <select
                  required
                  value={formAnimalId}
                  onChange={e => setFormAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {animals.map(a => {
                    const t = getTutor(a.tutorId);
                    return (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.species} · Tutor: {t?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome / Tipo da Vacina *</label>
                <input
                  type="text"
                  required
                  value={formVaccineName}
                  onChange={e => setFormVaccineName(e.target.value)}
                  placeholder="Ex: V10 Polivalente Canina"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nº do Lote</label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={e => setFormBatchNumber(e.target.value)}
                    placeholder="LOTE-9921"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratório Fabricante</label>
                  <input
                    type="text"
                    value={formManufacturer}
                    onChange={e => setFormManufacturer(e.target.value)}
                    placeholder="Ex: Zoetis / MSD"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data da Aplicação *</label>
                  <input
                    type="date"
                    required
                    value={formAppDate}
                    onChange={e => setFormAppDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previsão Próxima Dose *</label>
                  <input
                    type="date"
                    required
                    value={formNextDoseDate}
                    onChange={e => setFormNextDoseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Veterinário Aplicador *</label>
                <select
                  value={formVetId}
                  onChange={e => setFormVetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {vets.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.crmv})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações ou Reações</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ex: Sem intercorrências, orientada compressa morna em caso de desconforto local."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                  Salvar Vacina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
