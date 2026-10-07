import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Building,
  Users,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IPStaff } from '../../types/canteen.types';

interface AuditDashboardProps {
  activeEntry: string;
  squadrons: string[];
  rooms: string[];
  recruitsExpenses: Record<string, number>; // key: entry|sqn|room|YYYY-MM-DD -> amount
  recruitsPreDues: Record<string, number>;
  recruitsPaid: Record<string, number>;
  staffList: IPStaff[];
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  activeEntry,
  squadrons,
  rooms,
  recruitsExpenses,
  recruitsPreDues,
  recruitsPaid,
  staffList,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate Recruits Totals for the Month
  let recruitsMonthTotal = 0;
  let recruitsTotalPreDue = 0;
  let recruitsTotalPaid = 0;

  const sqnBreakdown: Record<
    string,
    { monthTotal: number; preDue: number; paid: number; netDue: number }
  > = {};

  squadrons.forEach((sqn) => {
    sqnBreakdown[sqn] = { monthTotal: 0, preDue: 0, paid: 0, netDue: 0 };
    rooms.forEach((room) => {
      const preKey = `${activeEntry}|${sqn}|${room}`;
      const pre = recruitsPreDues[preKey] || 0;
      const pd = recruitsPaid[preKey] || 0;

      recruitsTotalPreDue += pre;
      recruitsTotalPaid += pd;
      sqnBreakdown[sqn].preDue += pre;
      sqnBreakdown[sqn].paid += pd;

      // Sum all days for the selected month
      for (let day = 1; day <= 31; day++) {
        const dStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const expKey = `${activeEntry}|${sqn}|${room}|${dStr}`;
        const amt = recruitsExpenses[expKey] || 0;
        recruitsMonthTotal += amt;
        sqnBreakdown[sqn].monthTotal += amt;
      }
    });

    sqnBreakdown[sqn].netDue =
      sqnBreakdown[sqn].monthTotal +
      sqnBreakdown[sqn].preDue -
      sqnBreakdown[sqn].paid;
  });

  const recruitsGrossDue = recruitsMonthTotal + recruitsTotalPreDue;
  const recruitsNetDue = recruitsGrossDue - recruitsTotalPaid;

  // Calculate P-Staff Totals for the Month
  let staffMonthTotal = 0;
  let staffTotalPreDue = 0;
  let staffTotalPaid = 0;

  staffList.forEach((st) => {
    staffTotalPreDue += st.preDue || 0;

    // Monthly expenses
    const stMonthExp = Object.entries(st.dailyExpenses || {})
      .filter(([d]) => d.startsWith(selectedMonth))
      .reduce((sum, [, a]) => sum + a, 0);
    staffMonthTotal += stMonthExp;

    // Monthly payments
    const stMonthPaid = (st.payments || [])
      .filter((p) => p.paymentDate.startsWith(selectedMonth))
      .reduce((sum, p) => sum + p.amount, 0);
    staffTotalPaid += stMonthPaid;
  });

  const staffGrossDue = staffMonthTotal + staffTotalPreDue;
  const staffNetDue = staffGrossDue - staffTotalPaid;

  // Combined RTS Canteen Totals
  const grandCombinedTurnover = recruitsMonthTotal + staffMonthTotal;
  const grandCombinedPreDue = recruitsTotalPreDue + staffTotalPreDue;
  const grandCombinedPaid = recruitsTotalPaid + staffTotalPaid;
  const grandCombinedNetDue =
    grandCombinedTurnover + grandCombinedPreDue - grandCombinedPaid;

