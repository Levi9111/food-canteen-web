import React, { useState } from 'react';
import {
  Shield,
  Layers,
  PlusCircle,
  Trash2,
  Edit3,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { ISquadron, IEntry } from '../../types/canteen.types';
import { StrictWarningModal } from '../common/StrictWarningModal';
import { validateSquadronRename } from '../../utils/squadronCascade';
import {
  validateRoomAddition,
  validateSquadronDeletion,
  validateRoomDeletion,
} from '../../utils/structureSafety';

interface SquadronManagementViewProps {
  entries: IEntry[];
  activeEntryNo: string;
  onSetActiveEntry: (entryNo: string) => void;
  onAddEntry: (entryNo: string) => void;
  squadrons: ISquadron[];
  activeSquadronName: string;
  onSelectSquadron: (name: string) => void;
  onAddSquadron: (name: string, rooms: string[]) => void;
  onRenameSquadron: (oldName: string, newName: string) => { success: boolean; error?: string; affectedCount?: number };
  onDeleteSquadron: (name: string) => { success: boolean; error?: string };
  onAddRoom: (squadronName: string, roomName: string) => { success: boolean; error?: string };
  onDeleteRoom: (squadronName: string, roomName: string) => { success: boolean; error?: string };
  onBackToHub?: () => void;
}

export const SquadronManagementView: React.FC<SquadronManagementViewProps> = ({
  entries,
  activeEntryNo,
  onSetActiveEntry,
  onAddEntry,
  squadrons,
  activeSquadronName,
  onSelectSquadron,
  onAddSquadron,
  onRenameSquadron,
  onDeleteSquadron,
  onAddRoom,
  onDeleteRoom,
  onBackToHub,
}) => {
  // Local state
  const [newEntryNo, setNewEntryNo] = useState('');
  const [newSqnName, setNewSqnName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Rename Modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetSqn, setRenameTargetSqn] = useState<string>('');
  const [renamedNewName, setRenamedNewName] = useState<string>('');
  const [renameValidationError, setRenameValidationError] = useState<string | null>(null);

  // Delete Squadron Modal state
  const [isDeleteSqnModalOpen, setIsDeleteSqnModalOpen] = useState(false);
  const [sqnToDelete, setSqnToDelete] = useState<string>('');

  // Delete Room Modal state
  const [isDeleteRoomModalOpen, setIsDeleteRoomModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ sqnName: string; roomName: string } | null>(null);

  const currentSqn = squadrons.find((s) => s.name === activeSquadronName) || squadrons[0];

  const showFeedback = (text: string, isError = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Handlers
  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryNo.trim()) return;
    onAddEntry(newEntryNo.trim());
    showFeedback(`Intake Entry batch ${newEntryNo.trim()} activated.`);
    setNewEntryNo('');
  };

  const handleCreateSqn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSqnName.trim();
    if (!cleanName) return;

    if (squadrons.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) {
      showFeedback(`Squadron "${cleanName}" already exists.`, true);
      return;
    }

    const defaultRooms = Array.from({ length: 16 }, (_, i) => `Room ${i + 1}`);
    onAddSquadron(cleanName, defaultRooms);
    onSelectSquadron(cleanName);
    showFeedback(`Squadron "${cleanName}" registered with 16 default barrack rooms.`);
    setNewSqnName('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSqn) return;

    const validation = validateRoomAddition(newRoomName, currentSqn.rooms);
    if (!validation.isValid) {
      showFeedback(validation.error || 'Invalid room name', true);
      return;
    }

    const res = onAddRoom(currentSqn.name, newRoomName.trim());
    if (res.success) {
      showFeedback(`Room "${newRoomName.trim()}" added to ${currentSqn.name} Squadron.`);
      setNewRoomName('');
    } else {
      showFeedback(res.error || 'Failed to add room', true);
    }
  };

  // Rename Flow
  const openRenameModal = (sqnName: string) => {
    setRenameTargetSqn(sqnName);
    setRenamedNewName(sqnName);
    setRenameValidationError(null);
    setIsRenameModalOpen(true);
  };

  const confirmRenameSqn = () => {
    const validation = validateSquadronRename(renameTargetSqn, renamedNewName, squadrons);
    if (!validation.isValid) {
      setRenameValidationError(validation.error || 'Invalid squadron name');
      return;
    }

    const result = onRenameSquadron(renameTargetSqn, renamedNewName.trim());
    if (result.success) {
      setIsRenameModalOpen(false);
      showFeedback(
        `Squadron renamed to "${renamedNewName.trim()}" with ${result.affectedCount ?? 0} historical ledger records cascaded.`,
      );
    } else {
      setRenameValidationError(result.error || 'Failed to rename squadron');
    }
  };

  // Delete Squadron Flow
  const openDeleteSqnModal = (sqnName: string) => {
    const validation = validateSquadronDeletion(sqnName, squadrons);
    if (!validation.isValid) {
      showFeedback(validation.error || 'Cannot delete squadron', true);
      return;
    }
    setSqnToDelete(sqnName);
    setIsDeleteSqnModalOpen(true);
  };

  const confirmDeleteSqn = () => {
    if (!sqnToDelete) return;
    const result = onDeleteSquadron(sqnToDelete);
    setIsDeleteSqnModalOpen(false);
    if (result.success) {
      showFeedback(`Squadron "${sqnToDelete}" has been removed from canteen database.`);
    } else {
      showFeedback(result.error || 'Failed to delete squadron', true);
    }
  };

  // Delete Room Flow
  const openDeleteRoomModal = (sqnName: string, roomName: string) => {
    const sqn = squadrons.find((s) => s.name === sqnName);
    if (!sqn) return;

    const validation = validateRoomDeletion(roomName, sqn.rooms);
    if (!validation.isValid) {
      showFeedback(validation.error || 'Cannot delete room', true);
      return;
    }

    setRoomToDelete({ sqnName, roomName });
    setIsDeleteRoomModalOpen(true);
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    const res = onDeleteRoom(roomToDelete.sqnName, roomToDelete.roomName);
    setIsDeleteRoomModalOpen(false);
    if (res.success) {
      showFeedback(`"${roomToDelete.roomName}" removed from ${roomToDelete.sqnName} Squadron.`);
    } else {
      showFeedback(res.error || 'Failed to delete room', true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Navigation Top Bar */}
      {onBackToHub && (
        <div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={onBackToHub}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--baf-gold)' }}
          >
            <ArrowLeft size={14} />
            <span>RETURN TO SETTINGS HUB</span>
          </button>
        </div>
      )}

      {/* Critical Warning / Operational Notice Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid var(--baf-gold)',
          borderRadius: 'var(--radius-sm, 6px)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
        }}
      >
        <AlertTriangle size={22} color="var(--baf-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              color: 'var(--baf-gold)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            BAF RTS SQUADRON &amp; BARRACK ALLOCATION DIRECTORY
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: 1.45 }}>
            <strong>STRICT WARNING:</strong> Modifying squadron designations or removing barrack rooms directly impacts recruits daily meal sheets, monthly billing statements, and pre-dues records. All squadron renames automatically cascade through database ledgers to prevent data corruption.
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: feedbackMessage.isError ? 'rgba(220, 38, 38, 0.15)' : 'rgba(22, 101, 52, 0.15)',
            border: `1px solid ${feedbackMessage.isError ? 'var(--baf-red)' : 'var(--baf-green)'}`,
            borderRadius: 'var(--radius-sm, 6px)',
            color: feedbackMessage.isError ? 'var(--baf-red)' : 'var(--baf-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          {feedbackMessage.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 1. Recruits Entry Intake Batches */}
      <div className="room-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Layers size={18} color="var(--baf-gold)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recruits Intake Batches</h3>
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Select or add training batches at RTS. Active entry dictates active meal ledger calculation.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {entries.map((ent) => {
            const isActive = ent.entryNo === activeEntryNo;
            return (
              <div
                key={ent.entryNo}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: isActive ? '2px solid var(--baf-gold)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Entry {ent.entryNo}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ent.status || 'ACTIVE'}</div>
                </div>

                {isActive ? (
                  <span className="tactical-badge" style={{ backgroundColor: 'var(--baf-gold)', color: '#000', fontWeight: 800 }}>
                    ACTIVE
                  </span>
                ) : (
                  <button
                    type="button"
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

        <form onSubmit={handleCreateEntry} style={{ display: 'flex', gap: '0.5rem', maxWidth: '360px' }}>
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

      {/* 2. Squadron Management & Barrack Rooms */}
      <div className="room-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Shield size={18} color="var(--baf-sky-blue)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Squadrons Directory</h3>
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Select a squadron to inspect, rename, add custom barrack rooms, or deactivate.
        </p>

        {/* Squadron Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {squadrons.map((sqn) => {
            const isSelected = sqn.name === currentSqn?.name;
            return (
              <button
                key={sqn.name}
                type="button"
                className={`tactical-btn ${isSelected ? '' : 'secondary'}`}
                style={{
                  border: isSelected ? '2px solid var(--baf-sky-blue)' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onClick={() => onSelectSquadron(sqn.name)}
              >
                <Building2 size={14} />
                <span>
                  {sqn.name} ({sqn.rooms.length} Rooms)
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Squadron Control Card */}
        {currentSqn && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface-hover)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--baf-gold)' }}>
                  ACTIVE SQUADRON INSPECTION
                </div>
                <h4 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem' }}>{currentSqn.name} Squadron</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Total Allocations: {currentSqn.rooms.length} Barrack Rooms
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => openRenameModal(currentSqn.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Edit3 size={14} />
                  <span>RENAME SQUADRON</span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => openDeleteSqnModal(currentSqn.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Trash2 size={14} />
                  <span>DEACTIVATE SQUADRON</span>
                </button>
              </div>
            </div>

            {/* Room Allocation Grid */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                Barrack Rooms in {currentSqn.name}:
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {currentSqn.rooms.map((room) => (
                  <div
                    key={room}
                    style={{
                      padding: '0.5rem 0.65rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {room}
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--baf-red)',
                        padding: '2px',
                      }}
                      title={`Remove ${room} from ${currentSqn.name}`}
                      onClick={() => openDeleteRoomModal(currentSqn.name, room)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Room to Current Squadron */}
            <div>
              <form onSubmit={handleCreateRoom} style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
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
          </div>
        )}

        {/* Add New Squadron Form */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Register New Squadron:
          </div>
          <form onSubmit={handleCreateSqn} style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px' }}>
            <input
              type="text"
              required
              placeholder="Squadron Name (e.g. Matiur Rahman)"
              className="select-control"
              style={{ flex: 1 }}
              value={newSqnName}
              onChange={(e) => setNewSqnName(e.target.value)}
            />
            <button type="submit" className="tactical-btn secondary">
              <PlusCircle size={15} />
              <span>REGISTER SQUADRON</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Rename Squadron Modal with Cascading Warnings */}
      {isRenameModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-card" style={{ maxWidth: '520px', border: '2px solid var(--baf-gold)' }}>
            <div className="modal-header" style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--baf-gold)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Strict Warning: Rename Squadron</h3>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid var(--baf-gold)',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.83rem',
                  lineHeight: 1.45,
                  color: '#e2e8f0',
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--baf-gold)', marginBottom: '0.25rem' }}>
                  CASCADE REINDEXING NOTICE:
                </div>
                Renaming <strong>{renameTargetSqn} Squadron</strong> will rewrite all historical recruit meal ledgers, pre-dues, and closing statements stored under this squadron across all intake entries.
              </div>

              {renameValidationError && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid var(--baf-red)',
                    borderRadius: '6px',
                    color: 'var(--baf-red)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Info size={15} />
                  <span>{renameValidationError}</span>
                </div>
              )}

              <div>
                <label className="stat-label">CURRENT DESIGNATION</label>
                <input
                  type="text"
                  disabled
                  value={renameTargetSqn}
                  className="input-control"
                  style={{ width: '100%', marginBottom: '1rem', opacity: 0.7 }}
                />

                <label className="stat-label">NEW SQUADRON DESIGNATION</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bir Sreshtho Matiur Rahman"
                  value={renamedNewName}
                  onChange={(e) => {
                    setRenamedNewName(e.target.value);
                    setRenameValidationError(null);
                  }}
                  className="input-control"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsRenameModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmRenameSqn}
              >
                CONFIRM CASCADE RENAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Squadron Strict Warning Modal */}
      <StrictWarningModal
        isOpen={isDeleteSqnModalOpen}
        title="Deactivate / Remove Squadron"
        targetIdentifier={`${sqnToDelete} Squadron`}
        severity="DANGER"
        consequences={[
          'All barrack room allocations under this squadron will be deregistered.',
          'Recruits currently assigned to this squadron will become unallocated in daily meal sheets.',
          'Historical entries must retain archival records; deleting an active squadron requires military authorization.',
        ]}
        requiredConfirmationText="DELETE"
        confirmButtonText="PERMANENTLY DEACTIVATE"
        onConfirm={confirmDeleteSqn}
        onClose={() => setIsDeleteSqnModalOpen(false)}
      />

      {/* 5. Delete Room Strict Warning Modal */}
      <StrictWarningModal
        isOpen={isDeleteRoomModalOpen}
        title="Remove Barrack Room Allocation"
        targetIdentifier={`${roomToDelete?.roomName} (${roomToDelete?.sqnName} Sqn)`}
        severity="WARNING"
        consequences={[
          'Recruits currently lodged in this barrack room will lose room association.',
          'Daily meal registers for this specific room will no longer appear on the active daily ledger grid.',
          'Prior historical financial totals in monthly audit will remain, but the room slot will be retired.',
        ]}
        confirmButtonText="REMOVE ROOM"
        onConfirm={confirmDeleteRoom}
        onClose={() => setIsDeleteRoomModalOpen(false)}
      />
    </div>
  );
};
