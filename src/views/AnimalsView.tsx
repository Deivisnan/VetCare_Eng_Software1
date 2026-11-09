import React, { useState } from 'react';
import {
  Dog,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Edit2,
  Trash2,
  X,
  ClipboardList,
  CalendarPlus,
  AlertCircle
} from 'lucide-react';
import { Animal, Tutor, Species, AnimalSex, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { formatDate, calculateAge } from '../utils/formatters';

interface AnimalsViewProps {
  animals: Animal[];
  tutors: Tutor[];
  userRole: UserRole;
  onNavigateToRecords: (animalId: string) => void;
  onNavigateToAgendaWithAnimal: (animal: Animal) => void;
  initialOpenNew?: boolean;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  animals,
  tutors,
  userRole,
  onNavigateToRecords,
  onNavigateToAgendaWithAnimal,
  initialOpenNew = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNew);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  // Form State (REQ 05)
  const [formTutorId, setFormTutorId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState<Species>('Canina');
  const [formBreed, setFormBreed] = useState('');
  const [formSex, setFormSex] = useState<AnimalSex>('Macho');
  const [formBirthDate, setFormBirthDate] = useState('2023-01-01');
  const [formWeightKg, setFormWeightKg] = useState<number>(10);
  const [formCoatColor, setFormCoatColor] = useState('');
  const [formIsNeutered, setFormIsNeutered] = useState(true);
  const [formMicrochip, setFormMicrochip] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenCreate = () => {
    setEditingAnimal(null);
    setFormTutorId(tutors[0]?.id || '');
    setFormName('');
    setFormSpecies('Canina');
    setFormBreed('');
    setFormSex('Macho');
    setFormBirthDate('2023-01-01');
    setFormWeightKg(10);
    setFormCoatColor('');
    setFormIsNeutered(true);
    setFormMicrochip('');
    setFormAllergies('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormTutorId(animal.tutorId);
    setFormName(animal.name);
    setFormSpecies(animal.species);
    setFormBreed(animal.breed);
    setFormSex(animal.sex);
    setFormBirthDate(animal.birthDate);
    setFormWeightKg(animal.weightKg);
    setFormCoatColor(animal.coatColor);
    setFormIsNeutered(animal.isNeutered);
    setFormMicrochip(animal.microchip || '');
    setFormAllergies(animal.allergies || '');
    setFormNotes(animal.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTutorId) {
      alert('Nome do animal e tutor são obrigatórios.');
      return;
    }

    const animalToSave: Animal = {
      id: editingAnimal ? editingAnimal.id : `anim-${Date.now()}`,
      tutorId: formTutorId,
      name: formName.trim(),
      species: formSpecies,
      breed: formBreed.trim() || 'SRD (Sem Raça Definida)',
      sex: formSex,
      birthDate: formBirthDate,
      weightKg: Number(formWeightKg) || 1,
      coatColor: formCoatColor.trim() || 'Padrão',
      isNeutered: formIsNeutered,
      microchip: formMicrochip.trim() || undefined,
      allergies: formAllergies.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: editingAnimal ? editingAnimal.createdAt : new Date().toISOString()
    };

    StorageService.saveAnimal(animalToSave);
    setIsModalOpen(false);
  };

  const handleDelete = (animal: Animal) => {
    if (confirm(`Deseja realmente excluir o cadastro do animal ${animal.name}?`)) {
      StorageService.deleteAnimal(animal.id);
    }
  };

  const filteredAnimals = animals.filter(animal => {
    if (speciesFilter !== 'all' && animal.species !== speciesFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tutor = tutors.find(t => t.id === animal.tutorId);
      return (
        animal.name.toLowerCase().includes(q) ||
        animal.breed.toLowerCase().includes(q) ||
        animal.microchip?.toLowerCase().includes(q) ||
        tutor?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTutor = (tutorId: string) => tutors.find(t => t.id === tutorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Animais / Pacientes (REQ 05)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastro completo de animais associados aos seus tutores, com raça, peso e histórico.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Animal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por animal, raça, microchip ou tutor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg"
          />
        </div>

        {/* Species selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 shrink-0 font-medium">Espécie:</span>
          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 w-full sm:w-auto"
          >
            <option value="all">Todas as Espécies</option>
            <option value="Canina">Canina</option>
            <option value="Felina">Felina</option>
            <option value="Equina">Equina</option>
            <option value="Aves">Aves</option>
            <option value="Silvestre">Silvestre</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Grid of Animals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <Dog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Nenhum animal encontrado.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
            >
              + Cadastrar primeiro paciente
            </button>
          </div>
        ) : (
          filteredAnimals.map(animal => {
            const tutor = getTutor(animal.tutorId);

            return (
              <div
                key={animal.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Dog className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">
                          {animal.name}
                        </h2>
                        <span className="text-xs text-slate-500">
                          {animal.species} · {animal.breed}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {calculateAge(animal.birthDate)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Sexo: <strong>{animal.sex}</strong></span>
                      <span>Peso: <strong className="font-mono">{animal.weightKg} kg</strong></span>
                      <span>Castrado: <strong>{animal.isNeutered ? 'Sim' : 'Não'}</strong></span>
                    </div>

                    <div className="text-slate-600">
                      Tutor: <strong className="text-slate-800">{tutor?.name || 'Tutor não encontrado'}</strong>
                    </div>

                    {animal.microchip && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Microchip: {animal.microchip}
                      </div>
                    )}

                    {animal.allergies && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Alergia: {animal.allergies}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToRecords(animal.id)}
                      className="px-3.5 py-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
                      title="Abrir Prontuário Clínico (REQ 11)"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Prontuário</span>
                    </button>

                    <button
                      onClick={() => onNavigateToAgendaWithAnimal(animal)}
                      className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Agendar Consulta (REQ 07)"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(animal)}
                      className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Editar dados do animal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(animal)}
                        className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Excluir animal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Manter Animal (REQ 05) - Mobile Bottom Sheet on smartphone, Centered dialog on desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAnimal ? 'Alterar Cadastro do Animal (REQ 05)' : 'Cadastrar Novo Animal (REQ 05)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Associe ao tutor e defina espécie, raça, sexo e nascimento.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                aria-label="Fechar"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tutor */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tutor Responsável *</label>
                <select
                  required
                  value={formTutorId}
                  onChange={e => setFormTutorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Selecione o tutor...</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (CPF: {t.cpf})</option>
                  ))}
                </select>
              </div>

              {/* Name & Species */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Animal *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Ex: Thor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Espécie *</label>
                  <select
                    value={formSpecies}
                    onChange={e => setFormSpecies(e.target.value as Species)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Canina">Canina</option>
                    <option value="Felina">Felina</option>
                    <option value="Equina">Equina</option>
                    <option value="Aves">Aves</option>
                    <option value="Silvestre">Silvestre</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Breed & Sex */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Raça *</label>
                  <input
                    type="text"
                    required
                    value={formBreed}
                    onChange={e => setFormBreed(e.target.value)}
                    placeholder="Ex: Golden Retriever ou SRD"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo *</label>
                  <select
                    value={formSex}
                    onChange={e => setFormSex(e.target.value as AnimalSex)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
              </div>

              {/* BirthDate, Weight and Color */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeightKg}
                    onChange={e => setFormWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pelagem / Cor</label>
                  <input
                    type="text"
                    value={formCoatColor}
                    onChange={e => setFormCoatColor(e.target.value)}
                    placeholder="Ex: Caramelo"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Neutered & Microchip */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 pt-3">
                  <input
                    type="checkbox"
                    checked={formIsNeutered}
                    onChange={e => setFormIsNeutered(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Animal Castrado</span>
                </label>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nº do Microchip</label>
                  <input
                    type="text"
                    value={formMicrochip}
                    onChange={e => setFormMicrochip(e.target.value)}
                    placeholder="Ex: 98109810..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Allergies & Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alergias ou Restrições</label>
                <input
                  type="text"
                  value={formAllergies}
                  onChange={e => setFormAllergies(e.target.value)}
                  placeholder="Ex: Alergia a picada de pulga, sensibilidade a dipirona..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações Comportamentais</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ex: Dócil com pessoas, necessita de focinheira para cortes de unha..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Animal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
