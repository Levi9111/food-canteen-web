import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Layers,
  Table,
  Users,
  FileText,
  PieChart,
  ShieldCheck,
  Building,
  Search,
  Settings,
} from 'lucide-react';
import { Header } from './components/Header';
import { AdminContactModal } from './components/AdminContactModal';
import { DailyRoomGrid } from './components/RecruitsCanteen/DailyRoomGrid';
import { MonthlyMatrixView } from './components/RecruitsCanteen/MonthlyMatrixView';
import { StaffDailyEntry } from './components/PStaffCanteen/StaffDailyEntry';
import { StaffStatementView } from './components/PStaffCanteen/StaffStatementView';
import { PStaffMonthlyMatrixView } from './components/PStaffCanteen/PStaffMonthlyMatrixView';
import { AuditDashboard } from './components/MonthlyAudit/AuditDashboard';
import { SettingsHub } from './components/Settings/SettingsHub';
import { SquadronManagementView } from './components/Settings/SquadronManagementView';
import { DutyOperatorManagementView } from './components/Settings/DutyOperatorManagementView';
import { StaffPublicLookup } from './components/PublicPortal/StaffPublicLookup';
import type { IUser, ISquadron, IEntry, IPStaff, TSettingsSubView } from './types/canteen.types';
import { cascadeSquadronRename } from './utils/squadronCascade';
import {
  validateSquadronDeletion,
  validateRoomAddition,
  validateRoomDeletion,
} from './utils/structureSafety';

const queryClient = new QueryClient();

// Initial seed data: Cpl Shanjid Ahmad as NCOIC, JCOIC vacant
const INITIAL_CURRENT_USER: IUser = {
  _id: 'usr-1',
  userId: 'usr-1',
  username: 'ncoic',
  name: 'Shanjid Ahmad',
  rank: 'Cpl',
  trade: 'E&I Fitter',
  bdNo: 'BD/472770',
  role: 'NCOIC',
  isActive: true,
};

const INITIAL_OPERATORS: IUser[] = [
  INITIAL_CURRENT_USER,
];

const INITIAL_ENTRIES: IEntry[] = [
  { entryNo: '54', status: 'ACTIVE' },
  { entryNo: '53', status: 'PASSED_OUT' },
  { entryNo: '52', status: 'PASSED_OUT' },
];

const INITIAL_SQUADRONS: ISquadron[] = [
  {
    name: 'Sadruddin',
    rooms: Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`),
    isActive: true,
  },
  {
    name: 'Liakot Ali',
    rooms: Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`),
    isActive: true,
  },
  {
    name: 'Nurul Haque',
    rooms: Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`),
    isActive: true,
  },
  {
    name: 'Mansur Ali',
    rooms: Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`),
    isActive: true,
  },
];

const INITIAL_STAFF: IPStaff[] = [
  {
    _id: 'st-1',
    name: 'Md Anisur Rahman',
    rank: 'Sgt',
    bdNo: '519820',
    office: 'Flight Line',
    phone: '01711223344',
    isActive: true,
    preDue: 1250,
    dailyExpenses: {
      '2026-10-01': 120,
      '2026-10-02': 85,
      '2026-10-03': 150,
      '2026-10-04': 95,
      '2026-10-05': 110,
      '2026-10-06': 140,
      '2026-10-07': 75,
    },
    payments: [
      { id: 'p-1', paymentDate: '2026-10-03', amount: 500, receiptNo: 'BKASH-7412' },
    ],
  },
  {
    _id: 'st-2',
    name: 'Khorshed Alam',
    rank: 'Cpl',
    bdNo: '528410',
    office: 'Armament',
    phone: '01811334455',
    isActive: true,
    preDue: 450,
    dailyExpenses: {
      '2026-10-01': 80,
      '2026-10-03': 120,
      '2026-10-05': 65,
      '2026-10-07': 90,
    },
    payments: [
      { id: 'p-2', paymentDate: '2026-10-02', amount: 300, receiptNo: 'CASH-01' },
    ],
  },
  {
    _id: 'st-3',
    name: 'Md Rafiqul Hasan',
    rank: 'WO',
    bdNo: '492301',
    office: 'RTS HQ',
    phone: '01911445566',
    isActive: true,
    preDue: 2100,
    dailyExpenses: {
      '2026-10-01': 210,
      '2026-10-02': 180,
      '2026-10-04': 250,
      '2026-10-06': 190,
    },
    payments: [
      { id: 'p-3', paymentDate: '2026-10-05', amount: 1500, receiptNo: 'BANK-TR09' },
    ],
  },
  {
    _id: 'st-4',
    name: 'Shamsul Huda',
    rank: 'MWO',
    bdNo: '475892',
    office: 'Training Wing',
    phone: '01711998877',
    isActive: true,
    preDue: 0,
    dailyExpenses: {
      '2026-10-02': 140,
      '2026-10-04': 110,
      '2026-10-07': 130,
    },
    payments: [],
  },
];

