import {
  User,
  Tutor,
  Animal,
  Veterinarian,
  Appointment,
  ClinicalRecord,
  VaccinationRecord,
  Prescription,
  Payment,
  NotificationLog,
  ClinicConfig
} from '../types';

export const INITIAL_CLINIC_CONFIG: ClinicConfig = {
  clinicName: 'VetCare Clínica & Hospital Veterinário',
  cnpj: '34.892.102/0001-44',
  phone: '(71) 3283-7000',
  email: 'contato@vetcare.ufba.br',
  address: 'Av. Adhemar de Barros, s/n - Ondina, Salvador - BA, 40170-110',
  technicalResponsible: {
    name: 'Dra. Larissa Barbosa Leôncio Pinheiro',
    crmv: 'CRMV-BA 14820',
    email: 'larissa.leoncio@ufba.br'
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Dra. Larissa Pinheiro',
    email: 'larissa.leoncio@ufba.br',
    role: 'veterinario',
    crmv: 'CRMV-BA 14820',
    active: true,
    phone: '(71) 98844-1234',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Roberto Lima',
    email: 'recepcao@vetcare.com.br',
    role: 'recepcionista',
    active: true,
    phone: '(71) 99123-4567',
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'user-3',
    name: 'Carlos Mendes',
    email: 'admin@vetcare.com.br',
    role: 'admin',
    active: true,
    phone: '(71) 98765-4321',
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'user-4',
    name: 'Dr. Gabriel Silveira',
    email: 'gabriel.vet@vetcare.com.br',
    role: 'veterinario',
    crmv: 'CRMV-BA 16290',
    active: true,
    phone: '(71) 99877-3322',
    createdAt: '2026-02-01T10:00:00Z'
  }
];

export const INITIAL_VETERINARIANS: Veterinarian[] = [
  {
    id: 'vet-1',
    userId: 'user-1',
    name: 'Dra. Larissa Barbosa Leôncio Pinheiro',
    crmv: 'CRMV-BA 14820',
    specialty: 'Clínica Médica de Pequenos Animais & Ultrassonografia',
    phone: '(71) 98844-1234',
    email: 'larissa.leoncio@ufba.br',
    workingHours: 'Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00',
    active: true
  },
  {
    id: 'vet-2',
    userId: 'user-4',
    name: 'Dr. Gabriel Silveira',
    crmv: 'CRMV-BA 16290',
    specialty: 'Cirurgia Veterinária e Traumatologia',
    phone: '(71) 99877-3322',
    email: 'gabriel.vet@vetcare.com.br',
    workingHours: 'Terça a Sábado: 09:00 - 17:00',
    active: true
  },
  {
    id: 'vet-3',
    name: 'Dra. Mariana Duarte',
    crmv: 'CRMV-BA 18910',
    specialty: 'Dermatologia Veterinária e Medicina Felina',
    phone: '(71) 99344-8899',
    email: 'mariana.duarte@vetcare.com.br',
    workingHours: 'Segunda, Quarta e Sexta: 10:00 - 19:00',
    active: true
  }
];

