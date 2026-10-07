import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Shield,
  Download,
  Search,
} from 'lucide-react';
import { exportRecruitsMatrixPdf } from '../../utils/recruitsPdfExport';

interface MonthlyMatrixViewProps {
  activeEntry: string;
  entries: string[];
  activeSquadron: string;
  squadrons: string[];
  rooms: string[];
  onSelectEntry: (entry: string) => void;
  onSelectSquadron: (sqn: string) => void;
  expenses: Record<string, number>; // key: entry|sqn|room|YYYY-MM-DD -> amount
  roomPreDues: Record<string, number>; // key: entry|sqn|room -> amount
  roomPaid: Record<string, number>; // key: entry|sqn|room -> amount
  onCellClick?: (room: string, date: string) => void;
}

export const MonthlyMatrixView: React.FC<MonthlyMatrixViewProps> = ({
  activeEntry,
  entries,
  activeSquadron,
  squadrons,
  rooms,
  onSelectEntry,
  onSelectSquadron,
  expenses,
  roomPreDues,
  roomPaid,
  onCellClick,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterRoom, setFilterRoom] = useState('');

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayExpense = (room: string, day: number): number => {
    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
    const key = `${activeEntry}|${activeSquadron}|${room}|${dateStr}`;
    return expenses[key] || 0;
  };

  const getPreDue = (room: string): number => {
    const key = `${activeEntry}|${activeSquadron}|${room}`;
    return roomPreDues[key] || 0;
  };

  const getPaid = (room: string): number => {
    const key = `${activeEntry}|${activeSquadron}|${room}`;
    return roomPaid[key] || 0;
  };

  const filteredRooms = rooms.filter((r) =>
    r.toLowerCase().includes(filterRoom.toLowerCase()),
  );

  // Compute Grand Totals
  const totalByDay: number[] = dayNumbers.map((day) =>
    rooms.reduce((acc, r) => acc + getDayExpense(r, day), 0),
  );

  const grandCurrentMonth = rooms.reduce((acc, r) => {
    const roomMonthTotal = dayNumbers.reduce(
      (sum, day) => sum + getDayExpense(r, day),
      0,
    );
    return acc + roomMonthTotal;
  }, 0);

  const grandPreDue = rooms.reduce((acc, r) => acc + getPreDue(r), 0);
  const grandPaid = rooms.reduce((acc, r) => acc + getPaid(r), 0);
  const grandNetDue = grandCurrentMonth + grandPreDue - grandPaid;

  // Direct PDF Download (Zero Print Dialog)
  const handleDownloadPdf = () => {
    exportRecruitsMatrixPdf({
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
    });
  };

  return (
    <div>
      {/* Tactical Toolbar */}
      <div className="toolbar-strip">
        <div className="toolbar-group">
          {/* Entry Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={15} color="var(--baf-gold)" />
            <span className="stat-label">BATCH:</span>
            <select
              className="select-control"
              value={activeEntry}
              onChange={(e) => onSelectEntry(e.target.value)}
            >
              {entries.map((ent) => (
                <option key={ent} value={ent}>
                  Entry {ent}
                </option>
              ))}
            </select>
          </div>

          {/* Squadron Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={15} color="var(--baf-sky-blue)" />
            <span className="stat-label">SQUADRON:</span>
            <select
              className="select-control"
              value={activeSquadron}
              onChange={(e) => onSelectSquadron(e.target.value)}
            >
              {squadrons.map((sqn) => (
                <option key={sqn} value={sqn}>
                  {sqn} Squadron
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
          {/* Room Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter Room..."
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="select-control"
              style={{ width: '130px' }}
            />
          </div>

          {/* Direct PDF Download */}
          <button className="tactical-btn" onClick={handleDownloadPdf}>
            <Download size={15} />
            <span>DOWNLOAD MATRIX PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          margin: '1.25rem 0',
        }}
      >
        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">CURRENT MONTH EXPENSES</div>
          <div className="stat-value" style={{ color: 'var(--baf-navy)', fontSize: '1.35rem' }}>
            ৳{grandCurrentMonth.toLocaleString()}
          </div>
        </div>
        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">BROUGHT FORWARD PRE-DUES</div>
          <div className="stat-value" style={{ color: 'var(--status-danger)', fontSize: '1.35rem' }}>
            ৳{grandPreDue.toLocaleString()}
          </div>
        </div>
        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">TOTAL PAID TO DATE</div>
          <div className="stat-value" style={{ color: 'var(--status-success)', fontSize: '1.35rem' }}>
            ৳{grandPaid.toLocaleString()}
          </div>
        </div>
        <div className="room-card" style={{ padding: '1rem' }}>
          <div className="stat-label">NET OUTSTANDING DUE</div>
          <div className="stat-value" style={{ color: 'var(--baf-gold)', fontSize: '1.35rem' }}>
            ৳{grandNetDue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Monthly Matrix Table with Horizontal Scroll */}
      <div className="matrix-table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="sticky-col">ROOM</th>
              {dayNumbers.map((d) => (
                <th key={d} style={{ minWidth: '42px', textAlign: 'center' }}>
                  {d}
                </th>
              ))}
              <th style={{ minWidth: '95px', textAlign: 'right' }}>MONTH TOTAL</th>
              <th style={{ minWidth: '85px', textAlign: 'right' }}>PRE DUE</th>
              <th style={{ minWidth: '95px', textAlign: 'right' }}>GROSS DUE</th>
              <th style={{ minWidth: '85px', textAlign: 'right' }}>PAID</th>
              <th style={{ minWidth: '95px', textAlign: 'right' }}>NET DUE</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => {
              const monthSum = dayNumbers.reduce(
                (sum, d) => sum + getDayExpense(room, d),
                0,
              );
              const pre = getPreDue(room);
              const gross = monthSum + pre;
              const pd = getPaid(room);
              const net = gross - pd;

              return (
                <tr key={room}>
                  <td className="sticky-col font-mono" style={{ fontWeight: 600 }}>
                    {room}
                  </td>
                  {dayNumbers.map((d) => {
                    const val = getDayExpense(room, d);
                    const dateStr = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
                    return (
                      <td
                        key={d}
                        style={{
                          textAlign: 'center',
                          cursor: onCellClick ? 'pointer' : 'default',
                          color: val > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                          backgroundColor: val > 0 ? 'rgba(11, 44, 90, 0.05)' : undefined,
                        }}
                        onClick={() => onCellClick?.(room, dateStr)}
                        title={`Click to edit ${room} on ${dateStr}`}
                      >
                        {val > 0 ? val : '-'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ৳{monthSum.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: pre > 0 ? 'var(--status-danger)' : 'inherit',
                    }}
                  >
                    ৳{pre.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ৳{gross.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: pd > 0 ? 'var(--status-success)' : 'inherit',
                    }}
                  >
                    ৳{pd.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: net > 0 ? 'var(--baf-navy)' : 'var(--status-success)',
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
              <td className="sticky-col">TOTAL</td>
              {dayNumbers.map((d) => (
                <td key={d} style={{ textAlign: 'center' }}>
                  {totalByDay[d - 1] > 0 ? totalByDay[d - 1] : '-'}
                </td>
              ))}
              <td style={{ textAlign: 'right' }}>৳{grandCurrentMonth.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>৳{grandPreDue.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>
                ৳{(grandCurrentMonth + grandPreDue).toLocaleString()}
              </td>
              <td style={{ textAlign: 'right' }}>৳{grandPaid.toLocaleString()}</td>
              <td style={{ textAlign: 'right', color: 'var(--baf-navy)' }}>
                ৳{grandNetDue.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