type TNavTab =
  | 'RECRUITS_DAILY'
  | 'RECRUITS_MATRIX'
  | 'STAFF_DAILY'
  | 'STAFF_MATRIX'
  | 'STAFF_STATEMENT'
  | 'AUDIT'
  | 'SETTINGS'
  | 'OPERATORS'
  | 'STRUCTURE'
  | 'STAFF_PORTAL';

export function CanteenApp() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('baf_canteen_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('baf_canteen_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Nav Tab state
  const [activeTab, setActiveTab] = useState<TNavTab>('RECRUITS_DAILY');

  // Sub-view within Settings tab
  const [settingsSubView, setSettingsSubView] = useState<TSettingsSubView>('HUB');

  // Contact Modal state
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [currentUser, setCurrentUser] = useState<IUser>(() => {
    const saved = localStorage.getItem('baf_currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Md Tariqul Islam' || parsed.username === 'ncoic.tariqul') {
          return INITIAL_CURRENT_USER;
        }
        return parsed;
      } catch {
        // Ignore JSON error
      }
    }
    return INITIAL_CURRENT_USER;
  });

  const [operators, setOperators] = useState<IUser[]>(() => {
    const saved = localStorage.getItem('baf_operators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed
            .map((op: IUser) => {
              if (op.name === 'Md Tariqul Islam' || op.username === 'ncoic.tariqul') {
                return INITIAL_CURRENT_USER;
              }
              return op;
            })
            .filter((op: IUser) => op.role !== 'JCOIC');
          if (sanitized.length > 0) return sanitized;
        }
      } catch {
        // Ignore JSON error
      }
    }
    return INITIAL_OPERATORS;
  });

  const [entries, setEntries] = useState<IEntry[]>(() => {
    const saved = localStorage.getItem('baf_entries');
    return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
  });

  const [activeEntry, setActiveEntry] = useState<string>('54');

  const [squadrons, setSquadrons] = useState<ISquadron[]>(() => {
    const saved = localStorage.getItem('baf_squadrons');
    return saved ? JSON.parse(saved) : INITIAL_SQUADRONS;
  });

  const [activeSquadron, setActiveSquadron] = useState<string>('Sadruddin');

  const [staffList, setStaffList] = useState<IPStaff[]>(() => {
    const saved = localStorage.getItem('baf_staffList');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Selected staff for statement view
  const [statementStaff, setStatementStaff] = useState<IPStaff>(staffList[0]);

  // Recruits Expenses state: key is `entry|sqn|room|date` -> amount
  const [recruitsExpenses, setRecruitsExpenses] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('baf_recruitsExpenses');
    if (saved) return JSON.parse(saved);
    // Seed sample expenses
    const sample: Record<string, number> = {};
    const today = new Date().toISOString().split('T')[0];
    sample[`54|Sadruddin|Room 1|${today}`] = 340;
    sample[`54|Sadruddin|Room 2|${today}`] = 290;
    sample[`54|Sadruddin|Room 3|${today}`] = 410;
    sample[`54|Liakot Ali|Room 1|${today}`] = 270;
    return sample;
  });

  // Recruits Pre-Dues state: key is `entry|sqn|room` -> amount
  const [recruitsPreDues, setRecruitsPreDues] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('baf_recruitsPreDues');
    if (saved) return JSON.parse(saved);
    return {
      '54|Sadruddin|Room 1': 1500,
      '54|Sadruddin|Room 2': 800,
      '54|Sadruddin|Room 4': 1200,
      '54|Liakot Ali|Room 1': 950,
    };
  });

  // Recruits Paid state: key is `entry|sqn|room` -> amount
  const [recruitsPaid, setRecruitsPaid] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('baf_recruitsPaid');
    if (saved) return JSON.parse(saved);
    return {
      '54|Sadruddin|Room 1': 1000,
      '54|Sadruddin|Room 2': 500,
    };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('baf_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('baf_operators', JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem('baf_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('baf_squadrons', JSON.stringify(squadrons));
  }, [squadrons]);

  useEffect(() => {
    localStorage.setItem('baf_staffList', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('baf_recruitsExpenses', JSON.stringify(recruitsExpenses));
  }, [recruitsExpenses]);

  useEffect(() => {
    localStorage.setItem('baf_recruitsPreDues', JSON.stringify(recruitsPreDues));
  }, [recruitsPreDues]);

  useEffect(() => {
    localStorage.setItem('baf_recruitsPaid', JSON.stringify(recruitsPaid));
  }, [recruitsPaid]);

  // Recruits Expense Handler
  const handleSaveRecruitExpense = (room: string, date: string, amount: number) => {
    const key = `${activeEntry}|${activeSquadron}|${room}|${date}`;
    setRecruitsExpenses((prev) => ({
      ...prev,
      [key]: amount,
    }));
  };

  // P-Staff Handlers
  const handleAddStaff = (newStaffData: Partial<IPStaff>) => {
    const newStaff: IPStaff = {
      _id: `st-${Date.now()}`,
      bdNo: newStaffData.bdNo || '',
      name: newStaffData.name || '',
      rank: newStaffData.rank || 'Civilian',
      office: newStaffData.office || 'RTS',
      phone: newStaffData.phone || '',
      isActive: true,
      preDue: newStaffData.preDue || 0,
      dailyExpenses: {},
      payments: [],
    };
    setStaffList((prev) => [...prev, newStaff]);
  };

  const handleRecordStaffExpense = (staffIdOrBd: string, date: string, amount: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s._id === staffIdOrBd || s.bdNo === staffIdOrBd) {
          const updatedDaily = { ...(s.dailyExpenses || {}), [date]: amount };
          return { ...s, dailyExpenses: updatedDaily };
        }
        return s;
      }),
    );
  };

  const handleRecordStaffPayment = (staffIdOrBd: string, date: string, amount: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s._id === staffIdOrBd || s.bdNo === staffIdOrBd) {
          const newPayment = {
            id: `p-${Date.now()}`,
            paymentDate: date,
            amount,
            receiptNo: `REC-${Date.now().toString().slice(-4)}`,
          };
          const updatedPayments = [...(s.payments || []), newPayment];
          return { ...s, payments: updatedPayments };
        }
        return s;
      }),
    );
  };

  // Operator Handlers
  const handleAddOperator = async (
    op: Partial<IUser> & { password?: string },
  ): Promise<{ success: boolean; error?: string }> => {
    // Check role count
    const count = operators.filter((o) => o.role === op.role).length;
    if (count >= 1) {
      return {
        success: false,
        error: `HTTP 409 Conflict: An operator with role ${op.role} already exists. Maximum 1 is permitted.`,
      };
    }

    const newOp: IUser = {
      _id: `usr-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      username: op.username || '',
      name: op.name || '',
      rank: op.rank || 'Sgt',
      trade: op.trade || '',
      bdNo: op.bdNo || '',
      role: op.role || 'NCOIC',
      isActive: true,
    };

    setOperators((prev) => [...prev, newOp]);
    return { success: true };
  };

  const handleDeleteOperator = async (
    id: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setOperators((prev) => {
      const remaining = prev.filter((o) => (o._id || o.userId || o.id) !== id);
      return remaining;
    });
    // If the currently active session user was the one removed, revert to baseline NCOIC
    if (currentUser._id === id || currentUser.userId === id || currentUser.id === id) {
      setCurrentUser(INITIAL_CURRENT_USER);
    }
    return { success: true };
  };

  // Switch Operator Duty Role
  const handleSwitchDutyRole = () => {
    const nextRole = currentUser.role === 'NCOIC' ? 'JCOIC' : 'NCOIC';
    const target = operators.find((o) => o.role === nextRole);
    if (target) {
      setCurrentUser(target);
    } else {
      alert(`${nextRole} position is currently vacant. You can appoint one in Duty Appointments.`);
    }
  };

  // Structure Handlers
  const handleAddEntry = (entryNo: string) => {
    if (entries.some((e) => e.entryNo === entryNo)) return;
    setEntries((prev) => [{ entryNo, status: 'ACTIVE' }, ...prev]);
    setActiveEntry(entryNo);
  };

  const handleAddSquadron = (name: string, rooms: string[]) => {
    if (squadrons.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSquadrons((prev) => [...prev, { name, rooms, isActive: true }]);
  };

  const handleRenameSquadron = (oldName: string, newName: string) => {
    const cascade = cascadeSquadronRename(
      oldName,
      newName,
      squadrons,
      recruitsExpenses,
      recruitsPreDues,
      recruitsPaid,
    );

    setSquadrons(cascade.updatedSquadrons);
    setRecruitsExpenses(cascade.updatedExpenses);
    setRecruitsPreDues(cascade.updatedPreDues);
    setRecruitsPaid(cascade.updatedPaid);

    if (activeSquadron.toLowerCase() === oldName.trim().toLowerCase()) {
      setActiveSquadron(newName.trim());
    }

    return {
      success: true,
      affectedCount: cascade.affectedLedgerCount,
    };
  };

  const handleDeleteSquadron = (name: string) => {
    const validation = validateSquadronDeletion(name, squadrons);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const remaining = squadrons.filter(
      (s) => s.name.toLowerCase() !== name.trim().toLowerCase(),
    );
    setSquadrons(remaining);

    if (activeSquadron.toLowerCase() === name.trim().toLowerCase()) {
      setActiveSquadron(remaining[0]?.name || '');
    }

    return { success: true };
  };

  const handleAddRoom = (sqnName: string, roomName: string) => {
    const sqn = squadrons.find((s) => s.name === sqnName);
    if (!sqn) return { success: false, error: 'Squadron not found' };

    const validation = validateRoomAddition(roomName, sqn.rooms);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    setSquadrons((prev) =>
      prev.map((s) => {
        if (s.name === sqnName && !s.rooms.includes(roomName.trim())) {
          return { ...s, rooms: [...s.rooms, roomName.trim()] };
        }
        return s;
      }),
    );
    return { success: true };
  };

  const handleDeleteRoom = (sqnName: string, roomName: string) => {
    const sqn = squadrons.find((s) => s.name === sqnName);
    if (!sqn) return { success: false, error: 'Squadron not found' };

    const validation = validateRoomDeletion(roomName, sqn.rooms);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    setSquadrons((prev) =>
      prev.map((s) => {
        if (s.name === sqnName) {
          return {
            ...s,
            rooms: s.rooms.filter(
              (r) => r.trim().toLowerCase() !== roomName.trim().toLowerCase(),
            ),
          };
        }
        return s;
      }),
    );
    return { success: true };
  };

  // Get current active squadron rooms
  const currentSqn = squadrons.find((s) => s.name === activeSquadron) || squadrons[0];
  const activeRooms = currentSqn?.rooms || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        activeRole={currentUser.role}
        onRoleSwitch={handleSwitchDutyRole}
        onOpenPaymentInfo={() => setIsAdminContactOpen(true)}
        onLogout={() => {
          localStorage.clear();
          window.location.reload();
        }}
      />

      {/* Admin Credentials Modal */}
      <AdminContactModal
        isOpen={isAdminContactOpen}
        onClose={() => setIsAdminContactOpen(false)}
      />

      {/* Main Tactical Navigation Bar */}
      <div className="tactical-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'RECRUITS_DAILY' ? 'active' : ''}`}
          onClick={() => setActiveTab('RECRUITS_DAILY')}
        >
          <Layers size={15} />
          <span>RECRUITS DAILY</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'RECRUITS_MATRIX' ? 'active' : ''}`}
          onClick={() => setActiveTab('RECRUITS_MATRIX')}
        >
          <Table size={15} />
          <span>RECRUITS MATRIX</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'STAFF_DAILY' ? 'active' : ''}`}
          onClick={() => setActiveTab('STAFF_DAILY')}
        >
          <Users size={15} />
          <span>P-STAFF DAILY</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'STAFF_MATRIX' ? 'active' : ''}`}
          onClick={() => setActiveTab('STAFF_MATRIX')}
        >
          <Table size={15} />
          <span>P-STAFF MATRIX</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'STAFF_STATEMENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('STAFF_STATEMENT')}
        >
          <FileText size={15} />
          <span>STAFF STATEMENT</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          <PieChart size={15} />
          <span>MONTHLY AUDIT</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('SETTINGS');
            setSettingsSubView('HUB');
          }}
        >
          <Settings size={15} />
          <span>SETTINGS HUB</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'OPERATORS' ? 'active' : ''}`}
          onClick={() => setActiveTab('OPERATORS')}
        >
          <ShieldCheck size={15} />
          <span>DUTY APPOINTMENTS</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'STRUCTURE' ? 'active' : ''}`}
          onClick={() => setActiveTab('STRUCTURE')}
        >
          <Building size={15} />
          <span>SQUADRONS &amp; ROOMS</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'STAFF_PORTAL' ? 'active' : ''}`}
          onClick={() => setActiveTab('STAFF_PORTAL')}
        >
          <Search size={15} />
          <span>STAFF LOOKUP PORTAL</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <main style={{ flex: 1, padding: '1.25rem 2rem 3rem' }}>
        {/* TAB 1: Recruits Daily Room Grid */}
        {activeTab === 'RECRUITS_DAILY' && (
          <DailyRoomGrid
            activeEntry={activeEntry}
            entries={entries.map((e) => e.entryNo)}
            activeSquadron={activeSquadron}
            squadrons={squadrons.map((s) => s.name)}
            rooms={activeRooms}
            onSelectEntry={(ent) => setActiveEntry(ent)}
            onSelectSquadron={(sqn) => setActiveSquadron(sqn)}
            expenses={recruitsExpenses}
            roomPreDues={recruitsPreDues}
            roomPaid={recruitsPaid}
            onSaveExpense={handleSaveRecruitExpense}
          />
        )}

        {/* TAB 2: Recruits Monthly Matrix */}
        {activeTab === 'RECRUITS_MATRIX' && (
          <MonthlyMatrixView
            activeEntry={activeEntry}
            entries={entries.map((e) => e.entryNo)}
            activeSquadron={activeSquadron}
            squadrons={squadrons.map((s) => s.name)}
            rooms={activeRooms}
            onSelectEntry={(ent) => setActiveEntry(ent)}
            onSelectSquadron={(sqn) => setActiveSquadron(sqn)}
            expenses={recruitsExpenses}
            roomPreDues={recruitsPreDues}
            roomPaid={recruitsPaid}
            onCellClick={(room, date) => {
              const currentVal =
                recruitsExpenses[
                  `${activeEntry}|${activeSquadron}|${room}|${date}`
                ] || 0;
              const input = window.prompt(
                `Enter price for ${room} on ${date} (৳):`,
                currentVal.toString(),
              );
              if (input !== null) {
                const num = parseFloat(input) || 0;
                handleSaveRecruitExpense(room, date, num);
              }
            }}
          />
        )}

        {/* TAB 3: P-Staff Daily Entry */}
        {activeTab === 'STAFF_DAILY' && (
          <StaffDailyEntry
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onRecordExpense={handleRecordStaffExpense}
            onRecordPayment={handleRecordStaffPayment}
            onOpenStatement={(st) => {
              setStatementStaff(st);
              setActiveTab('STAFF_STATEMENT');
            }}
          />
        )}

        {/* TAB 4: P-Staff Monthly Matrix */}
        {activeTab === 'STAFF_MATRIX' && (
          <PStaffMonthlyMatrixView
            staffList={staffList}
            onSelectStaff={(st) => {
              setStatementStaff(st);
              setActiveTab('STAFF_STATEMENT');
            }}
          />
        )}

        {/* TAB 5: P-Staff Statements View */}
        {activeTab === 'STAFF_STATEMENT' && (
          <StaffStatementView
            staff={
              staffList.find(
                (s) => s._id === statementStaff._id || s.bdNo === statementStaff.bdNo,
              ) || statementStaff
            }
            onBack={() => setActiveTab('STAFF_DAILY')}
            onRecordPayment={(date, amt) =>
              handleRecordStaffPayment(
                statementStaff._id || statementStaff.bdNo,
                date,
                amt,
              )
            }
          />
        )}

        {/* TAB 5: Monthly Audit Dashboard */}
        {activeTab === 'AUDIT' && (
          <AuditDashboard
            activeEntry={activeEntry}
            squadrons={squadrons.map((s) => s.name)}
            rooms={activeRooms}
            recruitsExpenses={recruitsExpenses}
            recruitsPreDues={recruitsPreDues}
            recruitsPaid={recruitsPaid}
            staffList={staffList}
          />
        )}

        {/* TAB 6: Unified Settings Hub */}
        {activeTab === 'SETTINGS' && (
          <div>
            {settingsSubView === 'HUB' && (
              <SettingsHub
                squadrons={squadrons}
                operators={operators}
                entries={entries}
                activeEntryNo={activeEntry}
                onNavigateToSquadrons={() => setSettingsSubView('SQUADRONS')}
                onNavigateToOperators={() => setSettingsSubView('OPERATORS')}
              />
            )}

            {settingsSubView === 'SQUADRONS' && (
              <SquadronManagementView
                entries={entries}
                activeEntryNo={activeEntry}
                onSetActiveEntry={(ent) => setActiveEntry(ent)}
                onAddEntry={handleAddEntry}
                squadrons={squadrons}
                activeSquadronName={activeSquadron}
                onSelectSquadron={(sqn) => setActiveSquadron(sqn)}
                onAddSquadron={handleAddSquadron}
                onRenameSquadron={handleRenameSquadron}
                onDeleteSquadron={handleDeleteSquadron}
                onAddRoom={handleAddRoom}
                onDeleteRoom={handleDeleteRoom}
                onBackToHub={() => setSettingsSubView('HUB')}
              />
            )}

            {settingsSubView === 'OPERATORS' && (
              <DutyOperatorManagementView
                currentUser={currentUser}
                operators={operators}
                onAddOperator={handleAddOperator}
                onDeleteOperator={handleDeleteOperator}
                onBackToHub={() => setSettingsSubView('HUB')}
              />
            )}
          </div>
        )}

        {/* TAB 7: Dedicated Duty Appointments Page */}
        {activeTab === 'OPERATORS' && (
          <DutyOperatorManagementView
            currentUser={currentUser}
            operators={operators}
            onAddOperator={handleAddOperator}
            onDeleteOperator={handleDeleteOperator}
            onBackToHub={() => {
              setActiveTab('SETTINGS');
              setSettingsSubView('HUB');
            }}
          />
        )}

        {/* TAB 8: Dedicated Squadrons & Rooms Page */}
        {activeTab === 'STRUCTURE' && (
          <SquadronManagementView
            entries={entries}
            activeEntryNo={activeEntry}
            onSetActiveEntry={(ent) => setActiveEntry(ent)}
            onAddEntry={handleAddEntry}
            squadrons={squadrons}
            activeSquadronName={activeSquadron}
            onSelectSquadron={(sqn) => setActiveSquadron(sqn)}
            onAddSquadron={handleAddSquadron}
            onRenameSquadron={handleRenameSquadron}
            onDeleteSquadron={handleDeleteSquadron}
            onAddRoom={handleAddRoom}
            onDeleteRoom={handleDeleteRoom}
            onBackToHub={() => {
              setActiveTab('SETTINGS');
              setSettingsSubView('HUB');
            }}
          />
        )}

        {/* TAB 8: Staff Public Lookup Portal */}
        {activeTab === 'STAFF_PORTAL' && (
          <StaffPublicLookup
            staffList={staffList}
            onOpenAdminContact={() => setIsAdminContactOpen(true)}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CanteenApp />
    </QueryClientProvider>
  );
}
