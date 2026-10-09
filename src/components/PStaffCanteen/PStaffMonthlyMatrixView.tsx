import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Building2,
  Download,
  Search,
  Users,
  Coins,
  CreditCard,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import type { IPStaff } from '../../types/canteen.types';
import { exportPStaffMatrixPdf } from '../../utils/pStaffPdfExport';

interface PStaffMonthlyMatrixViewProps {
  staffList: IPStaff[];
  onSelectStaff?: (staff: IPStaff) => void;
}

export const PStaffMonthlyMatrixView: React.FC<PStaffMonthlyMatrixViewProps> = ({
  staffList,
  onSelectStaff,
}) => {
  const [activeOffice, setActiveOffice] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterQuery, setFilterQuery] = useState('');

  // Extract distinct offices from staff list
  const availableOffices = useMemo(() => {
    const offices = new Set<string>();
    staffList.forEach((s) => {
      if (s.office && s.office.trim()) {
        offices.add(s.office.trim());
      }
    });
    return ['ALL', ...Array.from(offices).sort()];
  }, [staffList]);

  // Compute number of days in selected month
  const dayNumbers = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedMonth]);

  // Filter staff by office and search query
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesOffice =
        activeOffice === 'ALL' || (staff.office && staff.office.trim() === activeOffice);

      const q = filterQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.bdNo.toLowerCase().includes(q) ||
        (staff.office && staff.office.toLowerCase().includes(q));

      return matchesOffice && matchesQuery;
    });
  }, [staffList, activeOffice, filterQuery]);

  // Helpers to get expenses and payments
  const getDayExpense = React.useCallback((staff: IPStaff, day: number): number => {
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${selectedMonth}-${dayStr}`;
    return (staff.dailyExpenses && staff.dailyExpenses[dateKey]) || 0;
  }, [selectedMonth]);

  const getStaffMonthExpense = React.useCallback((staff: IPStaff): number => {
    if (!staff.dailyExpenses) return 0;
    return Object.entries(staff.dailyExpenses)
      .filter(([date]) => date.startsWith(selectedMonth))
      .reduce((sum, [, amt]) => sum + amt, 0);
  }, [selectedMonth]);

  const getStaffPaid = React.useCallback((staff: IPStaff): number => {
    if (!staff.payments) return 0;
    return staff.payments
      .filter((p) => p.paymentDate.startsWith(selectedMonth))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [selectedMonth]);

  // Grand totals
  const totalByDay = useMemo(() => {
    return dayNumbers.map((day) => {
      return filteredStaff.reduce((sum, staff) => sum + getDayExpense(staff, day), 0);
    });
  }, [dayNumbers, filteredStaff, getDayExpense]);

  const grandCurrentMonth = useMemo(() => {
    return filteredStaff.reduce((sum, staff) => sum + getStaffMonthExpense(staff), 0);
  }, [filteredStaff, getStaffMonthExpense]);

  const grandPreDue = useMemo(() => {
    return filteredStaff.reduce((sum, staff) => sum + (staff.preDue || 0), 0);
  }, [filteredStaff]);

  const grandPaid = useMemo(() => {
    return filteredStaff.reduce((sum, staff) => sum + getStaffPaid(staff), 0);
  }, [filteredStaff, getStaffPaid]);

  const grandNetDue = grandCurrentMonth + grandPreDue - grandPaid;

  const handleDownloadPdf = () => {
    exportPStaffMatrixPdf({
      activeOffice,
      selectedMonth,
      staffList: filteredStaff,
      dayNumbers,
      getDayExpense,
      getStaffMonthExpense,
      getStaffPaid,
      totalByDay,
      grandCurrentMonth,
      grandPreDue,
      grandPaid,
      grandNetDue,
    });
  };

  return (
    <div>
      {/* Tactical Toolbar Strip */}
      <div className="toolbar-strip" style={{ gap: '0.85rem' }}>
        <div className="toolbar-group">
          {/* Office Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={16} color="var(--baf-sky-blue)" />
            <span className="stat-label">OFFICE:</span>
            <select
              className="select-control"
              value={activeOffice}
              onChange={(e) => setActiveOffice(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              {availableOffices.map((off) => (
                <option key={off} value={off}>
                  {off === 'ALL' ? 'ALL OFFICES / WINGS' : off}
                </option>
              ))}
            </select>
          </div>

          {/* Month / Billing Period Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="var(--baf-gold)" />
            <span className="stat-label">PERIOD:</span>
            <input
              type="month"
              className="select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ minWidth: '140px' }}
            />
          </div>
        </div>

        <div className="toolbar-group">
          {/* Staff Search Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search Name or BD..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="input-control"
              style={{ width: '160px' }}
            />
          </div>

          {/* Direct PDF Download Button */}
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            <Download size={15} />
            <span>DOWNLOAD MATRIX PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div className="room-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={16} color="var(--baf-sky-blue)" />
            <span className="stat-label">TOTAL PERSONNEL</span>
          </div>
          <div className="stat-value mono-num" style={{ fontSize: '1.3rem' }}>
            {filteredStaff.length} Staff
          </div>
        </div>

        <div className="room-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Coins size={16} color="var(--baf-gold)" />
            <span className="stat-label">MONTH EXPENSE</span>
          </div>
          <div className="stat-value mono-num" style={{ fontSize: '1.3rem', color: 'var(--baf-gold)' }}>
            ৳ {grandCurrentMonth.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Receipt size={16} color="var(--baf-red)" />
            <span className="stat-label">PRE-DUE FORWARD</span>
          </div>
          <div className="stat-value mono-num" style={{ fontSize: '1.3rem', color: 'var(--baf-red)' }}>
            ৳ {grandPreDue.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <CreditCard size={16} color="var(--baf-green)" />
            <span className="stat-label">TOTAL DEPOSITS</span>
          </div>
          <div className="stat-value mono-num" style={{ fontSize: '1.3rem', color: 'var(--baf-green)' }}>
            ৳ {grandPaid.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--baf-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <CheckCircle size={16} color="var(--baf-gold)" />
            <span className="stat-label">NET BALANCE DUE</span>
          </div>
          <div
            className="stat-value mono-num"
            style={{
              fontSize: '1.3rem',
              color: grandNetDue > 0 ? 'var(--baf-red)' : 'var(--baf-green)',
            }}
          >
            ৳ {grandNetDue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 31-Day Ledger Matrix Table */}
      <div className="matrix-table-container" style={{ overflowX: 'auto', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)' }}>
        <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--baf-navy)', color: '#FFFFFF' }}>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'center', minWidth: '40px' }}>SL</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', minWidth: '85px' }}>BD NO</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', minWidth: '150px' }}>RANK &amp; NAME</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', minWidth: '110px' }}>OFFICE</th>
              {dayNumbers.map((d) => (
                <th
                  key={d}
                  style={{
                    padding: '0.5rem 0.35rem',
                    textAlign: 'center',
                    minWidth: '34px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                  }}
                >
                  {d}
                </th>
              ))}
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', minWidth: '80px', color: 'var(--baf-gold)' }}>MONTH</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', minWidth: '70px' }}>PRE</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', minWidth: '80px' }}>GROSS</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', minWidth: '70px', color: 'var(--baf-green)' }}>PAID</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', minWidth: '85px', color: '#FFD700' }}>NET DUE</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td
                  colSpan={dayNumbers.length + 9}
                  style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}
                >
                  No staff members match the selected office and search filter.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff, idx) => {
                const monthSum = getStaffMonthExpense(staff);
                const pre = staff.preDue || 0;
                const gross = monthSum + pre;
                const pd = getStaffPaid(staff);
                const net = gross - pd;

                return (
                  <tr
                    key={staff._id || staff.bdNo || idx}
                    style={{
                      borderBottom: '1px solid var(--card-border-light)',
                      background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-hover)',
                      cursor: onSelectStaff ? 'pointer' : 'default',
                    }}
                    onClick={() => onSelectStaff && onSelectStaff(staff)}
                  >
                    <td style={{ padding: '0.45rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--baf-sky-blue)' }}>
                      {staff.bdNo}
                    </td>
                    <td style={{ padding: '0.45rem', fontWeight: 700 }}>
                      {staff.rank} {staff.name}
                    </td>
                    <td style={{ padding: '0.45rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {staff.office || 'RTS HQ'}
                    </td>

                    {/* Day 1 to Day 31 Cells */}
                    {dayNumbers.map((d) => {
                      const val = getDayExpense(staff, d);
                      return (
                        <td
                          key={d}
                          style={{
                            padding: '0.45rem 0.2rem',
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: val > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                            background: val > 0 ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                          }}
                        >
                          {val > 0 ? val : '-'}
                        </td>
                      );
                    })}

                    <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      ৳{monthSum}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--baf-red)', fontFamily: 'var(--font-mono)' }}>
                      ৳{pre}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ৳{gross}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--baf-green)', fontFamily: 'var(--font-mono)' }}>
                      ৳{pd}
                    </td>
                    <td
                      style={{
                        padding: '0.45rem 0.6rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: net > 0 ? 'var(--baf-red)' : 'var(--baf-green)',
                      }}
                    >
                      ৳{net}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Grand Total Row */}
            {filteredStaff.length > 0 && (
              <tr
                style={{
                  background: 'var(--baf-navy)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderTop: '2px solid var(--baf-gold)',
                }}
              >
                <td colSpan={4} style={{ padding: '0.65rem 0.85rem', textAlign: 'left', letterSpacing: '0.05em' }}>
                  GRAND TOTAL ({filteredStaff.length} STAFF)
                </td>
                {totalByDay.map((dayTotal, i) => (
                  <td
                    key={i}
                    style={{
                      padding: '0.65rem 0.2rem',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: dayTotal > 0 ? 'var(--baf-gold)' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {dayTotal > 0 ? dayTotal : '-'}
                  </td>
                ))}
                <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--baf-gold)' }}>
                  ৳{grandCurrentMonth}
                </td>
                <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#FF8080' }}>
                  ৳{grandPreDue}
                </td>
                <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  ৳{grandCurrentMonth + grandPreDue}
                </td>
                <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#80FF80' }}>
                  ৳{grandPaid}
                </td>
                <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#FFD700', fontSize: '0.9rem' }}>
                  ৳{grandNetDue}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
