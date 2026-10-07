import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface IAuditPdfParams {
  selectedMonth: string;
  activeEntry: string;
  recruitsMonthTotal: number;
  recruitsTotalPreDue: number;
  recruitsGrossDue: number;
  recruitsTotalPaid: number;
  recruitsNetDue: number;
  staffMonthTotal: number;
  staffTotalPreDue: number;
  staffGrossDue: number;
  staffTotalPaid: number;
  staffNetDue: number;
  grandCombinedTurnover: number;
  grandCombinedPreDue: number;
  grandCombinedPaid: number;
  grandCombinedNetDue: number;
  squadrons: string[];
  sqnBreakdown: Record<
    string,
    { monthTotal: number; preDue: number; paid: number; netDue: number }
  >;
}

export function exportConsolidatedAuditPdf(params: IAuditPdfParams): void {
  const {
    selectedMonth,
    activeEntry,
    recruitsMonthTotal,
    recruitsTotalPreDue,
    recruitsGrossDue,
    recruitsTotalPaid,
    recruitsNetDue,
    staffMonthTotal,
    staffTotalPreDue,
    staffGrossDue,
    staffTotalPaid,
    staffNetDue,
    grandCombinedTurnover,
    grandCombinedPreDue,
    grandCombinedPaid,
    grandCombinedNetDue,
    squadrons,
    sqnBreakdown,
  } = params;

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
  doc.text(`2. RECRUITS SQUADRON BREAKDOWN (ENTRY ${activeEntry})`, 14, lastY1);

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
}
