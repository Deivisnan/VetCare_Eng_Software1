import React, { useState } from 'react';
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Syringe,
  FileText,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Printer,
  Calendar,
  User,
  Dog,
  AlertCircle
} from 'lucide-react';
import {
  Appointment,
  Animal,
  Tutor,
  Veterinarian,
  ClinicalRecord,
  VaccinationRecord,
  Prescription,
  PrescriptionItem
} from '../types';
import { StorageService } from '../services/storage';
import { formatDate, calculateAge } from '../utils/formatters';

interface AttendanceViewProps {
  currentAppointment?: Appointment;
  appointments: Appointment[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  currentVetId: string;
  onFinishAttendance: () => void;
  onSelectAppointmentToAttend: (apt: Appointment) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentAppointment,
  appointments,
  animals,
  tutors,
  vets,
  currentVetId,
  onFinishAttendance,
  onSelectAppointmentToAttend
}) => {
  // If no appointment is currently selected, show the attendance queue
  const pendingAppointments = appointments.filter(
    a => a.status === 'Agendada' || a.status === 'Em Atendimento'
  );

  const activeAnimal = currentAppointment
    ? animals.find(a => a.id === currentAppointment.animalId)
    : null;
  const activeTutor = activeAnimal
    ? tutors.find(t => t.id === activeAnimal.tutorId)
    : null;
  const activeVet = vets.find(v => v.id === (currentAppointment?.vetId || currentVetId)) || vets[0];

  // Clinical Attendance Form State (REQ 10)
  const [chiefComplaint, setChiefComplaint] = useState(currentAppointment?.reason || '');
  const [anamnesis, setAnamnesis] = useState('');
  
  // Physical Exam
  const [temperatureC, setTemperatureC] = useState<string>('38.5');
  const [weightKg, setWeightKg] = useState<string>(activeAnimal ? String(activeAnimal.weightKg) : '10');
  const [heartRateBpm, setHeartRateBpm] = useState<string>('90');
  const [respiratoryRateRpm, setRespiratoryRateRpm] = useState<string>('24');
  const [mucosa, setMucosa] = useState<'Normocoradas' | 'Pálidas' | 'Ictéricas' | 'Cianóticas' | 'Congestas'>('Normocoradas');
  const [hydration, setHydration] = useState<'Normal' | 'Desidratado leve (5%)' | 'Desidratado moderado (7-8%)' | 'Desidratado grave (>10%)'>('Normal');
  const [physicalExamNotes, setPhysicalExamNotes] = useState('');

  // Diagnosis & Conduct
  const [diagnosis, setDiagnosis] = useState('');
  const [proceduresText, setProceduresText] = useState('Consulta clínica geral');
  const [clinicalConduct, setClinicalConduct] = useState('');

  // Integrated Vaccine Form (REQ 12)
  const [includeVaccine, setIncludeVaccine] = useState(false);
  const [vacName, setVacName] = useState('V10 Polivalente Canina');
  const [vacBatch, setVacBatch] = useState('LOTE-2026-');
  const [vacNextDoseDate, setVacNextDoseDate] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  });

  // Integrated Prescription (REQ 13)
  const [includePrescription, setIncludePrescription] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
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
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAddMedication = () => {
    setPrescriptionItems([
      ...prescriptionItems,
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

  const handleRemoveMedication = (id: string) => {
    if (prescriptionItems.length === 1) return;
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const handleUpdateMedication = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptionItems(
      prescriptionItems.map(item => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Submit / Finalize Attendance (REQ 10, REQ 11, REQ 12, REQ 13)
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAnimal) return;
    if (!diagnosis.trim()) {
      alert('Informe o diagnóstico clínico ou hipótese diagnóstica.');
      return;
    }

    const recordId = `rec-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. Save Clinical Record (REQ 10 & REQ 11)
    const newRecord: ClinicalRecord = {
      id: recordId,
      appointmentId: currentAppointment?.id,
      animalId: activeAnimal.id,
      vetId: activeVet.id,
      date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      chiefComplaint,
      anamnesis,
      physicalExam: {
        temperatureC: Number(temperatureC) || undefined,
        weightKg: Number(weightKg) || undefined,
        heartRateBpm: Number(heartRateBpm) || undefined,
        respiratoryRateRpm: Number(respiratoryRateRpm) || undefined,
        mucosa,
        hydration,
        notes: physicalExamNotes
      },
      diagnosis,
      proceduresDone: proceduresText.split('\n').filter(p => p.trim().length > 0),
      clinicalConduct,
      createdAt: nowIso
    };
    StorageService.saveClinicalRecord(newRecord);

    // Update animal weight if updated
    if (Number(weightKg) && Number(weightKg) !== activeAnimal.weightKg) {
      StorageService.saveAnimal({
        ...activeAnimal,
        weightKg: Number(weightKg)
      });
    }

    // 2. Register Vaccine if checked (REQ 12)
    if (includeVaccine && vacName.trim()) {
      const newVac: VaccinationRecord = {
        id: `vac-${Date.now()}`,
        animalId: activeAnimal.id,
        vaccineName: vacName,
        batchNumber: vacBatch || 'S/L',
        applicationDate: new Date().toISOString().split('T')[0],
        nextDoseDate: vacNextDoseDate,
        vetId: activeVet.id,
        status: 'Aplicada',
        notes: `Aplicada durante atendimento clínico (${newRecord.diagnosis})`
      };
      StorageService.saveVaccination(newVac);
    }

    // 3. Issue Prescription if checked (REQ 13)
    const validItems = prescriptionItems.filter(i => i.medication.trim().length > 0);
    if (includePrescription && validItems.length > 0) {
      const newPrescription: Prescription = {
        id: `presc-${Date.now()}`,
        clinicalRecordId: recordId,
        animalId: activeAnimal.id,
        vetId: activeVet.id,
        date: new Date().toISOString().split('T')[0],
        items: validItems,
        specialInstructions,
        createdAt: nowIso
      };
      StorageService.savePrescription(newPrescription);
    }

    // 4. Update appointment to 'Concluída'
    if (currentAppointment) {
      StorageService.saveAppointment({
        ...currentAppointment,
        status: 'Concluída'
      });
    }

    alert('Atendimento clínico e prontuário registrados com sucesso!');
    onFinishAttendance();
  };

  // If no appointment is selected, render queue selector
  if (!currentAppointment || !activeAnimal) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Consultório Veterinário · Atendimento Clínico (REQ 10)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selecione uma consulta agendada na fila de espera para iniciar o atendimento médico.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <span>Fila de Espera / Consultas Agendadas para Atendimento</span>
          </h2>

          {pendingAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Nenhum paciente aguardando atendimento no momento.</p>
              <p className="text-xs text-slate-400 mt-1">Novas consultas podem ser marcadas na aba Agenda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAppointments.map(apt => {
                const anim = animals.find(a => a.id === apt.animalId);
                const tut = tutors.find(t => t.id === apt.tutorId);
                const vet = vets.find(v => v.id === apt.vetId);

                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900">{anim?.name}</span>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {formatDate(apt.date)} às {apt.time}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        <p>Espécie / Raça: <strong className="text-slate-700">{anim?.species} · {anim?.breed}</strong></p>
                        <p>Tutor: <strong className="text-slate-700">{tut?.name}</strong> ({tut?.phone})</p>
                        <p>Veterinário: <strong className="text-emerald-800">{vet?.name}</strong></p>
                        <p className="text-slate-600 mt-1">Queixa: <em>{apt.reason}</em></p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectAppointmentToAttend(apt)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Iniciar Atendimento Clínico</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active attendance session UI
  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
            <Dog className="w-8 h-8 text-emerald-700" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeAnimal.name}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                ({activeAnimal.species} · {activeAnimal.breed} · {activeAnimal.sex})
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                Em Atendimento Clínico (REQ 10)
              </span>
            </div>

            <div className="mt-1.5 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Idade: <strong>{calculateAge(activeAnimal.birthDate)}</strong></span>
              <span>·</span>
              <span>Tutor: <strong>{activeTutor?.name}</strong> ({activeTutor?.phone})</span>
              <span>·</span>
              <span>Veterinário Responsável: <strong className="text-emerald-800">{activeVet.name} ({activeVet.crmv})</strong></span>
              {activeAnimal.allergies && (
                <>
                  <span>·</span>
                  <span className="text-rose-700 font-medium">Alergias: {activeAnimal.allergies}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onFinishAttendance}
          className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg self-start md:self-center"
        >
          Voltar para Fila
        </button>
      </div>

      <form onSubmit={handleSaveAttendance} className="space-y-6">
        {/* Section 1: Anamnese & Queixa */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>1. Anamnese & Histórico da Queixa Principal</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Queixa Principal relatada pelo tutor *
              </label>
              <input
                type="text"
                required
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                placeholder="Ex: Claudicação intermitente na pata direita há 3 dias..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Anamnese Geral (Apetite, Água, Fezes, Urina, Comportamento)
              </label>
              <textarea
                rows={2}
                value={anamnesis}
                onChange={e => setAnamnesis(e.target.value)}
                placeholder="Ex: Animal ativo, alimentação normal, sem vômito ou tosse..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Exame Físico & Parâmetros Vitais */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>2. Exame Físico & Parâmetros Vitais</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temperatura (°C)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={e => setTemperatureC(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400">Normal: 38.0 - 39.2°C</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.01"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Atualiza cadastro</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Freq. Cardíaca (BPM)</label>
              <input
                type="number"
                value={heartRateBpm}
                onChange={e => setHeartRateBpm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Normal: 70 - 140 bpm</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Freq. Resp. (RPM)</label>
              <input
                type="number"
                value={respiratoryRateRpm}
                onChange={e => setRespiratoryRateRpm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Normal: 18 - 34 rpm</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coloração Mucosas</label>
              <select
                value={mucosa}
                onChange={e => setMucosa(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Normocoradas">Normocoradas</option>
                <option value="Pálidas">Pálidas</option>
                <option value="Ictéricas">Ictéricas</option>
                <option value="Cianóticas">Cianóticas</option>
                <option value="Congestas">Congestas</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nível de Hidratação</label>
              <select
                value={hydration}
                onChange={e => setHydration(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Desidratado leve (5%)">Leve (5%)</option>
                <option value="Desidratado moderado (7-8%)">Moderado (7-8%)</option>
                <option value="Desidratado grave (>10%)">Grave (&gt;10%)</option>
              </select>
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Achados do Exame Físico (Ausculta, Palpação abdominal, Linfonodos, Pele)
            </label>
            <textarea
              rows={2}
              value={physicalExamNotes}
              onChange={e => setPhysicalExamNotes(e.target.value)}
              placeholder="Ex: Ausculta pulmonar limpa bilateralmente. Abdômen flácido e indolor à palpação profunda..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Section 3: Diagnóstico, Procedimentos e Conduta */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>3. Diagnóstico Clínico & Conduta Terapêutica (REQ 10, REQ 11)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Diagnóstico Definitivo ou Hipótese Diagnóstica *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Ex: Gastroenterite aguda transitória responsiva a dieta leve"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Procedimentos Realizados (um por linha)
              </label>
              <textarea
                rows={2}
                value={proceduresText}
                onChange={e => setProceduresText(e.target.value)}
                placeholder="Ex: Coleta de sangue para hemograma&#10;Administração de antiemético injetável"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Conduta Clínica e Recomendações ao Tutor
            </label>
            <textarea
              rows={2}
              value={clinicalConduct}
              onChange={e => setClinicalConduct(e.target.value)}
              placeholder="Ex: Repouso domiciliar, fornecer água fresca em pequenas porções fracionadas. Retorno em 7 dias se os sintomas persistirem."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Section 4: Registro de Vacinação Aplicada na Consulta (REQ 12) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">
                Registrar Vacinação Aplicada (REQ 12)
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeVaccine}
                onChange={e => setIncludeVaccine(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Aplicar vacina neste atendimento</span>
            </label>
          </div>

          {includeVaccine && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome/Tipo da Vacina *</label>
                <input
                  type="text"
                  value={vacName}
                  onChange={e => setVacName(e.target.value)}
                  placeholder="Ex: V10 Polivalente Canina"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lote / Fabricante</label>
                <input
                  type="text"
                  value={vacBatch}
                  onChange={e => setVacBatch(e.target.value)}
                  placeholder="Ex: LOTE-8901 - Zoetis"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previsão Próxima Dose (Reforço) *</label>
                <input
                  type="date"
                  value={vacNextDoseDate}
                  onChange={e => setVacNextDoseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Emitir Prescrição Médica (REQ 13) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">
                Emitir Receita & Prescrição Médica (REQ 13)
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includePrescription}
                onChange={e => setIncludePrescription(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Incluir receita de medicamentos</span>
            </label>
          </div>

          {includePrescription && (
            <div className="space-y-4 pt-1">
              <div className="space-y-3">
                {prescriptionItems.map((item, index) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Medicamento #{index + 1}</span>
                      {prescriptionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nome do Medicamento *</label>
                        <input
                          type="text"
                          value={item.medication}
                          onChange={e => handleUpdateMedication(item.id, 'medication', e.target.value)}
                          placeholder="Ex: Amoxicilina + Clavulanato 250mg"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosagem / Qtd</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={e => handleUpdateMedication(item.id, 'dosage', e.target.value)}
                          placeholder="Ex: 1 comprimido"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Via de Adm.</label>
                        <select
                          value={item.route}
                          onChange={e => handleUpdateMedication(item.id, 'route', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Oral">Oral</option>
                          <option value="Tópica">Tópica</option>
                          <option value="Subcutânea">Subcutânea</option>
                          <option value="Intramuscular">Intramuscular</option>
                          <option value="Oftálmica">Oftálmica</option>
                          <option value="Otológica">Otológica</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequência e Duração</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={e => handleUpdateMedication(item.id, 'frequency', e.target.value)}
                          placeholder="Ex: A cada 12 horas por 7 dias"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Instruções Adicionais</label>
                        <input
                          type="text"
                          value={item.instructions || ''}
                          onChange={e => handleUpdateMedication(item.id, 'instructions', e.target.value)}
                          placeholder="Ex: Administrar sempre junto à alimentação"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Outro Medicamento</span>
              </button>

              <div className="text-xs pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Orientações Especiais da Prescrição
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="Ex: Oferecer água fresca à vontade. Manter o animal em repouso nos horários mais quentes."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onFinishAttendance}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar / Sair Sem Salvar
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Finalizar Atendimento & Salvar Prontuário (REQ 10, REQ 11)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
