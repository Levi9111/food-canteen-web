import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IPStaff } from '../types/canteen.types';

export interface IStaffStatementPdfParams {
  staff: IPStaff;
  selectedMonth: string;
  monthlyExpenses: [string, number][];
  currentMonthTotal: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monthlyPayments: any[];
  totalPaid: number;
  preDue: number;
  netEffectiveBill: number;
}

export function exportStaffStatementPdf(params: IStaffStatementPdfParams): void {
  const {
    staff,
    selectedMonth,
    monthlyExpenses,
    currentMonthTotal,
    monthlyPayments,
    totalPaid,
    preDue,
    netEffectiveBill,
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(11, 44, 90);
  doc.text('BANGLADESH AIR FORCE', 105, 16, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('RECRUITS TRAINING SCHOOL (RTS)', 105, 23, { align: 'center' });
  doc.text('P-STAFF FOOD CANTEEN STATEMENT', 105, 29, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Billing Month: ${selectedMonth}   |   Issued: ${new Date().toLocaleString()}`,
    105,
    35,
    { align: 'center' },
  );

  // Personnel Info Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 40, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`BD No: ${staff.bdNo}`, 18, 47);
  doc.text(`Rank: ${staff.rank}`, 75, 47);
  doc.text(`Name: ${staff.name}`, 130, 47);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Office/Branch: ${staff.office || 'RTS HQ'}`, 18, 56);
  doc.text(`Contact: ${staff.phone || 'N/A'}`, 75, 56);
  doc.text('Status: ACTIVE PARTICULAR', 130, 56);

  // Section 1: Daily Expenses Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 44, 90);
  doc.text('1. DAILY EXPENSES RECORD', 14, 70);

  const expenseRows = monthlyExpenses.map(([date, amount], idx) => [
    String(idx + 1),
    date,
    `${amount.toFixed(2)}৳`,
  ]);

  if (expenseRows.length === 0) {
    expenseRows.push(['-', 'No expenses recorded in this period', '0.00৳']);
  }

  autoTable(doc, {
    startY: 73,
    head: [['SL', 'Date', 'Expense Amount']],
    body: expenseRows,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 44, 90],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80, halign: 'center' },
      2: { cellWidth: 87, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Section 2: Random Payments Record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 44, 90);
  doc.text('2. DEPOSITS & RANDOM PAYMENTS RECORD', 14, lastY);

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
    startY: lastY + 3,
    head: [['SL', 'Payment Date', 'Receipt Reference', 'Amount Paid']],
    body: paymentRows,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 55, halign: 'center' },
      3: { cellWidth: 62, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Section 3: Financial Summary Box
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalTableY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalTableY, 182, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text('Pre-Due (Brought Forward):', 20, finalTableY + 8);
  doc.text(`${preDue.toFixed(2)}৳`, 185, finalTableY + 8, { align: 'right' });

  doc.text('Current Month Gross Expense:', 20, finalTableY + 15);
  doc.text(`${currentMonthTotal.toFixed(2)}৳`, 185, finalTableY + 15, { align: 'right' });

  doc.text('Total Random Payments Paid:', 20, finalTableY + 22);
  doc.text(`- ${totalPaid.toFixed(2)}৳`, 185, finalTableY + 22, { align: 'right' });

  doc.setDrawColor(148, 163, 184);
  doc.line(20, finalTableY + 26, 185, finalTableY + 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 44, 90);
  doc.text('NET EFFECTIVE BILL PAYABLE:', 20, finalTableY + 33);
  doc.text(`${netEffectiveBill.toFixed(2)}৳`, 185, finalTableY + 33, { align: 'right' });

  // Official Signature Lines
  const signY = finalTableY + 54;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  doc.line(25, signY, 70, signY);
  doc.text('Signature of Personnel', 47.5, signY + 4, { align: 'center' });

  doc.line(135, signY, 180, signY);
  doc.text('NCOIC / JCOIC Canteen', 157.5, signY + 4, { align: 'center' });

  const fileName = `BAF_RTS_Statement_${staff.bdNo}_${selectedMonth}.pdf`;
  doc.save(fileName);
}
