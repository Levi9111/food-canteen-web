import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface IRecruitsPdfExportParams {
  activeEntry: string;
  activeSquadron: string;
  selectedMonth: string;
  rooms: string[];
  dayNumbers: number[];
  getDayExpense: (room: string, day: number) => number;
  getPreDue: (room: string) => number;
  getPaid: (room: string) => number;
  totalByDay: number[];
  grandCurrentMonth: number;
  grandPreDue: number;
  grandPaid: number;
  grandNetDue: number;
}

export function exportRecruitsMatrixPdf(params: IRecruitsPdfExportParams): void {
  const {
    activeEntry,
    activeSquadron,
    selectedMonth,
    rooms,
    dayNumbers,
    getDayExpense,
    getPreDue,
    getPaid,
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

  // Military Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(11, 44, 90);
  doc.text('BANGLADESH AIR FORCE', doc.internal.pageSize.getWidth() / 2, 14, {
    align: 'center',
  });

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'RECRUITS TRAINING SCHOOL (RTS) - FOOD CANTEEN MONTHLY MATRIX',
    doc.internal.pageSize.getWidth() / 2,
    20,
    { align: 'center' },
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Entry: ${activeEntry}   |   Squadron: ${activeSquadron}   |   Month: ${selectedMonth}   |   Generated: ${new Date().toLocaleString()}`,
    doc.internal.pageSize.getWidth() / 2,
    26,
    { align: 'center' },
  );

  const headers = [
    'Room',
    ...dayNumbers.map((d) => String(d)),
    'Month Total',
    'Pre Due',
    'Gross Due',
    'Paid',
    'Net Balance',
  ];

  const bodyRows = rooms.map((room) => {
    const dayValues = dayNumbers.map((d) => {
      const val = getDayExpense(room, d);
      return val > 0 ? `${val}` : '-';
    });
    const monthSum = dayNumbers.reduce(
      (sum, d) => sum + getDayExpense(room, d),
      0,
    );
    const pre = getPreDue(room);
    const gross = monthSum + pre;
    const pd = getPaid(room);
    const net = gross - pd;

    return [
      room,
      ...dayValues,
      `${monthSum}৳`,
      `${pre}৳`,
      `${gross}৳`,
      `${pd}৳`,
      `${net}৳`,
    ];
  });

  const totalRow = [
    'GRAND TOTAL',
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
    startY: 32,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 44, 90],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.row.index === bodyRows.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 232, 240];
        data.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  const fileName = `BAF_RTS_Recruits_Monthly_Matrix_Entry${activeEntry}_${activeSquadron}_${selectedMonth}.pdf`;
  doc.save(fileName);
}
