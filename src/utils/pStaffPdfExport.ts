import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IPStaff } from '../types/canteen.types';

export interface IPStaffPdfExportParams {
  activeOffice: string;
  selectedMonth: string;
  staffList: IPStaff[];
  dayNumbers: number[];
  getDayExpense: (staff: IPStaff, day: number) => number;
  getStaffMonthExpense: (staff: IPStaff) => number;
  getStaffPaid: (staff: IPStaff) => number;
  totalByDay: number[];
  grandCurrentMonth: number;
  grandPreDue: number;
  grandPaid: number;
  grandNetDue: number;
}

export function exportPStaffMatrixPdf(params: IPStaffPdfExportParams): void {
  const {
    activeOffice,
    selectedMonth,
    staffList,
    dayNumbers,
    getDayExpense,
    getStaffMonthExpense,
    getStaffPaid,
    totalByDay,
    grandCurrentMonth,
    grandPreDue,
    grandPaid,
    grandNetDue,
  } = params;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Military Masthead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(11, 44, 90);
  doc.text('BANGLADESH AIR FORCE', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'RECRUITS TRAINING SCHOOL (RTS) - PERMANENT STAFF (P-STAFF) CANTEEN',
    pageWidth / 2,
    20,
    { align: 'center' },
  );

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('MONTHLY LEDGER & AUDIT MATRIX', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Office/Branch: ${activeOffice}   |   Billing Period: ${selectedMonth}   |   Total Staff: ${staffList.length}   |   Generated: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    32,
    { align: 'center' },
  );

  // 2. Table Column Headers
  const headers = [
    'SL',
    'BD NO',
    'RANK & NAME',
    'OFFICE',
    ...dayNumbers.map((d) => String(d)),
    'MONTH TOTAL',
    'PRE DUE',
    'GROSS DUE',
    'PAID',
    'NET DUE',
  ];

  // 3. Body Rows
  const bodyRows = staffList.map((staff, idx) => {
    const dayValues = dayNumbers.map((d) => {
      const val = getDayExpense(staff, d);
      return val > 0 ? `${val}` : '-';
    });
    const monthSum = getStaffMonthExpense(staff);
    const pre = staff.preDue || 0;
    const gross = monthSum + pre;
    const pd = getStaffPaid(staff);
    const net = gross - pd;

    return [
      String(idx + 1),
      staff.bdNo || 'N/A',
      `${staff.rank} ${staff.name}`,
      staff.office || 'RTS HQ',
      ...dayValues,
      `${monthSum}৳`,
      `${pre}৳`,
      `${gross}৳`,
      `${pd}৳`,
      `${net}৳`,
    ];
  });

  // 4. Grand Total Row
  const totalRow = [
    'TOTAL',
    '-',
    'GRAND TOTAL',
    '-',
    ...totalByDay.map((val) => (val > 0 ? `${val}` : '-')),
    `${grandCurrentMonth}৳`,
    `${grandPreDue}৳`,
    `${grandCurrentMonth + grandPreDue}৳`,
    `${grandPaid}৳`,
    `${grandNetDue}৳`,
  ];

  autoTable(doc, {
    head: [headers],
    body: [...bodyRows, totalRow],
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 44, 90],
      textColor: [255, 255, 255],
      fontSize: 7,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 6.8,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 18 },
      2: { fontStyle: 'bold', halign: 'left', cellWidth: 38 },
      3: { halign: 'left', cellWidth: 22 },
    },
    didParseCell: (data) => {
      if (data.row.index === bodyRows.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 232, 240];
        data.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  // 5. Official 4-Tier Signature Block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 22 : 240;
  const sigY = Math.min(lastTableY, doc.internal.pageSize.getHeight() - 25);

  const sigColWidth = pageWidth / 4;

  // Signature 1: NCOIC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('__________________________________', sigColWidth * 0.5, sigY - 6, { align: 'center' });
  doc.text('Cpl Shanjid Ahmad', sigColWidth * 0.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('NCOIC Canteen (E&I Fitter, BD/472770)', sigColWidth * 0.5, sigY + 4, { align: 'center' });
  doc.text('Recruit Training Squadron', sigColWidth * 0.5, sigY + 8, { align: 'center' });

  // Signature 2: JCOIC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('__________________________________', sigColWidth * 1.5, sigY - 6, { align: 'center' });
  doc.text('JCOIC Canteen', sigColWidth * 1.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Junior Commissioned Officer In-Charge', sigColWidth * 1.5, sigY + 4, { align: 'center' });
  doc.text('Recruit Training Squadron', sigColWidth * 1.5, sigY + 8, { align: 'center' });

  // Signature 3: Canteen Officer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('__________________________________', sigColWidth * 2.5, sigY - 6, { align: 'center' });
  doc.text('Canteen Officer', sigColWidth * 2.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Flight Lieutenant / Squadron Leader', sigColWidth * 2.5, sigY + 4, { align: 'center' });
  doc.text('Recruits Training School, BAF', sigColWidth * 2.5, sigY + 8, { align: 'center' });

  // Signature 4: Officer Commanding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('__________________________________', sigColWidth * 3.5, sigY - 6, { align: 'center' });
  doc.text('Officer Commanding (OC)', sigColWidth * 3.5, sigY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Wing Commander / Group Captain', sigColWidth * 3.5, sigY + 4, { align: 'center' });
  doc.text('Recruits Training School, BAF', sigColWidth * 3.5, sigY + 8, { align: 'center' });

  const cleanOffice = activeOffice.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `BAF_RTS_PStaff_Monthly_Matrix_${cleanOffice}_${selectedMonth}.pdf`;
  doc.save(fileName);
}
