import React from 'react';
import {
  Calendar,
  Users,
  Dog,
  DollarSign,
  Syringe,
  Clock,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  Phone
} from 'lucide-react';
import {
  Appointment,
  Animal,
  Tutor,
  Payment,
  VaccinationRecord,
  Veterinarian,
  UserRole
} from '../types';
import { formatCurrency, formatDate, getVaccineStatusInfo } from '../utils/formatters';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab, params?: any) => void;
  appointments: Appointment[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  payments: Payment[];
  vaccinations: VaccinationRecord[];
  userRole: UserRole;
  onStartAttendance: (appointment: Appointment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  appointments,
  animals,
  tutors,
  vets,
  payments,
  vaccinations,
  userRole,
  onStartAttendance
}) => {
  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const completedToday = todayAppointments.filter(a => a.status === 'Concluída').length;
  const inProgress = todayAppointments.filter(a => a.status === 'Em Atendimento').length;

  // Monthly revenue
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthPayments = payments.filter(p => p.status === 'Pago' && (p.paidAt || p.createdAt).startsWith(thisMonth));
  const monthTotal = monthPayments.reduce((sum, p) => sum + p.finalAmount, 0);

  // Vaccines attention
  const urgentVaccines = vaccinations
    .filter(v => v.status === 'Atrasada' || v.status === 'Pendente')
    .slice(0, 5);

  const getTutor = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getAnimal = (animalId: string) => animals.find(a => a.id === animalId);
  const getVet = (vetId: string) => vets.find(v => v.id === vetId);

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Painel de Controle Veterinário
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão consolidada das operações clínicas, agendamentos e pacientes do dia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('agenda', { openNew: true })}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
          
          <button
            onClick={() => onNavigate('animals', { openNew: true })}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Dog className="w-4 h-4 text-emerald-600" />
            <span>Cadastrar Animal</span>
          </button>

          {userRole !== 'veterinario' && (
            <button
              onClick={() => onNavigate('financial', { openNew: true })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Receber Pagamento</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Consultas Hoje
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-500">
              ({completedToday} concluídas, {inProgress} em curso)
            </span>
          </div>
          <button
            onClick={() => onNavigate('agenda')}
            className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Ver agenda de hoje</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Animais Cadastrados
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {animals.length}
            </span>
            <span className="text-xs text-slate-500">
              em {tutors.length} tutores
            </span>
          </div>
          <button
            onClick={() => onNavigate('animals')}
            className="mt-3 text-xs font-medium text-sky-700 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Gerenciar pacientes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Vacinas com Atenção
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {urgentVaccines.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              pendentes ou atrasadas
            </span>
          </div>
          <button
            onClick={() => onNavigate('vaccines')}
            className="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Ver calendário vacinal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Faturamento (Mês)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(monthTotal)}
            </span>
          </div>
          <button
            onClick={() => onNavigate('financial')}
            className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Acessar financeiro</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Today's Appointments & Vaccines Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda (Col Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Agenda de Atendimentos de Hoje
              </h2>
              <p className="text-xs text-slate-500">
                {formatDate(todayStr)} · Horários e status em tempo real
              </p>
            </div>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Ver completa
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum agendamento para a data de hoje.</p>
                <button
                  onClick={() => onNavigate('agenda', { openNew: true })}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  + Agendar nova consulta
                </button>
              </div>
            ) : (
              todayAppointments.map(apt => {
                const animal = getAnimal(apt.animalId);
                const tutor = getTutor(apt.tutorId);
                const vet = getVet(apt.vetId);

                return (
                  <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 text-center shrink-0">
                        <span className="block font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {apt.time}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {apt.durationMinutes} min
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">
                            {animal?.name || 'Animal'}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600">
                            {animal?.species} ({animal?.breed})
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            apt.status === 'Concluída' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'Em Atendimento'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : apt.status === 'Cancelada'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                          <span>Tutor: <strong className="font-medium text-slate-700">{tutor?.name}</strong></span>
                          <span>·</span>
                          <span>Vet: <strong className="font-medium text-slate-700">{vet?.name.split(' ')[0]} {vet?.name.split(' ').slice(-1)}</strong></span>
                          <span>·</span>
                          <span className="text-slate-600">{apt.reason}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {userRole !== 'recepcionista' && apt.status !== 'Concluída' && apt.status !== 'Cancelada' && (
                        <button
                          onClick={() => onStartAttendance(apt)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Atender</span>
                        </button>
                      )}

                      <button
                        onClick={() => onNavigate('records', { animalId: apt.animalId })}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title="Ver Prontuário do Animal"
                      >
                        Prontuário
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Vaccines & Booster Alerts (Col Span 1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Controle de Vacinas
                </h2>
              </div>
              <button
                onClick={() => onNavigate('vaccines')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Todas
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Pacientes que necessitam de reforço ou notificação preventiva aos tutores:
            </p>

            <div className="mt-4 space-y-3">
              {urgentVaccines.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  Todas as vacinas registradas estão em dia!
                </div>
              ) : (
                urgentVaccines.map(vac => {
                  const animal = getAnimal(vac.animalId);
                  const tutor = animal ? getTutor(animal.tutorId) : null;
                  const statusInfo = getVaccineStatusInfo(vac.nextDoseDate);

                  return (
                    <div
                      key={vac.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-xs text-slate-900">
                            {animal?.name}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1">
                            ({animal?.species})
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.colorClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 mt-1">
                        {vac.vaccineName}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Previsão: <strong className="font-mono tabular-nums">{formatDate(vac.nextDoseDate)}</strong></span>
                        {tutor && (
                          <button
                            onClick={() => onNavigate('notifications', {
                              tutorId: tutor.id,
                              animalId: animal?.id,
                              vaccineName: vac.vaccineName,
                              dueDate: vac.nextDoseDate
                            })}
                            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Notificar Tutor</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('vaccines', { openNew: true })}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-center"
            >
              + Registrar Nova Aplicação de Vacina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
