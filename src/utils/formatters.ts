export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value || 0);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  // Handle ISO or YYYY-MM-DD
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function formatDateTime(dateTimeString: string | undefined): string {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeString;
  }
}

export function calculateAge(birthDate: string): string {
  if (!birthDate) return 'Desconhecida';
  const birth = new Date(birthDate);
  const now = new Date();
  if (isNaN(birth.getTime())) return 'Desconhecida';

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years}a ${months}m`;
}

export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function getVaccineStatusInfo(nextDoseDate: string): {
  label: 'Em dia' | 'Vence em breve' | 'Atrasada';
  colorClass: string;
  daysRemaining: number;
} {
  const target = new Date(nextDoseDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Atrasada',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      daysRemaining: diffDays
    };
  } else if (diffDays <= 15) {
    return {
      label: 'Vence em breve',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      daysRemaining: diffDays
    };
  } else {
    return {
      label: 'Em dia',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      daysRemaining: diffDays
    };
  }
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
