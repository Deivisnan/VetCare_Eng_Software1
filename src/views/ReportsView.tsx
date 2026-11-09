import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  Stethoscope,
  Dog,
  Users,
  DollarSign
} from 'lucide-react';
import {
  Appointment,
  Animal,
  Tutor,
  Veterinarian,
  ClinicalRecord,
  Payment,
  VaccinationRecord
} from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface ReportsViewProps {
  appointments: Appointment[];
  animals: Animal[];
  tutors: Tutor[];
  vets: Veterinarian[];
  records: ClinicalRecord[];
  payments: Payment[];
  vaccinations: VaccinationRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  appointments,
  animals,
  tutors,
  vets,
  records,
  payments,
  vaccinations
}) => {
  const [reportType, setReportType] = useState<
    'atendimentos' | 'animais' | 'veterinarios' | 'financeiro'
  >('atendimentos');

  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const getAnimal = (id: string) => animals.find(a => a.id === id);
  const getTutor = (id: string) => tutors.find(t => t.id === id);
  const getVet = (id: string) => vets.find(v => v.id === id);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(
    a => a.date >= startDate && a.date <= endDate
  );

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const d = (p.paidAt || p.createdAt).split('T')[0];
    return d >= startDate && d <= endDate;
  });

  // Export handlers (REQ 17)
  const handleExportCSV = () => {
    if (reportType === 'atendimentos') {
      const headers = ['ID Consulta', 'Data', 'Horario', 'Animal', 'Especie', 'Tutor', 'Veterinario', 'Tipo', 'Status', 'Valor (R$)'];
      const rows = filteredAppointments.map(a => {
        const anim = getAnimal(a.animalId);
        const tut = getTutor(a.tutorId);
        const vet = getVet(a.vetId);
        return [
          a.id,
          a.date,
          a.time,
          anim?.name || '',
          anim?.species || '',
          tut?.name || '',
          vet?.name || '',
          a.type,
          a.status,
          a.cost
        ];
      });
      exportToCSV(`relatorio_atendimentos_${startDate}_${endDate}`, headers, rows);
    } else if (reportType === 'animais') {
      const headers = ['ID Animal', 'Nome', 'Especie', 'Raca', 'Sexo', 'Nascimento', 'Peso (kg)', 'Castrado', 'Tutor', 'Telefone Tutor'];
      const rows = animals.map(a => {
        const tut = getTutor(a.tutorId);
        return [
          a.id,
          a.name,
          a.species,
          a.breed,
          a.sex,
          a.birthDate,
          a.weightKg,
          a.isNeutered ? 'Sim' : 'Nao',
          tut?.name || '',
          tut?.phone || ''
        ];
      });
      exportToCSV(`relatorio_animais_cadastrados`, headers, rows);
    } else if (reportType === 'financeiro') {
      const headers = ['Recibo', 'Data', 'Tutor', 'Descricao', 'Metodo', 'Valor Bruto', 'Desconto', 'Valor Final', 'Status'];
      const rows = filteredPayments.map(p => {
        const tut = getTutor(p.tutorId);
        return [
          p.receiptNumber,
          formatDate(p.paidAt || p.createdAt),
          tut?.name || '',
          p.description,
          p.method,
          p.totalAmount,
          p.discountAmount,
          p.finalAmount,
          p.status
        ];
      });
      exportToCSV(`relatorio_financeiro_${startDate}_${endDate}`, headers, rows);
    } else if (reportType === 'veterinarios') {
      const headers = ['Veterinario', 'CRMV', 'Especialidade', 'Total Consultas', 'Total Concluidas', 'Faturamento Gerado (R$)'];
      const rows = vets.map(v => {
        const vetApts = filteredAppointments.filter(a => a.vetId === v.id);
        const completed = vetApts.filter(a => a.status === 'Concluída').length;
        const revenue = vetApts.reduce((sum, a) => sum + (a.status === 'Concluída' ? a.cost : 0), 0);
        return [
          v.name,
          v.crmv,
          v.specialty,
          vetApts.length,
          completed,
          revenue
        ];
      });
      exportToCSV(`relatorio_produtividade_veterinarios`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Relatórios Gerenciais (REQ 17)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Geração de relatórios consolidados sobre atendimentos, pacientes animais, produtividade e fluxo financeiro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs & Date Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setReportType('atendimentos')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                reportType === 'atendimentos' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consultas & Atendimentos
            </button>

            <button
              onClick={() => setReportType('animais')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                reportType === 'animais' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Animais Cadastrados
            </button>

            <button
              onClick={() => setReportType('veterinarios')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                reportType === 'veterinarios' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Produtividade do Corpo Clínico
            </button>

            <button
              onClick={() => setReportType('financeiro')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                reportType === 'financeiro' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demonstrativo Financeiro
            </button>
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Período:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
            />
          </div>
        </div>
      </div>

      {/* Render Selected Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 printable-card">
        {/* Report Official Header */}
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {reportType === 'atendimentos' && 'Relatório de Atendimentos e Consultas Clínicas'}
              {reportType === 'animais' && 'Censo de Animais e Pacientes Cadastrados'}
              {reportType === 'veterinarios' && 'Relatório de Produtividade dos Médicos Veterinários'}
              {reportType === 'financeiro' && 'Demonstrativo Financeiro de Receitas e Faturamento'}
            </h2>
            <p className="text-xs text-slate-500">
              Período de referência: {formatDate(startDate)} a {formatDate(endDate)} · VetCare Gestão Veterinária
            </p>
          </div>
        </div>

        {/* 1. Atendimentos Report */}
        {reportType === 'atendimentos' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data/Hora</th>
                  <th className="py-2.5 px-3">Paciente Animal</th>
                  <th className="py-2.5 px-3">Tutor Responsável</th>
                  <th className="py-2.5 px-3">Veterinário</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map(a => {
                  const anim = getAnimal(a.animalId);
                  const tut = getTutor(a.tutorId);
                  const vet = getVet(a.vetId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono tabular-nums">{formatDate(a.date)} {a.time}</td>
                      <td className="py-2.5 px-3 font-semibold">{anim?.name} ({anim?.species})</td>
                      <td className="py-2.5 px-3 text-slate-600">{tut?.name}</td>
                      <td className="py-2.5 px-3">{vet?.name}</td>
                      <td className="py-2.5 px-3">{a.type}</td>
                      <td className="py-2.5 px-3">{a.status}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(a.cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Animais Report */}
        {reportType === 'animais' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nome do Animal</th>
                  <th className="py-2.5 px-3">Espécie</th>
                  <th className="py-2.5 px-3">Raça</th>
                  <th className="py-2.5 px-3">Sexo</th>
                  <th className="py-2.5 px-3">Nascimento</th>
                  <th className="py-2.5 px-3">Peso</th>
                  <th className="py-2.5 px-3">Castrado</th>
                  <th className="py-2.5 px-3">Tutor Vinculado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animals.map(a => {
                  const tut = getTutor(a.tutorId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold">{a.name}</td>
                      <td className="py-2.5 px-3">{a.species}</td>
                      <td className="py-2.5 px-3">{a.breed}</td>
                      <td className="py-2.5 px-3">{a.sex}</td>
                      <td className="py-2.5 px-3 font-mono">{formatDate(a.birthDate)}</td>
                      <td className="py-2.5 px-3 font-mono">{a.weightKg} kg</td>
                      <td className="py-2.5 px-3">{a.isNeutered ? 'Sim' : 'Não'}</td>
                      <td className="py-2.5 px-3">{tut?.name} ({tut?.phone})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Veterinários Report */}
        {reportType === 'veterinarios' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Profissional</th>
                  <th className="py-2.5 px-3">CRMV</th>
                  <th className="py-2.5 px-3">Especialidade</th>
                  <th className="py-2.5 px-3 text-center">Consultas Totais</th>
                  <th className="py-2.5 px-3 text-center">Concluídas</th>
                  <th className="py-2.5 px-3 text-right">Faturamento Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vets.map(v => {
                  const vetApts = filteredAppointments.filter(a => a.vetId === v.id);
                  const completed = vetApts.filter(a => a.status === 'Concluída').length;
                  const rev = vetApts.reduce((sum, a) => sum + (a.status === 'Concluída' ? a.cost : 0), 0);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{v.name}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">{v.crmv}</td>
                      <td className="py-2.5 px-3 text-slate-600">{v.specialty}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{vetApts.length}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-bold">{completed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(rev)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Financeiro Report */}
        {reportType === 'financeiro' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Recibo</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tutor</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3 text-right">Valor Bruto</th>
                  <th className="py-2.5 px-3 text-right">Desconto</th>
                  <th className="py-2.5 px-3 text-right">Valor Final</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => {
                  const tut = getTutor(p.tutorId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-semibold">{p.receiptNumber}</td>
                      <td className="py-2.5 px-3 font-mono">{formatDate(p.paidAt || p.createdAt)}</td>
                      <td className="py-2.5 px-3 font-medium">{tut?.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.description}</td>
                      <td className="py-2.5 px-3">{p.method}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(p.totalAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">-{formatCurrency(p.discountAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(p.finalAmount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === 'Pago' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