export const INITIAL_TUTORS: Tutor[] = [
  {
    id: 'tut-1',
    name: 'Maria Clara Santos',
    cpf: '456.789.123-00',
    phone: '(71) 99234-5678',
    email: 'mariaclara.santos@email.com',
    address: {
      street: 'Rua das Hortênsias',
      number: '142',
      neighborhood: 'Pituba',
      city: 'Salvador',
      state: 'BA',
      zipCode: '41810-010'
    },
    notes: 'Tutora muito atenciosa, prefere contato por WhatsApp.',
    createdAt: '2026-02-10T14:30:00Z'
  },
  {
    id: 'tut-2',
    name: 'Carlos Eduardo Silva',
    cpf: '234.567.890-11',
    phone: '(71) 98711-2233',
    email: 'carloseduardo.silva@email.com',
    address: {
      street: 'Alameda das Espatódeas',
      number: '560',
      complement: 'Apto 402',
      neighborhood: 'Caminho das Árvores',
      city: 'Salvador',
      state: 'BA',
      zipCode: '41820-460'
    },
    notes: 'Possui plano de vacinação anual ativo.',
    createdAt: '2026-02-15T11:00:00Z'
  },
  {
    id: 'tut-3',
    name: 'Juliana Peixoto',
    cpf: '890.123.456-22',
    phone: '(71) 99655-4433',
    email: 'ju.peixoto@email.com',
    address: {
      street: 'Av. Paulo VI',
      number: '880',
      neighborhood: 'Pituba',
      city: 'Salvador',
      state: 'BA',
      zipCode: '41810-001'
    },
    notes: 'Tutora de dois gatos resgatados.',
    createdAt: '2026-03-01T09:20:00Z'
  },
  {
    id: 'tut-4',
    name: 'Fernando Almeida',
    cpf: '321.654.987-33',
    phone: '(71) 98899-7711',
    email: 'fernando.almeida@email.com',
    address: {
      street: 'Rua Sabino Silva',
      number: '215',
      neighborhood: 'Jardim Apipema',
      city: 'Salvador',
      state: 'BA',
      zipCode: '40155-250'
    },
    notes: 'Contato de emergência adicional: (71) 3331-9000',
    createdAt: '2026-03-12T16:00:00Z'
  }
];

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 'anim-1',
    tutorId: 'tut-1',
    name: 'Thor',
    species: 'Canina',
    breed: 'Golden Retriever',
    sex: 'Macho',
    birthDate: '2022-05-14',
    weightKg: 32.5,
    coatColor: 'Dourado claro',
    isNeutered: true,
    microchip: '981098102345678',
    allergies: 'Sensibilidade alimentar a carne bovina',
    notes: 'Dócil com pessoas e outros animais. Gosta de petiscos pós-exame.',
    createdAt: '2026-02-10T14:35:00Z'
  },
  {
    id: 'anim-2',
    tutorId: 'tut-1',
    name: 'Mel',
    species: 'Canina',
    breed: 'Shih-tzu',
    sex: 'Fêmea',
    birthDate: '2024-01-20',
    weightKg: 5.8,
    coatColor: 'Branco e caramelo',
    isNeutered: false,
    allergies: 'Nenhuma alergia conhecida',
    notes: 'Lacrimejamento excessivo ocasional (olho seco).',
    createdAt: '2026-02-10T14:40:00Z'
  },
  {
    id: 'anim-3',
    tutorId: 'tut-2',
    name: 'Max',
    species: 'Canina',
    breed: 'Pastor Alemão',
    sex: 'Macho',
    birthDate: '2021-08-10',
    weightKg: 38.0,
    coatColor: 'Capa preta com castanho',
    isNeutered: true,
    microchip: '981098109988776',
    notes: 'Histórico de displasia coxofemoral leve sob controle com suplementação.',
    createdAt: '2026-02-15T11:15:00Z'
  },
  {
    id: 'anim-4',
    tutorId: 'tut-3',
    name: 'Mingau',
    species: 'Felina',
    breed: 'Siamês',
    sex: 'Macho',
    birthDate: '2023-04-18',
    weightKg: 4.2,
    coatColor: 'Ponto selo (Seal Point)',
    isNeutered: true,
    notes: 'Muito vocal e sensível a contenções bruscas; manejo ' + 'cat friendly' + ' recomendado.',
    createdAt: '2026-03-01T09:30:00Z'
  },
  {
    id: 'anim-5',
    tutorId: 'tut-3',
    name: 'Luna',
    species: 'Felina',
    breed: 'Gato Comum Europeu (SRD)',
    sex: 'Fêmea',
    birthDate: '2023-09-05',
    weightKg: 3.6,
    coatColor: 'Tricolor (Escaminha)',
    isNeutered: true,
    notes: 'Resgatada da rua, saudável e ativa.',
    createdAt: '2026-03-01T09:35:00Z'
  },
  {
    id: 'anim-6',
    tutorId: 'tut-4',
    name: 'Pipoca',
    species: 'Aves',
    breed: 'Calopsita Silvestre',
    sex: 'Macho',
    birthDate: '2024-03-10',
    weightKg: 0.095,
    coatColor: 'Cinza com bochechas alaranjadas',
    isNeutered: false,
    notes: 'Anilha nº 4509-BA. Dieta balanceada com ração extrusada.',
    createdAt: '2026-03-12T16:10:00Z'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    animalId: 'anim-1', // Thor
    tutorId: 'tut-1',
    vetId: 'vet-1', // Dra. Larissa
    date: '2026-10-03', // Today
    time: '09:00',
    durationMinutes: 45,
    type: 'Rotina',
    status: 'Concluída',
    reason: 'Check-up anual preventivo e avaliação dermatológica leve.',
    cost: 180.00,
    paymentId: 'pay-1',
    notes: 'Animal com bom estado geral.',
    createdAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'apt-2',
    animalId: 'anim-4', // Mingau
    tutorId: 'tut-3',
    vetId: 'vet-1', // Dra. Larissa
    date: '2026-10-03', // Today
    time: '11:00',
    durationMinutes: 40,
    type: 'Vacinação',
    status: 'Em Atendimento',
    reason: 'Reforço vacinal anual V4 Felina e Antirrábica.',
    cost: 160.00,
    createdAt: '2026-09-30T14:20:00Z'
  },
  {
    id: 'apt-3',
    animalId: 'anim-3', // Max
    tutorId: 'tut-2',
    vetId: 'vet-2', // Dr. Gabriel
    date: '2026-10-03', // Today
    time: '14:30',
    durationMinutes: 60,
    type: 'Especialista',
    status: 'Agendada',
    reason: 'Avaliação ortopédica dos membros pélvicos.',
    cost: 250.00,
    createdAt: '2026-10-01T08:45:00Z'
  },
  {
    id: 'apt-4',
    animalId: 'anim-2', // Mel
    tutorId: 'tut-1',
    vetId: 'vet-3', // Dra. Mariana
    date: '2026-10-04',
    time: '10:00',
    durationMinutes: 40,
    type: 'Rotina',
    status: 'Agendada',
    reason: 'Avaliação oftalmológica e tosa higiênica.',
    cost: 150.00,
    createdAt: '2026-10-01T16:00:00Z'
  },
  {
    id: 'apt-5',
    animalId: 'anim-5', // Luna
    tutorId: 'tut-3',
    vetId: 'vet-1',
    date: '2026-10-05',
    time: '15:00',
    durationMinutes: 30,
    type: 'Retorno',
    status: 'Agendada',
    reason: 'Retorno pós-tratamento de gastrite transitória.',
    cost: 90.00,
    createdAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'apt-6',
    animalId: 'anim-6', // Pipoca
    tutorId: 'tut-4',
    vetId: 'vet-1',
    date: '2026-09-25',
    time: '16:00',
    durationMinutes: 30,
    type: 'Rotina',
    status: 'Concluída',
    reason: 'Avaliação de penas e corte profilático de pontas de asas.',
    cost: 120.00,
    paymentId: 'pay-2',
    createdAt: '2026-09-20T10:00:00Z'
  }
];

