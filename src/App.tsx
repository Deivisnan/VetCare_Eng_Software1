import React, { useState, useEffect } from 'react';
import {
  User,
  Animal,
  Tutor,
  Veterinarian,
  Appointment,
  ClinicalRecord,
  VaccinationRecord,
  Prescription,
  Payment,
  NotificationLog
} from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { DashboardView } from './views/DashboardView';
import { AgendaView } from './views/AgendaView';
import { AttendanceView } from './views/AttendanceView';
import { MedicalRecordsView } from './views/MedicalRecordsView';
import { AnimalsView } from './views/AnimalsView';
import { TutorsView } from './views/TutorsView';
import { VeterinariansView } from './views/VeterinariansView';
import { VaccinationsView } from './views/VaccinationsView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { FinancialView } from './views/FinancialView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';
import { UsersView } from './views/UsersView';
import { LoginView } from './views/LoginView';

export default function App() {
  // Current Authenticated User (REQ 02)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return StorageService.getCurrentUser();
  });

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Accessibility / Easy-Read Mode for Seniors and Mobile Comfort
  const [isEasyMode, setIsEasyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vetcare_easy_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile Menu Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleEasyMode = () => {
    setIsEasyMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('vetcare_easy_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Operational Database State
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [animals, setAnimals] = useState<Animal[]>(() => StorageService.getAnimals());
  const [tutors, setTutors] = useState<Tutor[]>(() => StorageService.getTutors());
  const [vets, setVets] = useState<Veterinarian[]>(() => StorageService.getVeterinarians());
  const [appointments, setAppointments] = useState<Appointment[]>(() => StorageService.getAppointments());
  const [records, setRecords] = useState<ClinicalRecord[]>(() => StorageService.getClinicalRecords());
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => StorageService.getVaccinations());
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => StorageService.getPrescriptions());
  const [payments, setPayments] = useState<Payment[]>(() => StorageService.getPayments());
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => StorageService.getNotifications());

  // Deep Navigation State
  const [activeAppointmentToAttend, setActiveAppointmentToAttend] = useState<Appointment | undefined>();
  const [selectedRecordAnimalId, setSelectedRecordAnimalId] = useState<string | undefined>();
  const [selectedPrescriptionToView, setSelectedPrescriptionToView] = useState<Prescription | null>(null);
  const [notificationParams, setNotificationParams] = useState<any>();
  const [agendaOpenNew, setAgendaOpenNew] = useState(false);
  const [animalOpenNew, setAnimalOpenNew] = useState(false);
  const [financialOpenNew, setFinancialOpenNew] = useState(false);
  const [vaccinesOpenNew, setVaccinesOpenNew] = useState(false);

  // Sync state whenever Storage changes
  const reloadData = () => {
    setUsers(StorageService.getUsers());
    setAnimals(StorageService.getAnimals());
    setTutors(StorageService.getTutors());
    setVets(StorageService.getVeterinarians());
    setAppointments(StorageService.getAppointments());
    setRecords(StorageService.getClinicalRecords());
    setVaccinations(StorageService.getVaccinations());
    setPrescriptions(StorageService.getPrescriptions());
    setPayments(StorageService.getPayments());
    setNotifications(StorageService.getNotifications());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      reloadData();
    };

    window.addEventListener('vetcare_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('vetcare_storage_change', handleStorageChange);
    };
  }, []);

  // Login handler (REQ 02)
  const handleLoginSuccess = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Fast switch user (for reviewing permissions)
  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Quick navigation helper
  const handleNavigate = (tab: NavTab, params?: any) => {
    setCurrentTab(tab);
    if (params) {
      if (tab === 'agenda' && params.openNew) setAgendaOpenNew(true);
      if (tab === 'animals' && params.openNew) setAnimalOpenNew(true);
      if (tab === 'financial' && params.openNew) setFinancialOpenNew(true);
      if (tab === 'vaccines' && params.openNew) setVaccinesOpenNew(true);
      if (tab === 'records' && params.animalId) setSelectedRecordAnimalId(params.animalId);
      if (tab === 'notifications') setNotificationParams(params);
    }
  };

  // Start clinical attendance for an appointment (REQ 10)
  const handleStartAttendance = (appointment: Appointment) => {
    setActiveAppointmentToAttend(appointment);
    // Update appointment status to 'Em Atendimento'
    StorageService.saveAppointment({
      ...appointment,
      status: 'Em Atendimento'
    });
    setCurrentTab('attendance');
  };

  // Start clinical attendance for a specific animal directly from medical record
  const handleStartNewAttendanceForAnimal = (animal: Animal) => {
    const currentVet = vets.find(v => v.userId === currentUser?.id) || vets[0];
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      animalId: animal.id,
      tutorId: animal.tutorId,
      vetId: currentVet.id,
      date: today,
      time: nowTime,
      durationMinutes: 45,
      type: 'Rotina',
      status: 'Em Atendimento',
      reason: 'Atendimento clínico iniciado pelo prontuário',
      cost: 180,
      createdAt: new Date().toISOString()
    };

    StorageService.saveAppointment(newApt);
    setActiveAppointmentToAttend(newApt);
    setCurrentTab('attendance');
  };

  // Metric helpers for Navbar and Sidebar badges
  const pendingVaccines = vaccinations.filter(v => v.status === 'Atrasada' || v.status === 'Pendente');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelada');

  // If user is not authenticated, show Login View (REQ 02)
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        users={users}
      />
    );
  }

  // Active Veterinarian ID
  const activeVet = vets.find(v => v.userId === currentUser.id) || vets[0];

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isEasyMode ? 'accessible-mode text-base' : 'text-sm'}`}>
      {/* 1-Row, 3-Zone Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={users}
        pendingVaccineCount={pendingVaccines.length}
        todayAppointmentCount={todayAppointments.length}
        isEasyMode={isEasyMode}
        onToggleEasyMode={toggleEasyMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Domain Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setAgendaOpenNew(false);
            setAnimalOpenNew(false);
            setFinancialOpenNew(false);
            setVaccinesOpenNew(false);
          }}
          userRole={currentUser.role}
          pendingVaccineCount={pendingVaccines.length}
          todayAppointmentCount={todayAppointments.length}
          isEasyMode={isEasyMode}
        />

        {/* Main Content Area: generous bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              appointments={appointments}
              animals={animals}
              tutors={tutors}
              vets={vets}
              payments={payments}
              vaccinations={vaccinations}
              userRole={currentUser.role}
              onStartAttendance={handleStartAttendance}
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaView
              appointments={appointments}
              animals={animals}
              tutors={tutors}
              vets={vets}
              userRole={currentUser.role}
              onStartAttendance={handleStartAttendance}
              onNavigateToRecords={animalId => {
                setSelectedRecordAnimalId(animalId);
                setCurrentTab('records');
              }}
              initialOpenNew={agendaOpenNew}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              currentAppointment={activeAppointmentToAttend}
              appointments={appointments}
              animals={animals}
              tutors={tutors}
              vets={vets}
              currentVetId={activeVet.id}
              onFinishAttendance={() => {
                setActiveAppointmentToAttend(undefined);
                setCurrentTab('dashboard');
              }}
              onSelectAppointmentToAttend={apt => handleStartAttendance(apt)}
            />
          )}

          {currentTab === 'records' && (
            <MedicalRecordsView
              animals={animals}
              tutors={tutors}
              vets={vets}
              records={records}
              vaccinations={vaccinations}
              prescriptions={prescriptions}
              userRole={currentUser.role}
              initialAnimalId={selectedRecordAnimalId}
              onStartNewAttendanceForAnimal={handleStartNewAttendanceForAnimal}
              onViewPrescriptionModal={presc => {
                setSelectedPrescriptionToView(presc);
                setCurrentTab('prescriptions');
              }}
            />
          )}

          {currentTab === 'animals' && (
            <AnimalsView
              animals={animals}
              tutors={tutors}
              userRole={currentUser.role}
              onNavigateToRecords={animalId => {
                setSelectedRecordAnimalId(animalId);
                setCurrentTab('records');
              }}
              onNavigateToAgendaWithAnimal={animal => {
                setCurrentTab('agenda');
                setAgendaOpenNew(true);
              }}
              initialOpenNew={animalOpenNew}
            />
          )}

          {currentTab === 'tutors' && (
            <TutorsView
              tutors={tutors}
              animals={animals}
              userRole={currentUser.role}
              onNavigateToAnimalsWithTutor={tutorId => {
                setCurrentTab('animals');
              }}
              onNavigateToNotificationsForTutor={tutorId => {
                setNotificationParams({ tutorId });
                setCurrentTab('notifications');
              }}
            />
          )}

          {currentTab === 'vets' && (
            <VeterinariansView
              vets={vets}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'vaccines' && (
            <VaccinationsView
              vaccinations={vaccinations}
              animals={animals}
              tutors={tutors}
              vets={vets}
              userRole={currentUser.role}
              onNavigateToNotifications={params => {
                setNotificationParams(params);
                setCurrentTab('notifications');
              }}
              initialOpenNew={vaccinesOpenNew}
            />
          )}

          {currentTab === 'prescriptions' && (
            <PrescriptionsView
              prescriptions={prescriptions}
              animals={animals}
              tutors={tutors}
              vets={vets}
              userRole={currentUser.role}
              currentVetId={activeVet.id}
              initialSelectedPrescription={selectedPrescriptionToView}
            />
          )}

          {currentTab === 'financial' && (
            <FinancialView
              payments={payments}
              tutors={tutors}
              animals={animals}
              appointments={appointments}
              userRole={currentUser.role}
              initialOpenNew={financialOpenNew}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              tutors={tutors}
              animals={animals}
              appointments={appointments}
              vaccinations={vaccinations}
              initialParams={notificationParams}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              appointments={appointments}
              animals={animals}
              tutors={tutors}
              vets={vets}
              records={records}
              payments={payments}
              vaccinations={vaccinations}
            />
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              currentUserId={currentUser.id}
            />
          )}
        </main>
      </div>

      {/* Classical Mobile Bottom Navigation Bar (Smartphones) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setAgendaOpenNew(false);
          setAnimalOpenNew(false);
          setFinancialOpenNew(false);
          setVaccinesOpenNew(false);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        userRole={currentUser.role}
        todayAppointmentCount={todayAppointments.length}
        pendingVaccineCount={pendingVaccines.length}
        isEasyMode={isEasyMode}
      />

      {/* Mobile Drawer Sheet for Secondary Modules & Accessibility */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setAgendaOpenNew(false);
          setAnimalOpenNew(false);
          setFinancialOpenNew(false);
          setVaccinesOpenNew(false);
        }}
        userRole={currentUser.role}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        pendingVaccineCount={pendingVaccines.length}
        isEasyMode={isEasyMode}
        onToggleEasyMode={toggleEasyMode}
      />
    </div>
  );
}