  // Direct PDF Download of Consolidated Audit Report
  const handleDownloadAuditPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Official Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(11, 44, 90);
    doc.text('BANGLADESH AIR FORCE', 105, 16, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('RECRUITS TRAINING SCHOOL (RTS)', 105, 23, { align: 'center' });
    doc.text('MONTHLY CONSOLIDATED CANTEEN AUDIT REPORT', 105, 29, {
      align: 'center',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Audit Month: ${selectedMonth}   |   Active Entry: ${activeEntry}   |   Generated: ${new Date().toLocaleString()}`,
      105,
      35,
      { align: 'center' },
    );

    // Section 1: Consolidated High-Level Executive Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 44, 90);
    doc.text('1. CONSOLIDATED FINANCIAL SUMMARY', 14, 45);

    const summaryRows = [
      [
        'Recruits Canteen',
        `${recruitsMonthTotal.toFixed(2)}৳`,
        `${recruitsTotalPreDue.toFixed(2)}৳`,
        `${recruitsGrossDue.toFixed(2)}৳`,
        `${recruitsTotalPaid.toFixed(2)}৳`,
        `${recruitsNetDue.toFixed(2)}৳`,
      ],
      [
        'P-Staff Canteen',
        `${staffMonthTotal.toFixed(2)}৳`,
        `${staffTotalPreDue.toFixed(2)}৳`,
        `${staffGrossDue.toFixed(2)}৳`,
        `${staffTotalPaid.toFixed(2)}৳`,
        `${staffNetDue.toFixed(2)}৳`,
      ],
      [
        'COMBINED RTS CANTEEN',
        `${grandCombinedTurnover.toFixed(2)}৳`,
        `${grandCombinedPreDue.toFixed(2)}৳`,
        `${(grandCombinedTurnover + grandCombinedPreDue).toFixed(2)}৳`,
        `${grandCombinedPaid.toFixed(2)}৳`,
        `${grandCombinedNetDue.toFixed(2)}৳`,
      ],
    ];

    autoTable(doc, {
      startY: 48,
      head: [
        [
          'Sector',
          'Current Turnover',
          'Pre-Due',
          'Gross Due',
          'Paid to Date',
          'Net Balance',
        ],
      ],
      body: summaryRows,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 44, 90],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8 },
      didParseCell: (data) => {
        if (data.row.index === 2) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
          data.cell.styles.textColor = [11, 44, 90];
        }
      },
    });

    // Section 2: Recruits Squadron Breakdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY1 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 44, 90);
    doc.text('2. RECRUITS SQUADRON BREAKDOWN (ENTRY ' + activeEntry + ')', 14, lastY1);

    const sqnRows = squadrons.map((sqn) => {
      const s = sqnBreakdown[sqn];
      return [
        `${sqn} Squadron`,
        `${s.monthTotal.toFixed(2)}৳`,
        `${s.preDue.toFixed(2)}৳`,
        `${(s.monthTotal + s.preDue).toFixed(2)}৳`,
        `${s.paid.toFixed(2)}৳`,
        `${s.netDue.toFixed(2)}৳`,
      ];
    });

    autoTable(doc, {
      startY: lastY1 + 3,
      head: [
        [
          'Squadron',
          'Current Turnover',
          'Pre-Due',
          'Gross Due',
          'Paid Amount',
          'Outstanding Net Due',
        ],
      ],
      body: sqnRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8 },
    });

    // Section 3: Official Military Signatures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY2 = (doc as any).lastAutoTable.finalY + 28;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // 3 Signatures: NCOIC Canteen, JCOIC Canteen, OC Canteen
    doc.line(16, lastY2, 60, lastY2);
    doc.text('NCOIC Food Canteen', 38, lastY2 + 4, { align: 'center' });

    doc.line(80, lastY2, 126, lastY2);
    doc.text('JCOIC Food Canteen', 103, lastY2 + 4, { align: 'center' });

    doc.line(146, lastY2, 192, lastY2);
    doc.text('Officer Commanding (OC)', 169, lastY2 + 4, { align: 'center' });

    const fileName = `BAF_RTS_Audit_Consolidated_${selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div>
      {/* Tactical Toolbar */}
      <div className="toolbar-strip" style={{ marginBottom: '1.25rem' }}>
        <div className="toolbar-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} color="var(--baf-gold)" />
            <span className="stat-label">AUDIT MONTH:</span>
            <input
              type="month"
              className="select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
            <Building size={15} color="var(--baf-sky-blue)" />
            <span className="stat-label">BATCH ENTRY: {activeEntry}</span>
          </div>
        </div>

        <div className="toolbar-group">
          {/* Direct Download Audit PDF */}
          <button className="tactical-btn" onClick={handleDownloadAuditPdf}>
            <Download size={15} />
            <span>DOWNLOAD CONSOLIDATED AUDIT PDF</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="room-card" style={{ padding: '1.1rem' }}>
          <div className="stat-label">COMBINED TURNOVER ({selectedMonth})</div>
          <div className="stat-value font-mono" style={{ color: 'var(--baf-navy)', fontSize: '1.4rem' }}>
            ৳{grandCombinedTurnover.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recruits: ৳{recruitsMonthTotal.toLocaleString()} | Staff: ৳{staffMonthTotal.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1.1rem' }}>
          <div className="stat-label">BROUGHT FORWARD PRE-DUES</div>
          <div className="stat-value font-mono" style={{ color: 'var(--text-muted)', fontSize: '1.4rem' }}>
            ৳{grandCombinedPreDue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recruits: ৳{recruitsTotalPreDue.toLocaleString()} | Staff: ৳{staffTotalPreDue.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1.1rem' }}>
          <div className="stat-label">TOTAL PAYMENTS COLLECTED</div>
          <div className="stat-value font-mono" style={{ color: 'var(--status-success)', fontSize: '1.4rem' }}>
            ৳{grandCombinedPaid.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recruits: ৳{recruitsTotalPaid.toLocaleString()} | Staff: ৳{staffTotalPaid.toLocaleString()}
          </div>
        </div>

        <div className="room-card" style={{ padding: '1.1rem', borderColor: 'var(--baf-gold)' }}>
          <div className="stat-label">NET OUTSTANDING BALANCE</div>
          <div
            className="stat-value font-mono"
            style={{
              color: grandCombinedNetDue > 0 ? 'var(--status-danger)' : 'var(--status-success)',
              fontSize: '1.4rem',
            }}
          >
            ৳{grandCombinedNetDue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recruits: ৳{recruitsNetDue.toLocaleString()} | Staff: ৳{staffNetDue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recruits Squadron Breakdown Table */}
      <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Building size={18} color="var(--baf-navy)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recruits Canteen - Squadron Breakdown (Entry {activeEntry})</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Squadron</th>
                <th style={{ textAlign: 'right' }}>Turnover ({selectedMonth})</th>
                <th style={{ textAlign: 'right' }}>Pre-Due</th>
                <th style={{ textAlign: 'right' }}>Gross Due</th>
                <th style={{ textAlign: 'right' }}>Paid to Date</th>
                <th style={{ textAlign: 'right' }}>Outstanding Due</th>
              </tr>
            </thead>
            <tbody>
              {squadrons.map((sqn) => {
                const s = sqnBreakdown[sqn];
                return (
                  <tr key={sqn}>
                    <td style={{ fontWeight: 600 }}>{sqn} Squadron</td>
                    <td style={{ textAlign: 'right' }}>৳{s.monthTotal.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>৳{s.preDue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ৳{(s.monthTotal + s.preDue).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--status-success)' }}>
                      ৳{s.paid.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: s.netDue > 0 ? 'var(--status-danger)' : 'var(--status-success)',
                      }}
                    >
                      ৳{s.netDue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700, backgroundColor: 'rgba(11, 44, 90, 0.08)' }}>
                <td>RECRUITS TOTAL</td>
                <td style={{ textAlign: 'right' }}>৳{recruitsMonthTotal.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>৳{recruitsTotalPreDue.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>৳{recruitsGrossDue.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>৳{recruitsTotalPaid.toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: 'var(--baf-navy)' }}>
                  ৳{recruitsNetDue.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* P-Staff Canteen Summary Table */}
      <div className="room-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={18} color="var(--baf-navy)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Permanent Staff (P-Staff) Canteen Ledger Summary</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Office</th>
                <th style={{ textAlign: 'right' }}>Turnover ({selectedMonth})</th>
                <th style={{ textAlign: 'right' }}>Pre-Due</th>
                <th style={{ textAlign: 'right' }}>Paid to Date</th>
                <th style={{ textAlign: 'right' }}>Net Effective Bill</th>
              </tr>
            </thead>
            <tbody>
              {staffList.slice(0, 10).map((st) => {
                const stExp = Object.entries(st.dailyExpenses || {})
                  .filter(([d]) => d.startsWith(selectedMonth))
                  .reduce((sum, [, a]) => sum + a, 0);
                const stPaid = (st.payments || [])
                  .filter((p) => p.paymentDate.startsWith(selectedMonth))
                  .reduce((sum, p) => sum + p.amount, 0);
                const stPre = st.preDue || 0;
                const net = stExp + stPre - stPaid;

                return (
                  <tr key={st._id || st.bdNo}>
                    <td>
                      <span className="tactical-badge" style={{ marginRight: '0.4rem' }}>
                        {st.rank}
                      </span>
                      <strong>{st.name}</strong> (BD/{st.bdNo})
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{st.office}</td>
                    <td style={{ textAlign: 'right' }}>৳{stExp.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>৳{stPre.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--status-success)' }}>
                      ৳{stPaid.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: net > 0 ? 'var(--status-danger)' : 'var(--status-success)',
                      }}
                    >
                      ৳{net.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700, backgroundColor: 'rgba(11, 44, 90, 0.08)' }}>
                <td colSpan={2}>P-STAFF TOTAL ({staffList.length} Personnel)</td>
                <td style={{ textAlign: 'right' }}>৳{staffMonthTotal.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>৳{staffTotalPreDue.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>৳{staffTotalPaid.toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: 'var(--baf-navy)' }}>
                  ৳{staffNetDue.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
