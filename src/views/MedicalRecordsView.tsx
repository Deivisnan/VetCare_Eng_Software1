import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Calendar,
  Thermometer,
  Activity,
  Heart,
  Syringe,
  FileText,
  User,
  Dog,
  Printer,
  PlusCircle,
  Clock,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import {
  Animal,
  Tutor,
  ClinicalRecord,
  VaccinationRecord,
  Prescription,
  Veterinarian,
  UserRole
} from '../types';
import { formatDate, calculateAge } from '../utils/formatters';

interface MedicalRecordsViewProps {
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  records: ClinicalRecord[];
  vaccinations: VaccinationRecord[];
  prescriptions: Prescription[];
  userRole: UserRole;
  initialAnimalId?: string;
  onStartNewAttendanceForAnimal: (animal: Animal) => void;
  onViewPrescriptionModal: (prescription: Prescription) => void;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  animals,
  tutors,
  vets,
  records,
  vaccinations,
  prescriptions,
  userRole,
  initialAnimalId,
  onStartNewAttendanceForAnimal,
  onViewPrescriptionModal
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    initialAnimalId || animals[0]?.id || ''
  );
  const [filterType, setFilterType] = useState<'all' | 'consultations' | 'vaccines' | 'prescriptions'>('all');
  const [searchAnimalQuery, setSearchAnimalQuery] = useState('');

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
  const selectedTutor = selectedAnimal ? tutors.find(t => t.id === selectedAnimal.tutorId) : null;

  // Records for this animal
  const animalRecords = records.filter(r => r.animalId === selectedAnimalId);
  const animalVaccines = vaccinations.filter(v => v.animalId === selectedAnimalId);
  const animalPrescriptions = prescriptions.filter(p => p.animalId === selectedAnimalId);

  const getVet = (id: string) => vets.find(v => v.id === id);

  // Filtered animal list for sidebar picker
  const filteredAnimalsList = animals.filter(a => {
    if (!searchAnimalQuery.trim()) return true;
    const q = searchAnimalQuery.toLowerCase();
    const tutor = tutors.find(t => t.id === a.tutorId);
    return (
      a.name.toLowerCase().includes(q) ||
      a.species.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q) ||
      tutor?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prontuário Clínico Eletrônico (REQ 11)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Histórico integrado de atendimentos, diagnósticos, procedimentos, vacinas e prescrições.
          </p>
        </div>

        {selectedAnimal && userRole !== 'recepcionista' && (
          <button
            onClick={() => onStartNewAttendanceForAnimal(selectedAnimal)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Atendimento Clínico</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left column patient picker, Right column full timeline record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Selection Column (3 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar paciente ou tutor..."
              value={searchAnimalQuery}
              onChange={e => setSearchAnimalQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredAnimalsList.map(animal => {
              const tutor = tutors.find(t => t.id === animal.tutorId);
              const isSelected = animal.id === selectedAnimalId;

              return (
                <button
                  key={animal.id}
                  onClick={() => setSelectedAnimalId(animal.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Dog className="w-5 h-5" />
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{animal.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {calculateAge(animal.birthDate)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {animal.species} · {animal.breed}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Tutor: {tutor?.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Medical Record Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedAnimal ? (
            <>
              {/* Patient Dossier Header */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedAnimal.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {selectedAnimal.species} ({selectedAnimal.breed})
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {selectedAnimal.sex}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Tutor: <strong className="text-slate-700">{selectedTutor?.name}</strong> · Contato: {selectedTutor?.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="self-start sm:self-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Prontuário</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nascimento / Idade</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(selectedAnimal.birthDate)} ({calculateAge(selectedAnimal.birthDate)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Peso Atual</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedAnimal.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Castrado</span>
                    <span className="font-semibold text-slate-800">{selectedAnimal.isNeutered ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Microchip</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedAnimal.microchip || 'Não possui'}</span>
                  </div>
                </div>

                {selectedAnimal.allergies && (
                  <div className="p-2 rounded bg-rose-50 border border-rose-100 text-xs text-rose-800">
                    <strong>Atenção / Alergias conhecidas:</strong> {selectedAnimal.allergies}
                  </div>
                )}
              </div>

              {/* Filter Tabs for Timeline (DO: Segmented button controls) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Histórico Completo ({animalRecords.length + animalVaccines.length + animalPrescriptions.length})
                </button>
                <button
                  onClick={() => setFilterType('consultations')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'consultations' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atendimentos ({animalRecords.length})
                </button>
                <button
                  onClick={() => setFilterType('vaccines')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'vaccines' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vacinas ({animalVaccines.length})
                </button>
                <button
                  onClick={() => setFilterType('prescriptions')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'prescriptions' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Prescrições ({animalPrescriptions.length})
                </button>
              </div>

              {/* Timeline Container */}
              <div className="space-y-4">
                {/* 1. Clinical Records */}
                {(filterType === 'all' || filterType === 'consultations') &&
                  animalRecords.map(rec => {
                    const vet = getVet(rec.vetId);
                    return (
                      <div key={rec.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">Atendimento Clínico</h3>
                              <p className="text-[11px] text-slate-400 font-mono">{rec.date}</p>
                            </div>
                          </div>

                          <div className="text-right text-xs">
                            <span className="font-semibold text-slate-800">{vet?.name}</span>
                            <span className="block text-[11px] font-mono text-emerald-700">{vet?.crmv}</span>
                          </div>
                        </div>

                        {/* Queixa & Anamnese */}
                        <div className="text-xs space-y-1.5">
                          <p>
                            <strong className="text-slate-700">Queixa Principal:</strong> {rec.chiefComplaint}
                          </p>
                          {rec.anamnesis && (
                            <p>
                              <strong className="text-slate-700">Anamnese:</strong> {rec.anamnesis}
                            </p>
                          )}
                        </div>

                        {/* Parâmetros Vitais Aferidos */}
                        {rec.physicalExam && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Parâmetros Vitais do Exame Físico:
                            </span>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-700">
                              {rec.physicalExam.temperatureC && <span>Temp: {rec.physicalExam.temperatureC}°C</span>}
                              {rec.physicalExam.weightKg && <span>Peso: {rec.physicalExam.weightKg} kg</span>}
                              {rec.physicalExam.heartRateBpm && <span>FC: {rec.physicalExam.heartRateBpm} bpm</span>}
                              {rec.physicalExam.respiratoryRateRpm && <span>FR: {rec.physicalExam.respiratoryRateRpm} rpm</span>}
                              {rec.physicalExam.mucosa && <span className="font-sans">Mucosas: {rec.physicalExam.mucosa}</span>}
                              {rec.physicalExam.hydration && <span className="font-sans">Hidratação: {rec.physicalExam.hydration}</span>}
                            </div>
                            {rec.physicalExam.notes && (
                              <p className="mt-1 text-xs text-slate-600 font-sans">
                                <em>{rec.physicalExam.notes}</em>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Diagnóstico & Procedimentos */}
                        <div className="text-xs space-y-1.5">
                          <div className="p-2 rounded bg-emerald-50/60 border border-emerald-100">
                            <strong className="text-emerald-900">Diagnóstico Clínico:</strong>{' '}
                            <span className="text-slate-800">{rec.diagnosis}</span>
                          </div>

                          {rec.proceduresDone && rec.proceduresDone.length > 0 && (
                            <div>
                              <strong className="text-slate-700">Procedimentos Realizados:</strong>
                              <ul className="list-disc list-inside text-slate-600 ml-1 mt-0.5">
                                {rec.proceduresDone.map((proc, i) => (
                                  <li key={i}>{proc}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {rec.clinicalConduct && (
                            <p>
                              <strong className="text-slate-700">Conduta Clínica:</strong> {rec.clinicalConduct}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* 2. Vaccinations in Timeline */}
                {(filterType === 'all' || filterType === 'vaccines') &&
                  animalVaccines.map(vac => (
                    <div key={vac.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Syringe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{vac.vaccineName}</span>
                          <span className="text-slate-500">
                            Lote: <strong className="font-mono">{vac.batchNumber}</strong> · Aplicada em: {formatDate(vac.applicationDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Previsão Próxima Dose:</span>
                        <span className="font-bold font-mono text-emerald-800 text-sm">
                          {formatDate(vac.nextDoseDate)}
                        </span>
                      </div>
                    </div>
                  ))}

                {/* 3. Prescriptions in Timeline */}
                {(filterType === 'all' || filterType === 'prescriptions') &&
                  animalPrescriptions.map(presc => (
                    <div key={presc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900">Receita / Prescrição Emitida</span>
                          <span className="text-slate-400 font-mono text-[11px]">({formatDate(presc.date)})</span>
                        </div>
                        <button
                          onClick={() => onViewPrescriptionModal(presc)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ver & Imprimir</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {presc.items.map((item, idx) => (
                          <div key={item.id} className="p-2 rounded bg-slate-50 flex items-start justify-between">
                            <div>
                              <strong className="text-slate-900">{idx + 1}. {item.medication}</strong> - {item.dosage}
                              <p className="text-[11px] text-slate-500">Via: {item.route} · Posologia: {item.frequency} ({item.duration})</p>
                              {item.instructions && <p className="text-[11px] text-slate-600 italic">{item.instructions}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {/* Empty State */}
                {animalRecords.length === 0 && animalVaccines.length === 0 && animalPrescriptions.length === 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">Prontuário sem registros anteriores.</p>
                    <p className="mt-1">Inicie o primeiro atendimento deste paciente para abrir o histórico clínico.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              Selecione um animal na lista para visualizar o prontuário.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
