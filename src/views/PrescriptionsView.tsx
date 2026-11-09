import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Trash2,
  X,
  Stethoscope,
  Dog,
  User,
  Calendar,
  Building2,
  Download
} from 'lucide-react';
import { Prescription, PrescriptionItem, Animal, Tutor, Veterinarian, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { formatDate, calculateAge } from '../utils/formatters';

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  userRole: UserRole;
  currentVetId: string;
  initialSelectedPrescription?: Prescription | null;
  initialOpenNew?: boolean;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  animals,
  tutors,
  vets,
  userRole,
  currentVetId,
  initialSelectedPrescription = null,
  initialOpenNew = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(initialOpenNew);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(
    initialSelectedPrescription
  );

  const config = StorageService.getConfig();

  // New Prescription Form State
  const [formAnimalId, setFormAnimalId] = useState(animals[0]?.id || '');
  const [formVetId, setFormVetId] = useState(currentVetId || vets[0]?.id || '');
  const [formItems, setFormItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medication: '',
      dosage: '',
      route: 'Oral',
      frequency: 'A cada 12 horas',
      duration: 'Por 7 dias',
      instructions: ''
    }
  ]);
  const [formSpecialInstructions, setFormSpecialInstructions] = useState('');

  const getAnimal = (id: string) => animals.find(a => a.id === id);
  const getTutor = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getVet = (id: string) => vets.find(v => v.id === id);

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `item-${Date.now()}`,
        medication: '',
        dosage: '',
        route: 'Oral',
        frequency: 'A cada 24 horas',
        duration: 'Por 5 dias',
        instructions: ''
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PrescriptionItem, val: string) => {
    setFormItems(
      formItems.map(item => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = formItems.filter(i => i.medication.trim().length > 0);
    if (!formAnimalId || validItems.length === 0) {
      alert('Selecione o animal e preencha ao menos um medicamento.');
      return;
    }

    const newPresc: Prescription = {
      id: `presc-${Date.now()}`,
      animalId: formAnimalId,
      vetId: formVetId,
      date: new Date().toISOString().split('T')[0],
      items: validItems,
      specialInstructions: formSpecialInstructions.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    StorageService.savePrescription(newPresc);
    setIsNewModalOpen(false);
    setViewingPrescription(newPresc); // Immediately preview printable prescription
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const animal = getAnimal(p.animalId);
    const tutor = animal ? getTutor(animal.tutorId) : null;
    const vet = getVet(p.vetId);
    return (
      animal?.name.toLowerCase().includes(q) ||
      tutor?.name.toLowerCase().includes(q) ||
      vet?.name.toLowerCase().includes(q) ||
      p.items.some(i => i.medication.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prescrições & Receituário Clínico (REQ 13)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Emissão, consulta e impressão de receitas veterinárias com posologia completa e carimbo médico.
          </p>
        </div>

        {userRole !== 'recepcionista' && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova Prescrição (REQ 13)</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por paciente, medicamento ou veterinário..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Nenhuma prescrição encontrada.</p>
          </div>
        ) : (
          filteredPrescriptions.map(presc => {
            const animal = getAnimal(presc.animalId);
            const tutor = animal ? getTutor(animal.tutorId) : null;
            const vet = getVet(presc.vetId);

            return (
              <div
                key={presc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{animal?.name}</h2>
                        <span className="text-xs text-slate-500 font-medium">
                          ({animal?.species} · {animal?.breed})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Tutor: <strong className="text-slate-700">{tutor?.name}</strong>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {formatDate(presc.date)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
                    <span className="font-semibold text-slate-700 block">
                      Medicamentos Prescritos ({presc.items.length}):
                    </span>
                    <ul className="space-y-1.5">
                      {presc.items.map((item, idx) => (
                        <li key={item.id} className="p-2 rounded bg-slate-50 border border-slate-100">
                          <strong className="text-slate-900">{idx + 1}. {item.medication}</strong> - {item.dosage}
                          <p className="text-[11px] text-slate-500">
                            {item.route} · {item.frequency} ({item.duration})
                          </p>
                        </li>
                      ))}
                    </ul>

                    {presc.specialInstructions && (
                      <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-100 italic">
                        {presc.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    Vet: <strong className="text-emerald-800">{vet?.name}</strong> ({vet?.crmv})
                  </div>

                  <button
                    onClick={() => setViewingPrescription(presc)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Visualizar & Imprimir (REQ 13)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Emitir Nova Prescrição (REQ 13) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Emitir Nova Prescrição Médica (REQ 13)
                </h3>
                <p className="text-xs text-slate-500">
                  Adicione medicamentos, dosagens, via de administração e orientações.
                </p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Veterinário(a) Prescritor *</label>
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
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Medicamentos e Posologia</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Medicamento</span>
                  </button>
                </div>

                {formItems.map((item, index) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Item #{index + 1}</span>
                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Medicamento *</label>
                        <input
                          type="text"
                          required
                          value={item.medication}
                          onChange={e => handleUpdateItem(item.id, 'medication', e.target.value)}
                          placeholder="Ex: Prednisolona 10mg"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosagem / Qtd</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={e => handleUpdateItem(item.id, 'dosage', e.target.value)}
                          placeholder="1 comprimido"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Via</label>
                        <select
                          value={item.route}
                          onChange={e => handleUpdateItem(item.id, 'route', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        >
                          <option value="Oral">Oral</option>
                          <option value="Tópica">Tópica</option>
                          <option value="Subcutânea">Subcutânea</option>
                          <option value="Intramuscular">Intramuscular</option>
                          <option value="Oftálmica">Oftálmica</option>
                          <option value="Otológica">Otológica</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequência e Duração</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={e => handleUpdateItem(item.id, 'frequency', e.target.value)}
                          placeholder="A cada 24 horas por 7 dias"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Orientações Específicas</label>
                      <input
                        type="text"
                        value={item.instructions || ''}
                        onChange={e => handleUpdateItem(item.id, 'instructions', e.target.value)}
                        placeholder="Administrar junto ao almoço..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recomendações e Cuidados Gerais
                </label>
                <textarea
                  rows={2}
                  value={formSpecialInstructions}
                  onChange={e => setFormSpecialInstructions(e.target.value)}
                  placeholder="Ex: Fornecer água filtrada em abundância. Retornar em 7 dias..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Emitir e Visualizar Prescrição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Official Printable Prescription Preview (REQ 13) */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 printable-card">
            {/* Top Toolbar (hidden on print) */}
            <div className="px-6 py-3 bg-slate-800 text-white flex items-center justify-between no-print">
              <span className="text-xs font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Receituário Médico Veterinário Oficial (Pronto para Impressão)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Prescrição</span>
                </button>

                <button
                  onClick={() => setViewingPrescription(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Body */}
            {(() => {
              const anim = getAnimal(viewingPrescription.animalId);
              const tut = anim ? getTutor(anim.tutorId) : null;
              const doc = getVet(viewingPrescription.vetId) || vets[0];

              return (
                <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white">
                  {/* Clinic Official Header */}
                  <div className="border-b-2 border-slate-800 pb-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                          {config.clinicName}
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">
                          CNPJ: {config.cnpj} · Tel: {config.phone}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {config.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-semibold text-slate-900 block">Responsável Técnica</span>
                      <span className="text-emerald-800 font-medium block">{config.technicalResponsible.name}</span>
                      <span className="font-mono text-slate-600 text-[11px] block">{config.technicalResponsible.crmv}</span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center py-1">
                    <h2 className="text-base font-bold uppercase tracking-widest text-slate-900 border-b border-t border-slate-200 py-1.5">
                      RECEITUÁRIO MÉDICO VETERINÁRIO
                    </h2>
                  </div>

                  {/* Patient Info Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Paciente (Animal):</span>
                      <strong className="text-sm font-bold text-slate-900">{anim?.name}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Espécie / Raça:</span>
                      <span className="font-semibold text-slate-800">{anim?.species} · {anim?.breed}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Idade / Peso:</span>
                      <span className="font-semibold text-slate-800">{anim ? calculateAge(anim.birthDate) : '-'} · {anim?.weightKg} kg</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Tutor Responsável:</span>
                      <span className="font-semibold text-slate-800">{tut?.name}</span>
                    </div>
                  </div>

                  {/* Prescribed Items (The Core Rx) */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Uso Terapêutico / Medicamentos Prescritos
                    </h3>

                    <div className="space-y-4 pl-1">
                      {viewingPrescription.items.map((item, idx) => (
                        <div key={item.id} className="text-xs space-y-1">
                          <div className="flex items-baseline justify-between border-b border-dotted border-slate-300 pb-1">
                            <span className="font-bold text-slate-900 text-sm">
                              {idx + 1}. {item.medication}
                            </span>
                            <span className="font-mono font-semibold text-slate-700">
                              {item.dosage}
                            </span>
                          </div>

                          <div className="text-slate-700 pl-4 text-xs">
                            <p>
                              <strong>Via de Administração:</strong> {item.route}
                            </p>
                            <p>
                              <strong>Posologia & Frequência:</strong> {item.frequency} ({item.duration})
                            </p>
                            {item.instructions && (
                              <p className="text-slate-600 italic mt-0.5">
                                Recomendações: {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special instructions */}
                  {viewingPrescription.specialInstructions && (
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                      <strong className="block text-slate-800 font-semibold mb-1">
                        Orientações e Cuidados Gerais:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">
                        {viewingPrescription.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Signature and Stamp Zone */}
                  <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Data da Prescrição:</span>
                      <strong className="font-mono text-slate-800">{formatDate(viewingPrescription.date)}</strong>
                    </div>

                    <div className="text-center sm:text-right border-t border-slate-400 pt-2 min-w-[240px]">
                      <div className="font-bold text-slate-900">{doc?.name}</div>
                      <div className="font-mono text-emerald-800 text-[11px] font-semibold">{doc?.crmv}</div>
                      <div className="text-[10px] text-slate-400">Médico(a) Veterinário(a)</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