export const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'rec-1',
    appointmentId: 'apt-1',
    animalId: 'anim-1', // Thor
    vetId: 'vet-1',
    date: '2026-10-03 09:45',
    chiefComplaint: 'Tutora relata coceira leve nas patas e veio para check-up de rotina anual.',
    anamnesis: 'Animal ativo, apetite normal, ingestão hídrica preservada. Fezes e urina fisiológicas. Sem vômitos ou tosse. Dieta baseada em ração super premium sabor cordeiro.',
    physicalExam: {
      temperatureC: 38.6,
      weightKg: 32.5,
      heartRateBpm: 92,
      respiratoryRateRpm: 24,
      mucosa: 'Normocoradas',
      hydration: 'Normal',
      notes: 'Linfonodos periféricos não reativos. Ausculta cardiopulmonar sem sopros ou estertores. Discreta pododermatite alérgica interdigital.'
    },
    diagnosis: 'Pododermatite interdigital eritematosa leve associada a umidade / atopia sazonal.',
    proceduresDone: ['Exame clínico geral completo', 'Citologia de fita por aposição interdigital', 'Pesagem e aferição de parâmetros vitais'],
    clinicalConduct: 'Orientado banho terapêutico com xampu de clorexidina a 2% e secagem rigorosa das patas. Prescrito suplemento de ômega 3.',
    createdAt: '2026-10-03T09:45:00Z'
  },
  {
    id: 'rec-2',
    animalId: 'anim-3', // Max
    vetId: 'vet-1',
    date: '2026-09-15 14:00',
    chiefComplaint: 'Claudicação intermitente em membro pélvico direito após passeios longos.',
    anamnesis: 'Tutor notou dificuldade moderada ao levantar pela manhã. Sem quedas relatadas.',
    physicalExam: {
      temperatureC: 38.4,
      weightKg: 38.2,
      heartRateBpm: 88,
      respiratoryRateRpm: 22,
      mucosa: 'Normocoradas',
      hydration: 'Normal',
      notes: 'Dor à extensão coxofemoral bilateral, mais pronunciada à direita. Sinal de Ortolani positivo.'
    },
    diagnosis: 'Displasia coxofemoral em grau leve a moderado em membro pélvico direito.',
    proceduresDone: ['Exame ortopédico', 'Solicitação de radiografia coxofemoral sob sedação'],
    clinicalConduct: 'Prescrito condroprotetor e anti-inflamatório não esteroidal por 5 dias. Encaminhado para avaliação com Dr. Gabriel Silveira.',
    createdAt: '2026-09-15T14:40:00Z'
  }
];

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-1',
    animalId: 'anim-1', // Thor
    vaccineName: 'V10 Polivalente Canina (Vanguard Plus)',
    batchNumber: 'LOTE-84920A',
    manufacturer: 'Zoetis',
    applicationDate: '2025-10-15',
    nextDoseDate: '2026-10-15', // Upcoming within ~12 days
    vetId: 'vet-1',
    status: 'Aplicada',
    notes: 'Sem reações adversas pós-vacinais.'
  },
  {
    id: 'vac-2',
    animalId: 'anim-1', // Thor
    vaccineName: 'Raiva Canina (Defensor)',
    batchNumber: 'LOTE-11029B',
    manufacturer: 'Zoetis',
    applicationDate: '2025-10-15',
    nextDoseDate: '2026-10-15',
    vetId: 'vet-1',
    status: 'Aplicada',
    notes: 'Reforço anual programado.'
  },
  {
    id: 'vac-3',
    animalId: 'anim-2', // Mel
    vaccineName: 'V10 Polivalente Canina',
    batchNumber: 'LOTE-77401C',
    manufacturer: 'MSD Saúde Animal',
    applicationDate: '2025-09-01',
    nextDoseDate: '2026-09-01', // OVERDUE! Useful for testing alerts
    vetId: 'vet-1',
    status: 'Atrasada',
    notes: 'Reforço atrasado, tutor precisa ser notificado.'
  },
  {
    id: 'vac-4',
    animalId: 'anim-4', // Mingau
    vaccineName: 'V4 Quádrupla Felina (Felocell 4)',
    batchNumber: 'LOTE-99321D',
    manufacturer: 'Zoetis',
    applicationDate: '2025-10-03',
    nextDoseDate: '2026-10-03', // DUE TODAY
    vetId: 'vet-1',
    status: 'Pendente',
    notes: 'Agendado para aplicação na consulta de hoje.'
  },
  {
    id: 'vac-5',
    animalId: 'anim-5', // Luna
    vaccineName: 'Antirrábica Felina',
    batchNumber: 'LOTE-40291X',
    manufacturer: 'Boehringer Ingelheim',
    applicationDate: '2026-01-10',
    nextDoseDate: '2027-01-10',
    vetId: 'vet-1',
    status: 'Aplicada',
    notes: 'Primeira dose pós-adoção.'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'presc-1',
    clinicalRecordId: 'rec-1',
    animalId: 'anim-1', // Thor
    vetId: 'vet-1',
    date: '2026-10-03',
    items: [
      {
        id: 'item-1',
        medication: 'Xampu Clorexidina 2% (Clorexiderm)',
        dosage: 'Quantidade suficiente para cobrir patas',
        route: 'Tópica',
        frequency: '2 vezes por semana',
        duration: 'Por 3 semanas',
        instructions: 'Massagear suavemente entre os dígitos, deixar agir por 10 minutos e enxaguar com água morna. Secar totalmente.'
      },
      {
        id: 'item-2',
        medication: 'Ômega 3 1000mg Pet',
        dosage: '1 cápsula ao dia',
        route: 'Oral',
        frequency: '1 vez ao dia (pela manhã junto à refeição)',
        duration: 'Uso contínuo por 60 dias',
        instructions: 'Misturar na alimentação ou administrar diretamente na boca.'
      }
    ],
    specialInstructions: 'Evitar que o animal lamba as patas nas primeiras 2 horas após a secagem. Usar colar elizabetano caso haja lambedura compulsiva.',
    createdAt: '2026-10-03T09:50:00Z'
  },
  {
    id: 'presc-2',
    clinicalRecordId: 'rec-2',
    animalId: 'anim-3', // Max
    vetId: 'vet-1',
    date: '2026-09-15',
    items: [
      {
        id: 'item-3',
        medication: 'Carprofeno 100mg',
        dosage: '1 comprimido',
        route: 'Oral',
        frequency: 'A cada 24 horas',
        duration: 'Por 5 dias consecutivos',
        instructions: 'Administrar sempre após as refeições. Suspender se houver vômito ou fezes escuras.'
      },
      {
        id: 'item-4',
        medication: 'Sulfato de Condroitina + Glicosamina (Condroplex 1000mg)',
        dosage: '2 cápsulas',
        route: 'Oral',
        frequency: '1 vez ao dia',
        duration: 'Uso contínuo por 90 dias',
        instructions: 'Suporte articular para cartilagem.'
      }
    ],
    specialInstructions: 'Repouso de caminhadas longas e evitar pisos escorregadios.',
    createdAt: '2026-09-15T14:45:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    receiptNumber: 'REC-2026-0089',
    appointmentId: 'apt-1',
    tutorId: 'tut-1',
    animalId: 'anim-1',
    description: 'Consulta Clínica Geral + Citologia Dermatológica',
    totalAmount: 180.00,
    discountAmount: 10.00,
    finalAmount: 170.00,
    method: 'PIX',
    status: 'Pago',
    paidAt: '2026-10-03T10:15:00Z',
    createdAt: '2026-10-03T09:55:00Z'
  },
  {
    id: 'pay-2',
    receiptNumber: 'REC-2026-0088',
    appointmentId: 'apt-6',
    tutorId: 'tut-4',
    animalId: 'anim-6',
    description: 'Consulta Veterinária Especializada para Aves',
    totalAmount: 120.00,
    discountAmount: 0.00,
    finalAmount: 120.00,
    method: 'Cartão de Débito',
    status: 'Pago',
    paidAt: '2026-09-25T16:45:00Z',
    createdAt: '2026-09-25T16:30:00Z'
  },
  {
    id: 'pay-3',
    receiptNumber: 'REC-2026-0087',
    tutorId: 'tut-2',
    animalId: 'anim-3',
    description: 'Procedimento Radiográfico Digital Coxofemoral (2 projeções)',
    totalAmount: 280.00,
    discountAmount: 20.00,
    finalAmount: 260.00,
    method: 'Cartão de Crédito',
    status: 'Pago',
    paidAt: '2026-09-18T11:20:00Z',
    createdAt: '2026-09-18T11:00:00Z'
  },
  {
    id: 'pay-4',
    receiptNumber: 'REC-2026-0086',
    tutorId: 'tut-3',
    animalId: 'anim-5',
    description: 'Hemograma Completo + Bioquímico Renal e Hepático',
    totalAmount: 195.00,
    discountAmount: 0.00,
    finalAmount: 195.00,
    method: 'PIX',
    status: 'Pago',
    paidAt: '2026-09-10T14:10:00Z',
    createdAt: '2026-09-10T14:00:00Z'
  },
  {
    id: 'pay-5',
    receiptNumber: 'REC-2026-0085',
    tutorId: 'tut-1',
    animalId: 'anim-2',
    description: 'Vacinação Polivalente + Vermifugação de Rotina',
    totalAmount: 145.00,
    discountAmount: 0.00,
    finalAmount: 145.00,
    method: 'Dinheiro',
    status: 'Pago',
    paidAt: '2026-09-02T15:30:00Z',
    createdAt: '2026-09-02T15:20:00Z'
  },
  {
    id: 'pay-6',
    receiptNumber: 'REC-2026-0090',
    appointmentId: 'apt-3',
    tutorId: 'tut-2',
    animalId: 'anim-3',
    description: 'Consulta Especialista Ortopedia (Previsão)',
    totalAmount: 250.00,
    discountAmount: 0.00,
    finalAmount: 250.00,
    method: 'PIX',
    status: 'Pendente',
    createdAt: '2026-10-01T08:45:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1',
    tutorId: 'tut-1',
    animalId: 'anim-1',
    type: 'lembrete_consulta',
    channel: 'whatsapp',
    title: 'Lembrete de Consulta - Thor',
    message: 'Olá Maria Clara! Lembramos da consulta de Thor hoje às 09:00 na VetCare com Dra. Larissa Pinheiro. Até breve!',
    sentAt: '2026-10-03T07:00:00Z',
    status: 'Enviado'
  },
  {
    id: 'notif-2',
    tutorId: 'tut-1',
    animalId: 'anim-2',
    type: 'alerta_vacinacao',
    channel: 'whatsapp',
    title: 'Alerta de Vacinação - Mel',
    message: 'Olá Maria Clara! A vacina V10 de Mel está atrasada desde 01/09/2026. A imunização é essencial para a saúde dela. Podemos agendar o reforço?',
    sentAt: '2026-09-20T10:30:00Z',
    status: 'Enviado'
  },
  {
    id: 'notif-3',
    tutorId: 'tut-3',
    animalId: 'anim-4',
    type: 'confirmacao_agendamento',
    channel: 'email',
    title: 'Confirmação de Agendamento - Mingau',
    message: 'Prezada Juliana, o agendamento de vacinação de Mingau foi confirmado para 03/10/2026 às 11:00.',
    sentAt: '2026-09-30T14:25:00Z',
    status: 'Enviado'
  }
];

