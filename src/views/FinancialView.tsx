import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  Search,
  Filter,
  Calendar,
  Printer,
  Dog,
  User,
  ArrowUpRight
} from 'lucide-react';
import { Payment, PaymentMethod, PaymentStatus, Tutor, Animal, Appointment, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface FinancialViewProps {
  payments: Payment[];
  tutors: Tutor[];
  animals: Animal[];
  appointments: Appointment[];
  userRole: UserRole;
  initialOpenNew?: boolean;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  payments,
  tutors,
  animals,
  appointments,
  userRole,
  initialOpenNew = false
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(initialOpenNew);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);

  const config = StorageService.getConfig();

  // New Payment Form (REQ 14)
  const [formTutorId, setFormTutorId] = useState(tutors[0]?.id || '');
  const [formAnimalId, setFormAnimalId] = useState('');
  const [formAppointmentId, setFormAppointmentId] = useState('');
  const [formDescription, setFormDescription] = useState('Consulta Clínica Veterinária');
  const [formTotalAmount, setFormTotalAmount] = useState(180);
  const [formDiscountAmount, setFormDiscountAmount] = useState(0);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('PIX');
  const [formStatus, setFormStatus] = useState<PaymentStatus>('Pago');

  const getTutor = (id: string) => tutors.find(t => t.id === id);
  const getAnimal = (id: string) => animals.find(a => a.id === id);

  // Available animals for selected tutor
  const tutorAnimals = animals.filter(a => a.tutorId === formTutorId);

  // Filter payments by selected period (REQ 15)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthStr = now.toISOString().slice(0, 7);

  const filteredPayments = payments.filter(p => {
    const payDate = p.paidAt ? p.paidAt.split('T')[0] : p.createdAt.split('T')[0];

    if (periodFilter === 'today') {
      if (payDate !== todayStr) return false;
    } else if (periodFilter === 'month') {
      if (!payDate.startsWith(thisMonthStr)) return false;
    } else if (periodFilter === 'week') {
      const pDate = new Date(payDate + 'T00:00:00');
      const diffDays = (now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7 || diffDays < 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tut = getTutor(p.tutorId);
      const anim = p.animalId ? getAnimal(p.animalId) : null;
      return (
        p.receiptNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        tut?.name.toLowerCase().includes(q) ||
        anim?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Financial Metrics (REQ 15)
  const paidPayments = filteredPayments.filter(p => p.status === 'Pago');
  const totalRevenue = paidPayments.reduce((acc, p) => acc + p.finalAmount, 0);
  const pendingPayments = filteredPayments.filter(p => p.status === 'Pendente');
  const totalPending = pendingPayments.reduce((acc, p) => acc + p.finalAmount, 0);
  const averageTicket = paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0;
  const countServices = paidPayments.length;

  // Breakdown by Method
  const methodDistribution = React.useMemo(() => {
    const breakdown: Record<string, number> = {
      PIX: 0,
      'Cartão de Crédito': 0,
      'Cartão de Débito': 0,
      Dinheiro: 0,
      Boleto: 0
    };
    paidPayments.forEach(p => {
      breakdown[p.method] = (breakdown[p.method] || 0) + p.finalAmount;
    });
    return breakdown;
  }, [paidPayments]);

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTutorId || formTotalAmount <= 0) {
      alert('Informe o tutor e o valor total do atendimento.');
      return;
    }

    const finalAmount = Math.max(0, formTotalAmount - formDiscountAmount);
    const receiptNum = `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const nowIso = new Date().toISOString();

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      appointmentId: formAppointmentId || undefined,
      tutorId: formTutorId,
      animalId: formAnimalId || undefined,
      description: formDescription.trim(),
      totalAmount: formTotalAmount,
      discountAmount: formDiscountAmount,
      finalAmount,
      method: formMethod,
      status: formStatus,
      paidAt: formStatus === 'Pago' ? nowIso : undefined,
      createdAt: nowIso
    };

    StorageService.savePayment(newPayment);
    setIsNewModalOpen(false);
    setViewingReceipt(newPayment); // Preview receipt directly!
  };

  const handleTogglePaymentStatus = (p: Payment) => {
    const newStatus: PaymentStatus = p.status === 'Pago' ? 'Pendente' : 'Pago';
    StorageService.savePayment({
      ...p,
      status: newStatus,
      paidAt: newStatus === 'Pago' ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Módulo Financeiro & Caixa (REQ 14, REQ 15)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dashboard com valores recebidos, a receber, ticket médio e registro de pagamentos.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pagamento (REQ 14)</span>
        </button>
      </div>

      {/* Period Filter Bar (REQ 15) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium w-full sm:w-auto">
          <button
            onClick={() => setPeriodFilter('today')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              periodFilter === 'today' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriodFilter('week')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              periodFilter === 'week' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 7 Dias
          </button>
          <button
            onClick={() => setPeriodFilter('month')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              periodFilter === 'month' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              periodFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todo o Período
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar recibo, tutor ou serviço..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* KPI Cards (REQ 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Received */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Recebido (Efetivado)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatCurrency(totalRevenue)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              {paidPayments.length} transações liquidadas
            </p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Valores a Receber (Pendente)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {formatCurrency(totalPending)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              {pendingPayments.length} pagamentos pendentes
            </p>
          </div>
        </div>

        {/* Services Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Atendimentos Realizados
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {countServices}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              consultas & procedimentos quitados
            </p>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ticket Médio Clínico
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(averageTicket)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              média por paciente atendido
            </p>
          </div>
        </div>
      </div>

      {/* Methods Distribution Cards (REQ 15) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Distribuição por Forma de Pagamento (No Período)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {Object.entries(methodDistribution).map(([method, amount]) => {
            const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
            return (
              <div key={method} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-slate-500 block text-[11px] font-medium">{method}</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums block mt-1">
                  {formatCurrency(amount)}
                </span>
                <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Livro Caixa & Transações Registradas ({filteredPayments.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nº Recibo</th>
                <th className="py-3 px-4">Tutor & Paciente</th>
                <th className="py-3 px-4">Descrição do Serviço</th>
                <th className="py-3 px-4">Forma</th>
                <th className="py-3 px-4 text-right">Valor Final</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhum registro financeiro encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => {
                  const tutor = getTutor(pay.tutorId);
                  const animal = pay.animalId ? getAnimal(pay.animalId) : null;

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {pay.receiptNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{tutor?.name}</div>
                        {animal && (
                          <div className="text-[11px] text-slate-500">
                            Pet: {animal.name} ({animal.species})
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {pay.description}
                        {pay.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-700 block">
                            (Desconto aplicado: {formatCurrency(pay.discountAmount)})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {pay.method}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(pay.finalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePaymentStatus(pay)}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                            pay.status === 'Pago'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Clique para alternar status entre Pago e Pendente"
                        >
                          {pay.status}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingReceipt(pay)}
                          className="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Recibo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Registrar Pagamento (REQ 14) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Pagamento (REQ 14)
                </h3>
                <p className="text-xs text-slate-500">
                  Registre o valor, método, descontos e emita o recibo oficial.
                </p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tutor Pagador *</label>
                <select
                  required
                  value={formTutorId}
                  onChange={e => {
                    setFormTutorId(e.target.value);
                    setFormAnimalId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Selecione o tutor...</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (CPF: {t.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Animal Atendido (Opcional)</label>
                <select
                  value={formAnimalId}
                  onChange={e => setFormAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Nenhum específico</option>
                  {tutorAnimals.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Procedimento / Consulta *</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Ex: Consulta Clínica Geral + Vacina V10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Bruto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formTotalAmount}
                    onChange={e => setFormTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDiscountAmount}
                    onChange={e => setFormDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono font-bold">
                <span className="text-slate-600 font-sans text-xs">Valor Total a Pagar:</span>
                <span className="text-emerald-700 text-base">
                  {formatCurrency(Math.max(0, formTotalAmount - formDiscountAmount))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={formMethod}
                    onChange={e => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto Bancário</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Pago">Pago (Liquidado)</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
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
                  Registrar e Gerar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Official Printable Payment Receipt (REQ 14) */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden printable-card">
            <div className="px-6 py-3 bg-slate-800 text-white flex items-center justify-between no-print">
              <span className="text-xs font-semibold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Recibo de Pagamento Oficial
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                >
                  Imprimir
                </button>
                <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Body */}
            {(() => {
              const tutor = getTutor(viewingReceipt.tutorId);
              const animal = viewingReceipt.animalId ? getAnimal(viewingReceipt.animalId) : null;

              return (
                <div className="p-6 space-y-4 text-xs text-slate-900 bg-white">
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h2 className="text-base font-bold text-slate-900">{config.clinicName}</h2>
                    <p className="text-[11px] text-slate-500 font-mono">CNPJ: {config.cnpj} · Tel: {config.phone}</p>
                    <p className="text-[10px] text-slate-400">{config.address}</p>
                    <span className="inline-block mt-2 font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded">
                      {viewingReceipt.receiptNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cliente / Tutor:</span>
                      <strong className="text-slate-900">{tutor?.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CPF:</span>
                      <span className="font-mono text-slate-800">{tutor?.cpf}</span>
                    </div>
                    {animal && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paciente Animal:</span>
                        <strong className="text-slate-900">{animal.name} ({animal.species})</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data de Emissão:</span>
                      <span className="font-mono text-slate-800">{formatDateTime(viewingReceipt.createdAt)}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-slate-200 py-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Serviço:</span>
                      <strong className="text-slate-800">{viewingReceipt.description}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Forma de Pagamento:</span>
                      <span>{viewingReceipt.method}</span>
                    </div>
                    {viewingReceipt.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Desconto concedido:</span>
                        <span>-{formatCurrency(viewingReceipt.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold font-mono text-slate-900 pt-2 border-t border-slate-100">
                      <span>TOTAL PAGO:</span>
                      <span className="text-emerald-700">{formatCurrency(viewingReceipt.finalAmount)}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2">
                    <p>Agradecemos a confiança no atendimento aos seus melhores amigos!</p>
                    <p className="mt-1">Responsável Técnica: {config.technicalResponsible.name} ({config.technicalResponsible.crmv})</p>
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
