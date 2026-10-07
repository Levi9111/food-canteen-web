import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Shield,
  PlusCircle,
  Calculator,
  Save,
  X,
} from 'lucide-react';
import { CalculatorModal } from '../CalculatorModal';

interface DailyRoomGridProps {
  activeEntry: string;
  entries: string[];
  activeSquadron: string;
  squadrons: string[];
  rooms: string[];
  onSelectEntry: (entry: string) => void;
  onSelectSquadron: (sqn: string) => void;
  expenses: Record<string, number>; // key: entry|sqn|room|date -> amount
  roomPreDues: Record<string, number>;
  roomPaid: Record<string, number>;
  onSaveExpense: (room: string, date: string, amount: number) => void;
}

export const DailyRoomGrid: React.FC<DailyRoomGridProps> = ({
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
  onSaveExpense,
}) => {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0],
  );
  const [activeModalRoom, setActiveModalRoom] = useState<string | null>(null);
  const [modalPrice, setModalPrice] = useState<string>('');
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const makeKey = (room: string, date: string) =>
    `${activeEntry}|${activeSquadron}|${room}|${date}`;

  const handleOpenModal = (room: string) => {
    const existing = expenses[makeKey(room, selectedDate)] || 0;
    setModalPrice(existing > 0 ? existing.toString() : '');
    setActiveModalRoom(room);
  };

  const handleSaveModal = () => {
    if (!activeModalRoom) return;
    const num = parseFloat(modalPrice) || 0;
    onSaveExpense(activeModalRoom, selectedDate, num);
    setActiveModalRoom(null);
  };

  return (
    <div>
      {/* Tactical Toolbar */}
      <div className="toolbar-strip">
        <div className="toolbar-group">
          {/* Entry Batch */}
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

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} color="var(--baf-gold)" />
            <span className="stat-label">ENTRY DATE:</span>
            <input
              type="date"
              className="input-control mono-num"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="tactical-badge badge-gold">
          <span>ROOMS LOADED: {rooms.length}</span>
        </div>
      </div>

      {/* 16 Rooms Tactical Grid */}
      <div className="room-grid">
        {rooms.map((room) => {
          const currentExp = expenses[makeKey(room, selectedDate)] || 0;
          const preDue =
            roomPreDues[`${activeEntry}|${activeSquadron}|${room}`] || 0;
          const paid =
            roomPaid[`${activeEntry}|${activeSquadron}|${room}`] || 0;

          return (
            <div key={room} className="room-card">
              <div className="room-card-header">
                <span className="room-card-title">{room}</span>
                <span className="tactical-badge badge-navy">
                  ENTRY {activeEntry}
                </span>
              </div>

              <div className="room-card-stats">
                <div className="stat-box">
                  <span className="stat-label">DAY PRICE ({selectedDate})</span>
                  <span
                    className={`stat-value ${
                      currentExp > 0 ? 'stat-debit' : ''
                    }`}
                  >
                    ৳ {currentExp.toFixed(2)}
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">PRE-DUE / PAID</span>
                  <span className="stat-value">
                    <span className="stat-debit">৳ {preDue.toFixed(0)}</span> /{' '}
                    <span className="stat-credit">৳ {paid.toFixed(0)}</span>
                  </span>
                </div>
              </div>

              <button
                className={`btn ${
                  currentExp > 0 ? 'btn-navy' : 'btn-primary'
                }`}
                onClick={() => handleOpenModal(room)}
              >
                <PlusCircle size={14} />
                {currentExp > 0 ? 'UPDATE PRICE' : 'LOG DAILY PRICE'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal for Logging Daily Price (Items Field Removed as requested!) */}
      {activeModalRoom && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {activeSquadron} SQN • {activeModalRoom}
              </h3>
              <button
                onClick={() => setActiveModalRoom(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="tactical-badge badge-gold">
                <span>DATE: {selectedDate}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="stat-label">
                  DAILY EXPENSE PRICE (TK):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="any"
                    className="input-control mono-num"
                    style={{ flex: 1, fontSize: '1.1rem', fontWeight: 800 }}
                    placeholder="Enter price e.g. 125"
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value)}
                    autoFocus
                  />
                  {/* Built-in Calculator button as requested! */}
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsCalcOpen(true)}
                    title="Open Calculator to evaluate 55+20+50"
                  >
                    <Calculator size={16} color="var(--baf-gold)" />
                    CALCULATOR
                  </button>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem',
                  }}
                >
                  * Individual food items are omitted as requested. Only total financial price is recorded.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setActiveModalRoom(null)}
              >
                CANCEL
              </button>
              <button className="btn btn-primary" onClick={handleSaveModal}>
                <Save size={14} /> SAVE PRICE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        initialValue={parseFloat(modalPrice) || 0}
        onApply={(amt) => setModalPrice(amt.toString())}
      />
    </div>
  );
};
