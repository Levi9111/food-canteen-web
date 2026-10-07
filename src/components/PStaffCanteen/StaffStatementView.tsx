import React, { useState } from 'react';
import {
  Calendar,
  Download,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { exportStaffStatementPdf } from '../../utils/staffStatementPdfExport';
import type { IPStaff } from '../../types/canteen.types';

interface StaffStatementViewProps {
  staff: IPStaff;
  onBack: () => void;
  onRecordPayment?: (date: string, amount: number) => void;
}

export const StaffStatementView: React.FC<StaffStatementViewProps> = ({
  staff,
  onBack,
  onRecordPayment,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().split('T')[0],
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Filter daily expenses for the selected month
  const monthlyExpenses = Object.entries(staff.dailyExpenses || {})
    .filter(([date]) => date.startsWith(selectedMonth))
    .sort(([a], [b]) => a.localeCompare(b));

  const currentMonthTotal = monthlyExpenses.reduce(
    (acc, [, amount]) => acc + amount,
    0,
  );

  // Filter payments for the selected month
  const monthlyPayments = (staff.payments || [])
    .filter((p) => p.paymentDate.startsWith(selectedMonth))
    .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));

  const totalPaid = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);

  const preDue = staff.preDue || 0;
  const grossPayable = currentMonthTotal + preDue;
  const netEffectiveBill = grossPayable - totalPaid;

  // Direct PDF Download (Zero Print Dialog)
  const handleDownloadPdf = () => {
    exportStaffStatementPdf({
      staff,
      selectedMonth,
      monthlyExpenses,
      currentMonthTotal,
      monthlyPayments,
      totalPaid,
      preDue,
      netEffectiveBill,
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(paymentAmount) || 0;
    if (num > 0 && onRecordPayment) {
      onRecordPayment(paymentDate, num);
      setPaymentAmount('');
      setShowPaymentForm(false);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="toolbar-strip" style={{ marginBottom: '1.25rem' }}>
        <div className="toolbar-group">
          <button className="tactical-btn secondary" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>BACK TO P-STAFF LIST</span>
          </button>

          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
            <Calendar size={15} color="var(--baf-gold)" />
            <span className="stat-label">MONTH:</span>
            <input
              type="month"
              className="select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="toolbar-group">
          <button
            className="tactical-btn secondary"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            <CreditCard size={15} />
            <span>RECORD PAYMENT</span>
          </button>

          {/* Direct PDF Download */}
          <button className="tactical-btn" onClick={handleDownloadPdf}>
            <Download size={15} />
            <span>DOWNLOAD STATEMENT PDF</span>
          </button>
        </div>
      </div>

      {/* Personnel Profile Header Card */}
      <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tactical-badge">{staff.rank}</span>
              <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                BD/{staff.bdNo}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.5rem' }}>
                {staff.name}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Office: {staff.office || 'RTS HQ'} &nbsp;|&nbsp; Contact: {staff.phone || 'N/A'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="stat-label">BILLING CYCLE</div>
            <div className="stat-value font-mono" style={{ color: 'var(--baf-gold)', fontSize: '1.1rem' }}>
              {selectedMonth}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Payment Form Inline */}
      {showPaymentForm && (
        <form
          onSubmit={handleAddPayment}
          className="room-card"
          style={{
            padding: '1.25rem',
            marginBottom: '1.25rem',
            border: '1.5px solid var(--baf-gold)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--baf-navy)' }}>
            Record Random Payment / Deposit
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="stat-label">PAYMENT DATE</label>
              <input
                type="date"
                required
                className="select-control"
                style={{ width: '100%', marginTop: '0.25rem' }}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <label className="stat-label">AMOUNT (৳)</label>
              <input
                type="number"
                required
                placeholder="0.00"
                className="select-control"
                style={{ width: '100%', marginTop: '0.25rem' }}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="tactical-btn" style={{ flex: 1, height: '36px' }}>
                <CheckCircle size={15} />
                <span>CONFIRM DEPOSIT</span>
              </button>
              <button
                type="button"
                className="tactical-btn secondary"
                style={{ height: '36px' }}
                onClick={() => setShowPaymentForm(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Financial Overview KPI Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">PRE-DUE BALANCE</div>
          <div className="stat-value font-mono" style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>
            ৳{preDue.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">CURRENT MONTH EXPENSE</div>
          <div className="stat-value font-mono" style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>
            ৳{currentMonthTotal.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">TOTAL PAYMENTS PAID</div>
          <div className="stat-value font-mono" style={{ color: 'var(--status-success)', fontSize: '1.3rem' }}>
            ৳{totalPaid.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1rem', borderColor: 'var(--baf-gold)' }}>
          <div className="stat-label">NET EFFECTIVE BILL DUE</div>
          <div
            className="stat-value font-mono"
            style={{
              color: netEffectiveBill > 0 ? 'var(--status-danger)' : 'var(--status-success)',
              fontSize: '1.35rem',
            }}
          >
            ৳{netEffectiveBill.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Two-Column Breakdown: Left (Daily Expenses), Right (Itemized Random Payments) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left: Daily Expenses Table */}
        <div className="room-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText size={16} color="var(--baf-navy)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Daily Expenses ({selectedMonth})</h4>
          </div>

          {monthlyExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No expenses recorded in {selectedMonth}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="matrix-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map(([date, amount], index) => (
                    <tr key={date}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td className="font-mono">{date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={2}>Gross Expense Total</td>
                    <td style={{ textAlign: 'right' }}>৳{currentMonthTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Right: Itemized Random Payments Table */}
        <div className="room-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CreditCard size={16} color="var(--status-success)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Deposits &amp; Payments Record</h4>
          </div>

          {monthlyPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No payments deposited in {selectedMonth}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="matrix-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Date Paid</th>
                    <th>Reference</th>
                    <th style={{ textAlign: 'right' }}>Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyPayments.map((p, index) => (
                    <tr key={p.id || index}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td className="font-mono">{p.paymentDate}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.receiptNo || 'CASH'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--status-success)' }}>
                        ৳{p.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={3}>Total Deposits Paid</td>
                    <td style={{ textAlign: 'right', color: 'var(--status-success)' }}>
                      ৳{totalPaid.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
