import React, { useState } from 'react';
import {
  Calendar,
  Search,
  UserPlus,
  Calculator,
  PlusCircle,
  Save,
  X,
  CreditCard,
  User,
  Shield,
} from 'lucide-react';
import type { IPStaff } from '../../types/canteen.types';
import { APP_CONFIG } from '../../constants/canteen.constants';
import { CalculatorModal } from '../CalculatorModal';

interface StaffDailyEntryProps {
  staffList: IPStaff[];
  onAddStaff: (staff: Partial<IPStaff>) => void;
  onRecordExpense: (staffId: string, date: string, amount: number) => void;
  onRecordPayment: (staffId: string, date: string, amount: number) => void;
  onOpenStatement: (staff: IPStaff) => void;
}

export const StaffDailyEntry: React.FC<StaffDailyEntryProps> = ({
  staffList,
  onAddStaff,
  onRecordExpense,
  onRecordPayment,
  onOpenStatement,
}) => {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState('ALL');

  // Expense Modal State (Price Only)
  const [activeExpenseStaff, setActiveExpenseStaff] = useState<IPStaff | null>(null);
  const [expensePrice, setExpensePrice] = useState('');
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Add Particular / Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newBdNo, setNewBdNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState<string>(APP_CONFIG.ranks[0]);
  const [newOffice, setNewOffice] = useState('RTS HQ');
  const [newPhone, setNewPhone] = useState('');
  const [newPreDue, setNewPreDue] = useState('0');

  // Payment Modal State
  const [activePaymentStaff, setActivePaymentStaff] = useState<IPStaff | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Filter staff
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.bdNo.toLowerCase().includes(q) ||
      s.rank.toLowerCase().includes(q) ||
      (s.office && s.office.toLowerCase().includes(q));

    const matchRank = selectedRank === 'ALL' || s.rank === selectedRank;
    return matchQuery && matchRank;
  });

  const handleOpenExpense = (staff: IPStaff) => {
    const existing = staff.dailyExpenses?.[selectedDate] || 0;
    setExpensePrice(existing > 0 ? existing.toString() : '');
    setActiveExpenseStaff(staff);
  };

  const handleSaveExpense = () => {
    if (!activeExpenseStaff) return;
    const num = parseFloat(expensePrice) || 0;
    onRecordExpense(activeExpenseStaff._id || activeExpenseStaff.bdNo, selectedDate, num);
    setActiveExpenseStaff(null);
  };

  const handleSaveNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBdNo.trim() || !newName.trim()) return;

    onAddStaff({
      bdNo: newBdNo.trim(),
      name: newName.trim(),
      rank: newRank,
      office: newOffice.trim(),
      phone: newPhone.trim(),
      preDue: parseFloat(newPreDue) || 0,
      isActive: true,
      dailyExpenses: {},
      payments: [],
    });

    setIsAddStaffModalOpen(false);
    setNewBdNo('');
    setNewName('');
    setNewPhone('');
    setNewPreDue('0');
  };

  const handleSavePayment = () => {
    if (!activePaymentStaff) return;
    const num = parseFloat(paymentAmount) || 0;
    if (num > 0) {
      onRecordPayment(activePaymentStaff._id || activePaymentStaff.bdNo, selectedDate, num);
    }
    setActivePaymentStaff(null);
    setPaymentAmount('');
  };

  return (
    <div>
      {/* Tactical Toolbar */}
      <div className="toolbar-strip">
        <div className="toolbar-group">
          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} color="var(--baf-gold)" />
            <span className="stat-label">DATE:</span>
            <input
              type="date"
              className="select-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Rank Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={15} color="var(--baf-sky-blue)" />
            <span className="stat-label">RANK:</span>
            <select
              className="select-control"
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
            >
              <option value="ALL">All Ranks</option>
              {APP_CONFIG.ranks.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-group">
          {/* Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search BD No, Name..."
              className="select-control"
              style={{ width: '200px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Add Particular / Staff Button */}
          <button
            className="tactical-btn"
            onClick={() => {
              if (searchQuery.trim()) {
                // Pre-fill BD No if purely digits
                if (/^\d+$/.test(searchQuery.trim())) {
                  setNewBdNo(searchQuery.trim());
                } else {
                  setNewName(searchQuery.trim());
                }
              }
              setIsAddStaffModalOpen(true);
            }}
          >
            <UserPlus size={15} />
            <span>+ ADD PARTICULAR</span>
          </button>
        </div>
      </div>

      {/* Empty Search Prompt */}
      {filteredStaff.length === 0 ? (
        <div
          className="room-card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            margin: '2rem auto',
            maxWidth: '550px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(11, 44, 90, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Search size={28} color="var(--baf-navy)" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            No Particulars Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            No personnel found matching &quot;{searchQuery}&quot;. You can add this particular directly to the system.
          </p>
          <button
            className="tactical-btn"
            style={{ margin: '0 auto' }}
            onClick={() => {
              if (searchQuery.trim()) {
                if (/^\d+$/.test(searchQuery.trim())) {
                  setNewBdNo(searchQuery.trim());
                } else {
                  setNewName(searchQuery.trim());
                }
              }
              setIsAddStaffModalOpen(true);
            }}
          >
            <UserPlus size={16} />
            <span>+ ADD PARTICULAR</span>
          </button>
        </div>
      ) : (
        /* Staff Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem',
            marginTop: '1.25rem',
          }}
        >
          {filteredStaff.map((staff) => {
            const todayExpense = staff.dailyExpenses?.[selectedDate] || 0;
            const preDue = staff.preDue || 0;
            const totalPaid = (staff.payments || []).reduce((sum, p) => sum + p.amount, 0);

            // Calculate current month total
            const monthPrefix = selectedDate.substring(0, 7);
            const monthExpenses = Object.entries(staff.dailyExpenses || {})
              .filter(([d]) => d.startsWith(monthPrefix))
              .reduce((sum, [, amt]) => sum + amt, 0);

            const effectiveBalance = monthExpenses + preDue - totalPaid;

            return (
              <div key={staff._id || staff.bdNo} className="room-card">
                <div className="room-header">
                  <div>
                    <span className="tactical-badge" style={{ marginRight: '0.4rem' }}>
                      {staff.rank}
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      BD/{staff.bdNo}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {staff.office || 'RTS'}
                  </span>
                </div>

                <div style={{ margin: '0.5rem 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {staff.name}
                  </div>
                </div>

                <div className="room-stats">
                  <div>
                    <div className="stat-label">EXPENSE ({selectedDate.split('-').slice(1).join('/')})</div>
                    <div
                      className="stat-value font-mono"
                      style={{
                        color: todayExpense > 0 ? 'var(--baf-navy)' : 'var(--text-muted)',
                      }}
                    >
                      ৳{todayExpense.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">EFFECTIVE DUE</div>
                    <div
                      className="stat-value font-mono"
                      style={{
                        color: effectiveBalance > 0 ? 'var(--status-danger)' : 'var(--status-success)',
                      }}
                    >
                      ৳{effectiveBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.4rem',
                    marginTop: '0.75rem',
                  }}
                >
                  {/* Enter Price Modal */}
                  <button
                    className="tactical-btn"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                    onClick={() => handleOpenExpense(staff)}
                  >
                    <PlusCircle size={13} />
                    <span>EXPENSE</span>
                  </button>

                  {/* Record Payment Modal */}
                  <button
                    className="tactical-btn secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                    onClick={() => setActivePaymentStaff(staff)}
                  >
                    <CreditCard size={13} />
                    <span>PAYMENT</span>
                  </button>

                  {/* Statement View */}
                  <button
                    className="tactical-btn secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                    onClick={() => onOpenStatement(staff)}
                  >
                    <User size={13} />
                    <span>STATEMENT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Price-Only Expense Modal with Calculator */}
      {activeExpenseStaff && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
                Add Expense - {activeExpenseStaff.rank} {activeExpenseStaff.name}
              </h3>
              <button
                className="tactical-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => setActiveExpenseStaff(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>BD No: {activeExpenseStaff.bdNo}</span>
                <span>Date: {selectedDate}</span>
              </div>

              {/* Strict Requirement: Price Only field (NO Particulars / Items field) */}
              <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                EXPENSE AMOUNT (৳)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  className="calculator-display"
                  placeholder="0.00"
                  value={expensePrice}
                  onChange={(e) => setExpensePrice(e.target.value)}
                  autoFocus
                  style={{ flex: 1, height: '48px', fontSize: '1.3rem' }}
                />
                <button
                  type="button"
                  className="tactical-btn secondary"
                  title="Open Built-in Calculator"
                  onClick={() => setIsCalcOpen(true)}
                  style={{ padding: '0 0.8rem' }}
                >
                  <Calculator size={20} color="var(--baf-gold)" />
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="tactical-btn secondary"
                onClick={() => setActiveExpenseStaff(null)}
              >
                CANCEL
              </button>
              <button className="tactical-btn" onClick={handleSaveExpense}>
                <Save size={15} />
                <span>SAVE EXPENSE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Built-in Calculator Modal */}
      <CalculatorModal
        isOpen={isCalcOpen}
        initialValue={parseFloat(expensePrice) || 0}
        onApply={(calcTotal) => {
          setExpensePrice(calcTotal.toString());
          setIsCalcOpen(false);
        }}
        onClose={() => setIsCalcOpen(false)}
      />

      {/* Modal 3: Quick Add Particular / Staff */}
      {isAddStaffModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
                Add New Particular / P-Staff
              </h3>
              <button
                className="tactical-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => setIsAddStaffModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewStaff} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="stat-label">BD NO *</label>
                  <input
                    type="text"
                    required
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="e.g. 543210"
                    value={newBdNo}
                    onChange={(e) => setNewBdNo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="stat-label">RANK *</label>
                  <select
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                  >
                    {APP_CONFIG.ranks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label className="stat-label">FULL NAME *</label>
                <input
                  type="text"
                  required
                  className="select-control"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  placeholder="e.g. Md Tariqul Islam"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label className="stat-label">OFFICE / BRANCH</label>
                  <input
                    type="text"
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="e.g. RTS HQ"
                    value={newOffice}
                    onChange={(e) => setNewOffice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="stat-label">PRE-DUE BALANCE (৳)</label>
                  <input
                    type="number"
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="0"
                    value={newPreDue}
                    onChange={(e) => setNewPreDue(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label className="stat-label">CONTACT PHONE</label>
                <input
                  type="tel"
                  className="select-control"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  placeholder="017xxxxxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="tactical-btn secondary"
                  onClick={() => setIsAddStaffModalOpen(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="tactical-btn">
                  <UserPlus size={15} />
                  <span>REGISTER PARTICULAR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Record Random Payment */}
      {activePaymentStaff && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
                Deposit / Random Payment
              </h3>
              <button
                className="tactical-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => setActivePaymentStaff(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                <strong>{activePaymentStaff.rank} {activePaymentStaff.name}</strong> (BD/{activePaymentStaff.bdNo})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Payment Date: {selectedDate}
              </div>

              <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                PAYMENT AMOUNT (৳)
              </label>
              <input
                type="number"
                className="calculator-display"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                autoFocus
                style={{ width: '100%', height: '48px', fontSize: '1.3rem' }}
              />
            </div>

            <div className="modal-actions">
              <button
                className="tactical-btn secondary"
                onClick={() => setActivePaymentStaff(null)}
              >
                CANCEL
              </button>
              <button className="tactical-btn" onClick={handleSavePayment}>
                <CreditCard size={15} />
                <span>SAVE PAYMENT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
