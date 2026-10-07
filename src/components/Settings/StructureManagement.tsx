import React, { useState } from 'react';
import {
  Layers,
  Shield,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import type { ISquadron, IEntry } from '../../types/canteen.types';

interface StructureManagementProps {
  entries: IEntry[];
  activeEntryNo: string;
  onSetActiveEntry: (entryNo: string) => void;
  onAddEntry: (entryNo: string) => void;
  squadrons: ISquadron[];
  onAddSquadron: (name: string, rooms: string[]) => void;
  onAddRoom: (squadronName: string, roomName: string) => void;
  onDeleteRoom: (squadronName: string, roomName: string) => void;
}

export const StructureManagement: React.FC<StructureManagementProps> = ({
  entries,
  activeEntryNo,
  onSetActiveEntry,
  onAddEntry,
  squadrons,
  onAddSquadron,
  onAddRoom,
  onDeleteRoom,
}) => {
  const [newEntryNo, setNewEntryNo] = useState('');
  const [newSqnName, setNewSqnName] = useState('');
  const [selectedSqnForRoom, setSelectedSqnForRoom] = useState(
    squadrons[0]?.name || 'Sadruddin',
  );
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryNo.trim()) return;
    onAddEntry(newEntryNo.trim());
    setNewEntryNo('');
  };

  const handleCreateSqn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSqnName.trim()) return;
    const defaultRooms = Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`);
    onAddSquadron(newSqnName.trim(), defaultRooms);
    setNewSqnName('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(selectedSqnForRoom, newRoomName.trim());
    setNewRoomName('');
  };

  const currentSqn = squadrons.find((s) => s.name === selectedSqnForRoom);

  return (
    <div>
      {/* 1. Recruits Entry Batches */}
      <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Layers size={18} color="var(--baf-gold)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recruits Entry Batches</h3>
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Manage intake training batches at BAF RTS. The active entry reflects across all recruit ledgers.
        </p>

        {/* Entry Batches List */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {entries.map((ent) => {
            const isActive = ent.entryNo === activeEntryNo;
            return (
              <div
                key={ent.entryNo}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: isActive
                    ? '2px solid var(--baf-navy)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isActive
                    ? 'rgba(11, 44, 90, 0.08)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Entry {ent.entryNo}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ent.status || 'ACTIVE'}
                  </div>
                </div>

                {isActive ? (
                  <span
                    className="tactical-badge"
                    style={{ backgroundColor: 'var(--baf-navy)', color: '#fff' }}
                  >
                    ACTIVE
                  </span>
                ) : (
                  <button
                    className="tactical-btn secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => onSetActiveEntry(ent.entryNo)}
                  >
                    SET ACTIVE
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Entry Form */}
        <form onSubmit={handleCreateEntry} style={{ display: 'flex', gap: '0.5rem', maxWidth: '350px' }}>
          <input
            type="text"
            required
            placeholder="New Entry No (e.g. 55)"
            className="select-control"
            style={{ flex: 1 }}
            value={newEntryNo}
            onChange={(e) => setNewEntryNo(e.target.value)}
          />
          <button type="submit" className="tactical-btn">
            <PlusCircle size={15} />
            <span>ADD ENTRY</span>
          </button>
        </form>
      </div>

      {/* 2. Squadrons & Rooms Management */}
      <div className="room-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Shield size={18} color="var(--baf-navy)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Squadrons &amp; Barrack Rooms</h3>
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Configure tactical squadrons and room allocations in database.
        </p>

        {/* Squadron Selector / Manager */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {squadrons.map((sqn) => {
            const isSelected = sqn.name === selectedSqnForRoom;
            return (
              <button
                key={sqn.name}
                type="button"
                className={`tactical-btn ${isSelected ? '' : 'secondary'}`}
                onClick={() => setSelectedSqnForRoom(sqn.name)}
              >
                <span>{sqn.name} Squadron ({sqn.rooms.length} Rooms)</span>
              </button>
            );
          })}
        </div>

        {/* Add Squadron Form */}
        <form onSubmit={handleCreateSqn} style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', marginBottom: '1.5rem' }}>
          <input
            type="text"
            required
            placeholder="New Squadron Name (e.g. Matiur Rahman)"
            className="select-control"
            style={{ flex: 1 }}
            value={newSqnName}
            onChange={(e) => setNewSqnName(e.target.value)}
          />
          <button type="submit" className="tactical-btn secondary">
            <PlusCircle size={15} />
            <span>ADD SQUADRON</span>
          </button>
        </form>

        {/* Rooms of Selected Squadron */}
        {currentSqn && (
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Barrack Rooms in {currentSqn.name} Squadron:
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {currentSqn.rooms.map((room) => (
                <div
                  key={room}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {room}
                  </span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)' }}
                    title={`Delete ${room}`}
                    onClick={() => onDeleteRoom(currentSqn.name, room)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Room to Selected Squadron */}
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', gap: '0.5rem', maxWidth: '350px' }}>
              <input
                type="text"
                required
                placeholder={`New Room in ${currentSqn.name} (e.g. Room 17)`}
                className="select-control"
                style={{ flex: 1 }}
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <button type="submit" className="tactical-btn">
                <PlusCircle size={15} />
                <span>ADD ROOM</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
