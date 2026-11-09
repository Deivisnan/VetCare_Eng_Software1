import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import {
  Appointment,
  Animal,
  Tutor,
  Veterinarian,
  AppointmentType,
  AppointmentStatus,
  UserRole
} from '../types';
import { StorageService } from '../services/storage';
import { formatDate, formatCurrency } from '../utils/formatters';

interface AgendaViewProps {
  appointments: Appointment[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  userRole: UserRole;
  onStartAttendance: (appointment: Appointment) => void;
  onNavigateToRecords: (animalId: string) => void;
  initialOpenNew?: boolean;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  animals,
  tutors,
  vets,
  userRole,
  onStartAttendance,
  onNavigateToRecords,
  initialOpenNew = false
}) => {
  // Filters & State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'profissional'>('dia');
  const [selectedVetId, setSelectedVetId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(initialOpenNew);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // New Appointment Form
  const [formTutorId, setFormTutorId] = useState('');
  const [formAnimalId, setFormAnimalId] = useState('');
  const [formVetId, setFormVetId] = useState(vets[0]?.id || '');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('09:00');
  const [formDuration, setFormDuration] = useState(45);
  const [formType, setFormType] = useState<AppointmentType>('Rotina');
  const [formReason, setFormReason] = useState('');
  const [formCost, setFormCost] = useState(150);

  // Available animals for selected tutor
  const tutorAnimals = animals.filter(a => a.tutorId === formTutorId);

  // Calculate current week days for 'semana' mode
  const currentWeekDays = React.useMemo(() => {
    const base = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = base.getDay(); // 0 is Sunday
    // Start on Monday
    const diff = base.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(base.setDate(diff));

    const week: string[] = [];
    for (let i = 0; i < 6; i++) { // Mon to Sat
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  }, [selectedDate]);

  // Filtering appointments
  const filteredAppointments = appointments.filter(apt => {
    // Vet filter
    if (selectedVetId !== 'all' && apt.vetId !== selectedVetId) return false;
    // Status filter
    if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;

    // View mode date filtering
    if (viewMode === 'dia') {
      if (apt.date !== selectedDate) return false;
    } else if (viewMode === 'semana') {
      if (!currentWeekDays.includes(apt.date)) return false;
    }

    // Search query (tutor name, animal name, reason)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const animal = animals.find(a => a.id === apt.animalId);
      const tutor = tutors.find(t => t.id === apt.tutorId);
      const vet = vets.find(v => v.id === apt.vetId);
      const match =
        animal?.name.toLowerCase().includes(q) ||
        tutor?.name.toLowerCase().includes(q) ||
        vet?.name.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const getTutor = (id: string) => tutors.find(t => t.id === id);
  const getAnimal = (id: string) => animals.find(a => a.id === id);
  const getVet = (id: string) => vets.find(v => v.id === id);

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }
    const current = new Date(selectedDate + 'T00:00:00');
    const step = viewMode === 'semana' ? 7 : 1;
    current.setDate(current.getDate() + (direction === 'next' ? step : -step));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTutorId || !formAnimalId || !formVetId || !formDate || !formTime) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      tutorId: formTutorId,
      animalId: formAnimalId,
      vetId: formVetId,
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration),
      type: formType,
      status: 'Agendada',
      reason: formReason || 'Consulta de Rotina',
      cost: Number(formCost),
      createdAt: new Date().toISOString()
    };

    StorageService.saveAppointment(newApt);
    setIsNewModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormTutorId('');
    setFormAnimalId('');
    setFormReason('');
    setFormCost(150);
  };

  const handleOpenCancel = (apt: Appointment) => {
    setAppointmentToCancel(apt);
    setCancellationReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!appointmentToCancel) return;
    if (!cancellationReason.trim()) {
      alert('Informe o motivo do cancelamento.');
      return;
    }

    StorageService.cancelAppointment(appointmentToCancel.id, cancellationReason);
    setIsCancelModalOpen(false);
    setAppointmentToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Agenda de Consultas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualização e gestão de consultas veterinárias por dia, semana ou profissional.
          </p>
        </div>

        <button
          onClick={() => {
            setFormDate(selectedDate);
            setIsNewModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Consulta (REQ 07)</span>
        </button>
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View mode segmented control (functional button tabs with large touch target) */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold w-full md:w-auto">
            <button
              onClick={() => setViewMode('dia')}
              className={`py-2 px-2 sm:px-3.5 rounded-lg transition-all text-center min-h-[40px] ${
                viewMode === 'dia' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`py-2 px-2 sm:px-3.5 rounded-lg transition-all text-center min-h-[40px] ${
                viewMode === 'semana' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('profissional')}
              className={`py-2 px-2 sm:px-3.5 rounded-lg transition-all text-center min-h-[40px] ${
                viewMode === 'profissional' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Profissional
            </button>
          </div>

          {/* Date navigator with large touch targets */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
            <button
              onClick={() => handleDateChange('prev')}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Anterior"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl font-mono text-slate-800 bg-white min-h-[44px]"
            />

            <button
              onClick={() => handleDateChange('next')}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Próximo"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleDateChange('today')}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl min-h-[44px]"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por animal, tutor ou motivo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Vet select */}
          <div>
            <select
              value={selectedVetId}
              onChange={e => setSelectedVetId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos os Veterinários</option>
              {vets.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.crmv})</option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Agendada">Agendada</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Agenda View Display */}
      {viewMode === 'semana' ? (
        /* Weekly View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              {currentWeekDays.map(dateStr => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const weekDayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                const isSelected = dateStr === selectedDate;
                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 text-center cursor-pointer border-r border-slate-200 last:border-r-0 ${
                      isSelected ? 'bg-emerald-50 text-emerald-900 font-bold border-b-2 border-b-emerald-600' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="capitalize block">{weekDayName}</span>
                    <span className="font-mono text-slate-500 text-[11px] block">{formatDate(dateStr)}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-6 divide-x divide-slate-200 min-h-[400px] text-xs">
              {currentWeekDays.map(dateStr => {
                const dayApts = appointments.filter(a => a.date === dateStr);
                return (
                  <div key={dateStr} className="p-2 space-y-2 bg-slate-50/30">
                    {dayApts.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-[11px]">
                        Sem consultas
                      </div>
                    ) : (
                      dayApts.map(apt => {
                        const animal = getAnimal(apt.animalId);
                        const vet = getVet(apt.vetId);
                        return (
                          <div
                            key={apt.id}
                            className={`p-2 rounded-lg border text-left transition-shadow shadow-2xs ${
                              apt.status === 'Concluída'
                                ? 'bg-slate-50 border-slate-200'
                                : apt.status === 'Cancelada'
                                ? 'bg-rose-50/50 border-rose-200 opacity-60'
                                : 'bg-white border-emerald-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900">{apt.time}</span>
                              <span className="text-[10px] text-slate-500">{apt.type}</span>
                            </div>
                            <div className="font-semibold text-slate-800 truncate mt-1">
                              {animal?.name} ({animal?.species})
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              Vet: {vet?.name.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Day or Professional List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'consulta encontrada' : 'consultas encontradas'} para {formatDate(selectedDate)}
            </span>
            <span className="text-xs text-slate-400">
              Horário de funcionamento: 08:00 às 19:00
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">Nenhum agendamento encontrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Não há consultas cadastradas com os filtros atuais para esta data.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Agendar para este dia
                </button>
              </div>
            ) : (
              filteredAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => {
                  const animal = getAnimal(apt.animalId);
                  const tutor = getTutor(apt.tutorId);
                  const vet = getVet(apt.vetId);

                  return (
                    <div
                      key={apt.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Left: Time and Patient Info */}
                      <div className="flex items-start gap-4">
                        <div className="text-center w-16 shrink-0 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block font-mono text-base font-bold text-slate-900 tabular-nums">
                            {apt.time}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-medium">
                            {apt.durationMinutes} min
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-slate-900">
                              {animal?.name || 'Animal'}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({animal?.species} · {animal?.breed})
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              apt.status === 'Concluída'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'Em Atendimento'
                                ? 'bg-amber-100 text-amber-800'
                                : apt.status === 'Cancelada'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}>
                              {apt.status}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {apt.type}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Tutor: <strong>{tutor?.name}</strong> ({tutor?.phone})</span>
                            <span>·</span>
                            <span>Veterinário(a): <strong className="text-emerald-800">{vet?.name}</strong></span>
                            <span>·</span>
                            <span>Valor: <strong className="font-mono text-slate-900">{formatCurrency(apt.cost)}</strong></span>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-700 bg-slate-50/80 p-1.5 rounded border border-slate-100">
                            <strong>Motivo/Queixa:</strong> {apt.reason}
                          </p>

                          {apt.status === 'Cancelada' && apt.cancellationReason && (
                            <p className="mt-1 text-xs text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-100">
                              <strong>Justificativa de Cancelamento (REQ 08):</strong> {apt.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch sm:self-end md:self-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Attendance Action (REQ 10) */}
                        {userRole !== 'recepcionista' && apt.status !== 'Concluída' && apt.status !== 'Cancelada' && (
                          <button
                            onClick={() => onStartAttendance(apt)}
                            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs min-h-[44px]"
                          >
                            <Stethoscope className="w-4 h-4" />
                            <span>{apt.status === 'Em Atendimento' ? 'Continuar Atendimento' : 'Iniciar Atendimento'}</span>
                          </button>
                        )}

                        {/* Medical Record Shortcut */}
                        <button
                          onClick={() => onNavigateToRecords(apt.animalId)}
                          className="px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors font-bold min-h-[44px] flex items-center justify-center"
                        >
                          Prontuário
                        </button>

                        {/* Cancel Appointment Button (REQ 08) */}
                        {apt.status !== 'Concluída' && apt.status !== 'Cancelada' && (
                          <button
                            onClick={() => handleOpenCancel(apt)}
                            className="px-3.5 py-2.5 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors font-bold min-h-[44px] flex items-center justify-center"
                            title="Cancelar consulta agendada"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Modal: Agendar Consulta (REQ 07) - Mobile Bottom Sheet on smartphone, Centered dialog on desktop */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Agendar Consulta (REQ 07)</h3>
                <p className="text-xs text-slate-500">Relacione tutor, animal, veterinário, data e horário.</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                aria-label="Fechar"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tutor Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tutor Responsável *
                </label>
                <select
                  required
                  value={formTutorId}
                  onChange={e => {
                    setFormTutorId(e.target.value);
                    setFormAnimalId(''); // Reset animal on tutor change
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="">Selecione o tutor...</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (CPF: {t.cpf})</option>
                  ))}
                </select>
              </div>

              {/* Animal Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Animal / Paciente *
                </label>
                <select
                  required
                  disabled={!formTutorId}
                  value={formAnimalId}
                  onChange={e => setFormAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 disabled:bg-slate-100"
                >
                  <option value="">
                    {!formTutorId ? 'Primeiro selecione o tutor acima' : 'Selecione o animal...'}
                  </option>
                  {tutorAnimals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.species} · {a.breed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Veterinarian Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Profissional Veterinário *
                </label>
                <select
                  required
                  value={formVetId}
                  onChange={e => setFormVetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                >
                  {vets.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} - {v.crmv} ({v.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date, Time and Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    min={15}
                    step={15}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Type and Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Atendimento</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as AppointmentType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value="Rotina">Rotina</option>
                    <option value="Retorno">Retorno</option>
                    <option value="Emergência">Emergência</option>
                    <option value="Especialista">Especialista</option>
                    <option value="Cirurgia">Cirurgia</option>
                    <option value="Vacinação">Vacinação</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Previsto (R$)</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={e => setFormCost(Number(e.target.value))}
                    min={0}
                    step={10}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Reason / Observations */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo / Queixa Inicial</label>
                <textarea
                  rows={3}
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="Ex: Animal apresentando vômito e perda de apetite há 2 dias..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancelar Consulta com Justificativa (REQ 08) */}
      {isCancelModalOpen && appointmentToCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Cancelar Consulta (REQ 08)</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Você está cancelando a consulta de <strong>{getAnimal(appointmentToCancel.animalId)?.name}</strong> marcada para <strong>{formatDate(appointmentToCancel.date)} às {appointmentToCancel.time}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Justificativa do cancelamento (obrigatório) *
              </label>
              <textarea
                required
                rows={3}
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                placeholder="Ex: Tutor solicitou reagendamento devido a imprevisto pessoal..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setAppointmentToCancel(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
