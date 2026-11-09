export type UserRole = 'admin' | 'recepcionista' | 'veterinario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  phone?: string;
  crmv?: string; // For veterinarians
  createdAt: string;
}

export interface Tutor {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
}

export type Species = 'Canina' | 'Felina' | 'Equina' | 'Aves' | 'Silvestre' | 'Outros';
export type AnimalSex = 'Macho' | 'Fêmea';

export interface Animal {
  id: string;
  tutorId: string;
  name: string;
  species: Species;
  breed: string;
  sex: AnimalSex;
  birthDate: string; // YYYY-MM-DD
  weightKg: number;
  coatColor: string;
  isNeutered: boolean;
  microchip?: string;
  allergies?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Veterinarian {
  id: string;
  userId?: string;
  name: string;
  crmv: string; // e.g. CRMV-BA 12345
  specialty: string;
  phone: string;
  email: string;
  workingHours: string;
  active: boolean;
}

export type AppointmentType = 
  | 'Rotina' 
  | 'Emergência' 
  | 'Retorno' 
  | 'Especialista' 
  | 'Cirurgia' 
  | 'Vacinação';

export type AppointmentStatus = 
  | 'Agendada' 
  | 'Em Atendimento' 
  | 'Concluída' 
  | 'Cancelada';

export interface Appointment {
  id: string;
  animalId: string;
  tutorId: string;
  vetId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  cancellationReason?: string;
  cost: number;
  paymentId?: string;
  notes?: string;
  createdAt: string;
}

export interface PhysicalExam {
  temperatureC?: number;
  weightKg?: number;
  heartRateBpm?: number;
  respiratoryRateRpm?: number;
  mucosa?: 'Normocoradas' | 'Pálidas' | 'Ictéricas' | 'Cianóticas' | 'Congestas';
  hydration?: 'Normal' | 'Desidratado leve (5%)' | 'Desidratado moderado (7-8%)' | 'Desidratado grave (>10%)';
  notes?: string;
}

export interface ClinicalRecord {
  id: string;
  appointmentId?: string;
  animalId: string;
  vetId: string;
  date: string; // YYYY-MM-DD HH:mm
  chiefComplaint: string; // Queixa principal
  anamnesis: string;
  physicalExam: PhysicalExam;
  diagnosis: string;
  proceduresDone: string[];
  clinicalConduct: string; // Conduta clínica
  attachments?: Array<{ name: string; type: string; date: string }>;
  createdAt: string;
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string;
  batchNumber: string;
  manufacturer?: string;
  applicationDate: string; // YYYY-MM-DD
  nextDoseDate: string; // YYYY-MM-DD (previsão da próxima dose)
  vetId: string;
  status: 'Aplicada' | 'Pendente' | 'Atrasada';
  notes?: string;
  createdAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  route: 'Oral' | 'Tópica' | 'Subcutânea' | 'Intramuscular' | 'Intravenosa' | 'Oftálmica' | 'Otológica';
  frequency: string; // e.g. "A cada 12 horas"
  duration: string; // e.g. "Por 7 dias"
  instructions?: string;
}

export interface Prescription {
  id: string;
  clinicalRecordId?: string;
  animalId: string;
  vetId: string;
  date: string;
  items: PrescriptionItem[];
  specialInstructions?: string;
  createdAt: string;
}

export type PaymentMethod = 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto';
export type PaymentStatus = 'Pago' | 'Pendente' | 'Cancelado';

export interface Payment {
  id: string;
  receiptNumber: string;
  appointmentId?: string;
  tutorId: string;
  animalId?: string;
  description: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  tutorId: string;
  animalId?: string;
  type: 'lembrete_consulta' | 'alerta_vacinacao' | 'confirmacao_agendamento' | 'recibo_pagamento';
  channel: 'whatsapp' | 'email';
  title: string;
  message: string;
  sentAt: string;
  status: 'Enviado' | 'Falha' | 'Simulado';
}

export interface ClinicConfig {
  clinicName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  technicalResponsible: {
    name: string;
    crmv: string;
    email: string;
  };
}
