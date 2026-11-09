import React, { useState } from 'react';
import {
  BellRing,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  Dog,
  User,
  ExternalLink,
  RotateCcw,
  Smartphone,
  Phone
} from 'lucide-react';
import { NotificationLog, Tutor, Animal, Appointment, VaccinationRecord } from '../types';
import { StorageService } from '../services/storage';
import { formatDate, formatDateTime } from '../utils/formatters';

interface NotificationsViewProps {
  notifications: NotificationLog[];
  tutors: Tutor[];
  animals: Animal[];
  appointments: Appointment[];
  vaccinations: VaccinationRecord[];
  initialParams?: {
    tutorId?: string;
    animalId?: string;
    vaccineName?: string;
    dueDate?: string;
  };
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  tutors,
  animals,
  appointments,
  vaccinations,
  initialParams
}) => {
  const [selectedTutorId, setSelectedTutorId] = useState(initialParams?.tutorId || tutors[0]?.id || '');
  const [selectedAnimalId, setSelectedAnimalId] = useState(initialParams?.animalId || '');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [templateType, setTemplateType] = useState<
    'lembrete_consulta' | 'alerta_vacinacao' | 'confirmacao_agendamento' | 'custom'
  >(initialParams?.vaccineName ? 'alerta_vacinacao' : 'lembrete_consulta');

  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const selectedTutor = tutors.find(t => t.id === selectedTutorId);
  const tutorAnimals = animals.filter(a => a.tutorId === selectedTutorId);
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || tutorAnimals[0];

  // Auto-generate message based on template
  const generatedMessage = React.useMemo(() => {
    if (templateType === 'custom') {
      return customMessage;
    }

    const tutorFirstName = selectedTutor ? selectedTutor.name.split(' ')[0] : 'Tutor';
    const petName = selectedAnimal ? selectedAnimal.name : 'seu pet';

    if (templateType === 'lembrete_consulta') {
      const petApt = appointments.find(a => a.animalId === selectedAnimal?.id && a.status === 'Agendada');
      const dateText = petApt ? `${formatDate(petApt.date)} às ${petApt.time}` : 'em breve';
      return `Olá, ${tutorFirstName}! Lembramos da consulta agendada para ${petName} na VetCare para o dia ${dateText}. Por favor, chegue com 10 minutos de antecedência. Em caso de dúvidas ou necessidade de remarcação, responda a esta mensagem.`;
    }

    if (templateType === 'alerta_vacinacao') {
      const vacName = initialParams?.vaccineName || 'V10 Polivalente';
      const dueDate = initialParams?.dueDate ? formatDate(initialParams.dueDate) : 'este mês';
      return `Olá, ${tutorFirstName}! Notamos que a vacina ${vacName} de ${petName} está prevista para ${dueDate}. A imunização regular é fundamental para prevenir doenças graves. Deseja que reservemos um horário para a aplicação?`;
    }

    if (templateType === 'confirmacao_agendamento') {
      return `Olá, ${tutorFirstName}! Confirmamos com sucesso o agendamento de ${petName} na clínica VetCare. Nossa equipe médica estará pronta para recebê-los com todo carinho e dedicação!`;
    }

    return '';
  }, [templateType, selectedTutor, selectedAnimal, appointments, initialParams, customMessage]);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;

    const newLog: NotificationLog = {
      id: `notif-${Date.now()}`,
      tutorId: selectedTutor.id,
      animalId: selectedAnimal?.id,
      type: templateType === 'custom' ? 'lembrete_consulta' : templateType,
      channel,
      title: customTitle || (templateType === 'lembrete_consulta' ? `Lembrete de Consulta - ${selectedAnimal?.name}` : `Alerta de Vacinação - ${selectedAnimal?.name}`),
      message: generatedMessage,
      sentAt: new Date().toISOString(),
      status: 'Enviado'
    };

    StorageService.logNotification(newLog);
    setIsSentSuccess(true);
    setTimeout(() => setIsSentSuccess(false), 4000);
  };

  // Open real WhatsApp web link if WhatsApp is selected
  const handleOpenWhatsAppWeb = () => {
    if (!selectedTutor) return;
    const cleanNumber = selectedTutor.phone.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const encoded = encodeURIComponent(generatedMessage);
    const url = `https://wa.me/${fullNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Central de Notificações ao Tutor (REQ 16)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Disparo de lembretes de consultas agendadas e alertas preventivos de reforço de vacinação.
          </p>
        </div>
      </div>

      {/* Main Grid: Composer on Left, Simulator and History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Template selector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Configurar Disparo de Notificação</span>
          </h2>

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
            {/* Tutor Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tutor Destinatário *</label>
              <select
                required
                value={selectedTutorId}
                onChange={e => {
                  setSelectedTutorId(e.target.value);
                  setSelectedAnimalId('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} · Tel: {t.phone} (CPF: {t.cpf})
                  </option>
                ))}
              </select>
            </div>

            {/* Animal Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Paciente Animal</label>
              <select
                value={selectedAnimalId}
                onChange={e => setSelectedAnimalId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Selecione o animal...</option>
                {tutorAnimals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.species} · {a.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Canal de Envio *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-colors ${
                    channel === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp (Mensagem Direta)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-colors ${
                    channel === 'email'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>E-mail Corporativo</span>
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Notificação (REQ 16)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateType('lembrete_consulta')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    templateType === 'lembrete_consulta'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Lembrete de Consulta</span>
                  <span className="text-[10px] text-slate-500">Informa data, horário e orientações</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('alerta_vacinacao')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    templateType === 'alerta_vacinacao'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Alerta de Vacinação</span>
                  <span className="text-[10px] text-slate-500">Avisa sobre doses a vencer ou atrasadas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('confirmacao_agendamento')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    templateType === 'confirmacao_agendamento'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Confirmação de Agendamento</span>
                  <span className="text-[10px] text-slate-500">Recém marcado no sistema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('custom')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    templateType === 'custom'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Mensagem Personalizada</span>
                  <span className="text-[10px] text-slate-500">Texto livre redigido pela clínica</span>
                </button>
              </div>
            </div>

            {/* Custom text area if custom template */}
            {templateType === 'custom' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Texto da Notificação *</label>
                <textarea
                  rows={4}
                  required
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Digite a mensagem personalizada para o tutor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {channel === 'whatsapp' && (
                <button
                  type="button"
                  onClick={handleOpenWhatsAppWeb}
                  className="px-3 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no WhatsApp Web</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Registrar & Enviar Notificação (REQ 16)</span>
                </button>
              </div>
            </div>

            {isSentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Notificação enviada e registrada no histórico com sucesso!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Message Preview Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Phone / Email Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-500" />
                Pré-visualização do Destinatário
              </span>
              <span className="text-[11px] font-mono text-slate-400 capitalize">
                {channel}
              </span>
            </div>

            {channel === 'whatsapp' ? (
              /* WhatsApp Chat Bubble Mockup */
              <div className="bg-[#EFEAE2] p-4 rounded-xl border border-slate-300 min-h-[200px] flex flex-col justify-end space-y-2">
                <div className="bg-white/80 text-[10px] text-slate-600 text-center py-1 rounded px-2 self-center font-medium">
                  {selectedTutor?.name} ({selectedTutor?.phone})
                </div>

                <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-xs text-xs text-slate-900 max-w-[90%] self-end space-y-1">
                  <p className="leading-relaxed whitespace-pre-wrap">{generatedMessage}</p>
                  <div className="text-[10px] text-slate-500 text-right font-mono flex items-center justify-end gap-1">
                    <span>10:30</span>
                    <span className="text-emerald-700 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Email Inbox Preview Mockup */
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="border-b border-slate-200 pb-2 text-[11px] text-slate-600 space-y-0.5">
                  <p><strong>De:</strong> VetCare Clínica & Hospital &lt;contato@vetcare.ufba.br&gt;</p>
                  <p><strong>Para:</strong> {selectedTutor?.name} &lt;{selectedTutor?.email || 'tutor@email.com'}&gt;</p>
                  <p><strong>Assunto:</strong> VetCare: Aviso sobre a saúde de {selectedAnimal?.name}</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-100 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {generatedMessage}
                </div>
              </div>
            )}
          </div>

          {/* History of Sent Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Histórico de Disparos Recentes ({notifications.length})
            </h3>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.map(notif => {
                const tut = tutors.find(t => t.id === notif.tutorId);
                const anim = animals.find(a => a.id === notif.animalId);

                return (
                  <div key={notif.id} className="pt-2.5 first:pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {notif.channel === 'whatsapp' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        <span>{tut?.name}</span>
                        {anim && <span className="text-slate-400 font-normal">({anim.name})</span>}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(notif.sentAt)}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        {notif.status}
                      </span>
                      <span className="text-slate-400 capitalize">{notif.channel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