// LocalStorage Keys
const KEYS = {
  USERS: 'vetcare_users_v1',
  AUTH_USER: 'vetcare_auth_user_v1',
  TUTORS: 'vetcare_tutors_v1',
  ANIMALS: 'vetcare_animals_v1',
  VETS: 'vetcare_vets_v1',
  APPOINTMENTS: 'vetcare_appointments_v1',
  RECORDS: 'vetcare_records_v1',
  VACCINATIONS: 'vetcare_vaccinations_v1',
  PRESCRIPTIONS: 'vetcare_prescriptions_v1',
  PAYMENTS: 'vetcare_payments_v1',
  NOTIFICATIONS: 'vetcare_notifications_v1',
  CONFIG: 'vetcare_config_v1'
};

function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent('vetcare_storage_change', { detail: { key } }));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Config
  getConfig: (): ClinicConfig => readStorage<ClinicConfig>(KEYS.CONFIG, INITIAL_CLINIC_CONFIG),
  setConfig: (config: ClinicConfig) => writeStorage(KEYS.CONFIG, config),

  // Users (REQ 01)
  getUsers: (): User[] => readStorage<User[]>(KEYS.USERS, INITIAL_USERS),
  setUsers: (users: User[]) => writeStorage(KEYS.USERS, users),
  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    StorageService.setUsers(users);
  },
  deleteUser: (id: string) => {
    const users = StorageService.getUsers().filter(u => u.id !== id);
    StorageService.setUsers(users);
  },

  // Auth User (REQ 02)
  getCurrentUser: (): User => {
    return readStorage<User>(KEYS.AUTH_USER, INITIAL_USERS[0]); // Defaults to Dra. Larissa
  },
  setCurrentUser: (user: User) => writeStorage(KEYS.AUTH_USER, user),

  // Tutors (REQ 04)
  getTutors: (): Tutor[] => readStorage<Tutor[]>(KEYS.TUTORS, INITIAL_TUTORS),
  setTutors: (tutors: Tutor[]) => writeStorage(KEYS.TUTORS, tutors),
  saveTutor: (tutor: Tutor) => {
    const tutors = StorageService.getTutors();
    const index = tutors.findIndex(t => t.id === tutor.id);
    if (index >= 0) {
      tutors[index] = tutor;
    } else {
      tutors.unshift(tutor);
    }
    StorageService.setTutors(tutors);
  },
  deleteTutor: (id: string) => {
    const tutors = StorageService.getTutors().filter(t => t.id !== id);
    StorageService.setTutors(tutors);
  },

  // Animals (REQ 05)
  getAnimals: (): Animal[] => readStorage<Animal[]>(KEYS.ANIMALS, INITIAL_ANIMALS),
  setAnimals: (animals: Animal[]) => writeStorage(KEYS.ANIMALS, animals),
  saveAnimal: (animal: Animal) => {
    const animals = StorageService.getAnimals();
    const index = animals.findIndex(a => a.id === animal.id);
    if (index >= 0) {
      animals[index] = animal;
    } else {
      animals.unshift(animal);
    }
    StorageService.setAnimals(animals);
  },
  deleteAnimal: (id: string) => {
    const animals = StorageService.getAnimals().filter(a => a.id !== id);
    StorageService.setAnimals(animals);
  },

  // Veterinarians (REQ 06)
  getVeterinarians: (): Veterinarian[] => readStorage<Veterinarian[]>(KEYS.VETS, INITIAL_VETERINARIANS),
  setVeterinarians: (vets: Veterinarian[]) => writeStorage(KEYS.VETS, vets),
  saveVeterinarian: (vet: Veterinarian) => {
    const vets = StorageService.getVeterinarians();
    const index = vets.findIndex(v => v.id === vet.id);
    if (index >= 0) {
      vets[index] = vet;
    } else {
      vets.push(vet);
    }
    StorageService.setVeterinarians(vets);
  },
  deleteVeterinarian: (id: string) => {
    const vets = StorageService.getVeterinarians().filter(v => v.id !== id);
    StorageService.setVeterinarians(vets);
  },

  // Appointments (REQ 07, REQ 08, REQ 09)
  getAppointments: (): Appointment[] => readStorage<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  setAppointments: (appointments: Appointment[]) => writeStorage(KEYS.APPOINTMENTS, appointments),
  saveAppointment: (appointment: Appointment) => {
    const appointments = StorageService.getAppointments();
    const index = appointments.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      appointments[index] = appointment;
    } else {
      appointments.unshift(appointment);
    }
    StorageService.setAppointments(appointments);
  },
  cancelAppointment: (id: string, reason: string) => {
    const appointments = StorageService.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index >= 0) {
      appointments[index].status = 'Cancelada';
      appointments[index].cancellationReason = reason;
      StorageService.setAppointments(appointments);
    }
  },

  // Clinical Records (REQ 10, REQ 11)
  getClinicalRecords: (): ClinicalRecord[] => readStorage<ClinicalRecord[]>(KEYS.RECORDS, INITIAL_CLINICAL_RECORDS),
  setClinicalRecords: (records: ClinicalRecord[]) => writeStorage(KEYS.RECORDS, records),
  saveClinicalRecord: (record: ClinicalRecord) => {
    const records = StorageService.getClinicalRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    StorageService.setClinicalRecords(records);
  },

  // Vaccinations (REQ 12)
  getVaccinations: (): VaccinationRecord[] => readStorage<VaccinationRecord[]>(KEYS.VACCINATIONS, INITIAL_VACCINATIONS),
  setVaccinations: (vaccinations: VaccinationRecord[]) => writeStorage(KEYS.VACCINATIONS, vaccinations),
  saveVaccination: (vaccination: VaccinationRecord) => {
    const vaccinations = StorageService.getVaccinations();
    const index = vaccinations.findIndex(v => v.id === vaccination.id);
    if (index >= 0) {
      vaccinations[index] = vaccination;
    } else {
      vaccinations.unshift(vaccination);
    }
    StorageService.setVaccinations(vaccinations);
  },

  // Prescriptions (REQ 13)
  getPrescriptions: (): Prescription[] => readStorage<Prescription[]>(KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS),
  setPrescriptions: (prescriptions: Prescription[]) => writeStorage(KEYS.PRESCRIPTIONS, prescriptions),
  savePrescription: (prescription: Prescription) => {
    const prescriptions = StorageService.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === prescription.id);
    if (index >= 0) {
      prescriptions[index] = prescription;
    } else {
      prescriptions.unshift(prescription);
    }
    StorageService.setPrescriptions(prescriptions);
  },

  // Payments (REQ 14, REQ 15)
  getPayments: (): Payment[] => readStorage<Payment[]>(KEYS.PAYMENTS, INITIAL_PAYMENTS),
  setPayments: (payments: Payment[]) => writeStorage(KEYS.PAYMENTS, payments),
  savePayment: (payment: Payment) => {
    const payments = StorageService.getPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    if (index >= 0) {
      payments[index] = payment;
    } else {
      payments.unshift(payment);
    }
    StorageService.setPayments(payments);
  },

  // Notifications (REQ 16)
  getNotifications: (): NotificationLog[] => readStorage<NotificationLog[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (notifications: NotificationLog[]) => writeStorage(KEYS.NOTIFICATIONS, notifications),
  logNotification: (notification: NotificationLog) => {
    const notifications = StorageService.getNotifications();
    notifications.unshift(notification);
    StorageService.setNotifications(notifications);
  },

  // Reset to initial seed data
  resetAll: () => {
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.AUTH_USER);
    localStorage.removeItem(KEYS.TUTORS);
    localStorage.removeItem(KEYS.ANIMALS);
    localStorage.removeItem(KEYS.VETS);
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.RECORDS);
    localStorage.removeItem(KEYS.VACCINATIONS);
    localStorage.removeItem(KEYS.PRESCRIPTIONS);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.CONFIG);
    window.location.reload();
  },

  // Backup / Export
  exportBackup: () => {
    const data = {
      config: StorageService.getConfig(),
      users: StorageService.getUsers(),
      tutors: StorageService.getTutors(),
      animals: StorageService.getAnimals(),
      vets: StorageService.getVeterinarians(),
      appointments: StorageService.getAppointments(),
      records: StorageService.getClinicalRecords(),
      vaccinations: StorageService.getVaccinations(),
      prescriptions: StorageService.getPrescriptions(),
      payments: StorageService.getPayments(),
      notifications: StorageService.getNotifications(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vetcare_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
