import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  Download,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Shield,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IPStaff } from '../../types/canteen.types';

interface StaffPublicLookupProps {
  staffList: IPStaff[];
  onOpenAdminContact: () => void;
}

export const StaffPublicLookup: React.FC<StaffPublicLookupProps> = ({
  staffList,
  onOpenAdminContact,
}) => {
  const [bdQuery, setBdQuery] = useState('');
  const [activeStaff, setActiveStaff] = useState<IPStaff | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = bdQuery.trim().replace(/^BD\/?/i, '');
    const found = staffList.find(
      (s) =>
        s.bdNo.toLowerCase() === cleaned.toLowerCase() ||
        s.name.toLowerCase().includes(cleaned.toLowerCase()),
    );
    setActiveStaff(found || null);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Calculations for activeStaff
  const monthlyExpenses = activeStaff
    ? Object.entries(activeStaff.dailyExpenses || {})
        .filter(([date]) => date.startsWith(selectedMonth))
        .sort(([a], [b]) => a.localeCompare(b))
    : [];

  const currentMonthTotal = monthlyExpenses.reduce(
    (acc, [, amount]) => acc + amount,
    0,
  );

  const monthlyPayments = activeStaff
    ? (activeStaff.payments || [])
        .filter((p) => p.paymentDate.startsWith(selectedMonth))
        .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate))
    : [];

  const totalPaid = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
  const preDue = activeStaff?.preDue || 0;
  const grossPayable = currentMonthTotal + preDue;
  const netEffectiveBill = grossPayable - totalPaid;

  // Direct PDF statement download
  const handleDownloadPdf = () => {
    if (!activeStaff) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(11, 44, 90);
    doc.text('BANGLADESH AIR FORCE', 105, 16, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('RECRUITS TRAINING SCHOOL (RTS)', 105, 23, { align: 'center' });
    doc.text('P-STAFF CANTEEN ACCOUNT STATEMENT', 105, 29, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Billing Month: ${selectedMonth}   |   Issued: ${new Date().toLocaleString()}`,
      105,
      35,
      { align: 'center' },
    );

    // Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 182, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`BD No: ${activeStaff.bdNo}`, 18, 47);
    doc.text(`Rank: ${activeStaff.rank}`, 75, 47);
    doc.text(`Name: ${activeStaff.name}`, 130, 47);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Office: ${activeStaff.office || 'RTS HQ'}`, 18, 56);
    doc.text(`Contact: ${activeStaff.phone || 'N/A'}`, 75, 56);
    doc.text(`Status: ACTIVE PARTICULAR`, 130, 56);

    const expenseRows = monthlyExpenses.map(([date, amount], idx) => [
      String(idx + 1),
      date,
      `${amount.toFixed(2)}৳`,
    ]);

    if (expenseRows.length === 0) {
      expenseRows.push(['-', 'No expenses recorded this month', '0.00৳']);
    }

    autoTable(doc, {
      startY: 68,
      head: [['SL', 'Date', 'Expense Amount']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [11, 44, 90], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80, halign: 'center' },
        2: { cellWidth: 87, halign: 'right', fontStyle: 'bold' },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY = (doc as any).lastAutoTable.finalY + 8;
    const paymentRows = monthlyPayments.map((p, idx) => [
      String(idx + 1),
      p.paymentDate,
      p.receiptNo || 'RTS-CASH',
      `${p.amount.toFixed(2)}৳`,
    ]);

    if (paymentRows.length === 0) {
      paymentRows.push(['-', 'No deposit payments recorded this month', '-', '0.00৳']);
    }

    autoTable(doc, {
      startY: lastY,
      head: [['SL', 'Payment Date', 'Reference', 'Amount Paid']],
      body: paymentRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50, halign: 'center' },
        2: { cellWidth: 55, halign: 'center' },
        3: { cellWidth: 62, halign: 'right', fontStyle: 'bold' },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalTableY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, finalTableY, 182, 36, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('Pre-Due (Brought Forward):', 20, finalTableY + 8);
    doc.text(`${preDue.toFixed(2)}৳`, 185, finalTableY + 8, { align: 'right' });

    doc.text('Current Month Expense:', 20, finalTableY + 15);
    doc.text(`${currentMonthTotal.toFixed(2)}৳`, 185, finalTableY + 15, { align: 'right' });

    doc.text('Total Paid to Date:', 20, finalTableY + 22);
    doc.text(`- ${totalPaid.toFixed(2)}৳`, 185, finalTableY + 22, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 44, 90);
    doc.text('NET EFFECTIVE BILL PAYABLE:', 20, finalTableY + 31);
    doc.text(`${netEffectiveBill.toFixed(2)}৳`, 185, finalTableY + 31, { align: 'right' });

    const fileName = `BAF_RTS_Statement_${activeStaff.bdNo}_${selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div>
      {/* Hero Search Box */}
      <div
        className="room-card"
        style={{
          padding: '2rem',
          maxWidth: '680px',
          margin: '0 auto 1.5rem',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(11, 44, 90, 0.08)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Shield size={24} color="var(--baf-navy)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--baf-navy)' }}>
            P-Staff Canteen Self-Service Portal
          </h2>
        </div>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Search your BD Number to review your monthly mess and canteen ledger, verified payments, and outstanding bill.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', margin: '0 auto' }}>
          <input
            type="text"
            required
            placeholder="Enter BD Number (e.g. 543210)..."
            className="select-control font-mono"
            style={{ flex: 1, height: '44px', fontSize: '1.05rem', padding: '0 1rem' }}
            value={bdQuery}
            onChange={(e) => setBdQuery(e.target.value)}
          />
          <button type="submit" className="tactical-btn" style={{ height: '44px', padding: '0 1.25rem' }}>
            <Search size={16} />
            <span>LOOKUP</span>
          </button>
        </form>
      </div>

      {/* No Results Alert */}
      {hasSearched && !activeStaff && (
        <div
          className="room-card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto',
            border: '1px dashed var(--status-danger)',
          }}
        >
          <div style={{ color: 'var(--status-danger)', fontWeight: 600, marginBottom: '0.5rem' }}>
            No Record Found
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            No personnel found matching BD &quot;{bdQuery}&quot;. Please ensure you have entered your correct BD number or contact the NCOIC Canteen.
          </p>
        </div>
      )}

      {/* Personnel Result Details */}
      {activeStaff && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Top Controls Toolbar */}
          <div className="toolbar-strip" style={{ marginBottom: '1.25rem' }}>
            <div className="toolbar-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="var(--baf-gold)" />
                <span className="stat-label">BILLING CYCLE:</span>
                <input
                  type="month"
                  className="select-control"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-group">
              <button className="tactical-btn secondary" onClick={onOpenAdminContact}>
                <CreditCard size={15} />
                <span>PAYMENT CREDENTIALS</span>
              </button>
              <button className="tactical-btn" onClick={handleDownloadPdf}>
                <Download size={15} />
                <span>DOWNLOAD STATEMENT PDF</span>
              </button>
            </div>
          </div>

          {/* Personnel Identity Banner */}
          <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="tactical-badge">{activeStaff.rank}</span>
                  <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    BD/{activeStaff.bdNo}
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.5rem' }}>
                    {activeStaff.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Branch: {activeStaff.office || 'RTS HQ'} &nbsp;|&nbsp; Mobile: {activeStaff.phone || 'N/A'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="tactical-badge" style={{ backgroundColor: 'rgba(22, 101, 52, 0.15)', color: 'var(--status-success)' }}>
                  ACCOUNT VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown KPIs */}
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
              <div className="stat-label">MONTHLY EXPENSES</div>
              <div className="stat-value font-mono" style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>
                ৳{currentMonthTotal.toLocaleString()}
              </div>
            </div>

            <div className="room-card" style={{ padding: '1rem' }}>
              <div className="stat-label">PAYMENTS RECORDED</div>
              <div className="stat-value font-mono" style={{ color: 'var(--status-success)', fontSize: '1.3rem' }}>
                ৳{totalPaid.toLocaleString()}
              </div>
            </div>

            <div className="room-card" style={{ padding: '1rem', borderColor: 'var(--baf-gold)' }}>
              <div className="stat-label">NET EFFECTIVE BILL</div>
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

          {/* Admin Payment Accounts Box (Copiable Credentials) */}
          <div
            className="room-card"
            style={{
              padding: '1.25rem',
              marginBottom: '1.5rem',
              border: '1.5px solid var(--baf-gold)',
              backgroundColor: 'rgba(217, 119, 6, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CreditCard size={18} color="var(--baf-gold)" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--baf-navy)' }}>
                Official Canteen Payment Credentials (Click to Copy)
              </h3>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              After completing your payment via bKash or Trust Bank, please inform NCOIC Canteen via WhatsApp with your BD No and transaction ID.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
              {/* bKash */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div className="stat-label">bKash Number (Personal)</div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    01711-000000
                  </div>
                </div>
                <button
                  className="tactical-btn secondary"
                  style={{ padding: '0.35rem 0.6rem' }}
                  onClick={() => copyToClipboard('01711000000', 'bkash')}
                >
                  {copiedField === 'bkash' ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Bank Account */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div className="stat-label">Trust Bank Account</div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    0012-0310001234
                  </div>
                </div>
                <button
                  className="tactical-btn secondary"
                  style={{ padding: '0.35rem 0.6rem' }}
                  onClick={() => copyToClipboard('0012-0310001234', 'bank')}
                >
                  {copiedField === 'bank' ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                </button>
              </div>

              {/* WhatsApp */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div className="stat-label">WhatsApp Helpline</div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    +880 1711-000000
                  </div>
                </div>
                <a
                  href="https://wa.me/8801711000000"
                  target="_blank"
                  rel="noreferrer"
                  className="tactical-btn secondary"
                  style={{ padding: '0.35rem 0.6rem', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Tables: Left (Daily Expenses) & Right (Random Deposits) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Expenses */}
            <div className="room-card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
                Daily Expenses ({selectedMonth})
              </h4>
              {monthlyExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No expenses recorded in {selectedMonth}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="matrix-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyExpenses.map(([date, amt]) => (
                        <tr key={date}>
                          <td className="font-mono">{date}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{amt.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td>Gross Expenses</td>
                        <td style={{ textAlign: 'right' }}>৳{currentMonthTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Deposits */}
            <div className="room-card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
                Verified Payment Deposits ({selectedMonth})
              </h4>
              {monthlyPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No payment deposits recorded in {selectedMonth}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="matrix-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Date Paid</th>
                        <th>Reference</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPayments.map((p, idx) => (
                        <tr key={idx}>
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
                        <td colSpan={2}>Total Deposits Paid</td>
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
      )}
    </div>
  );
};
