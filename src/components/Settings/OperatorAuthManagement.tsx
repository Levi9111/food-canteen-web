import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
  PlusCircle,
  X,
} from 'lucide-react';
import type { IUser } from '../../types/canteen.types';
import { APP_CONFIG } from '../../constants/canteen.constants';

interface OperatorAuthManagementProps {
  currentUser: IUser;
  operators: IUser[];
  onAddOperator: (op: Partial<IUser> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  onDeleteOperator: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const OperatorAuthManagement: React.FC<OperatorAuthManagementProps> = ({
  currentUser,
  operators,
  onAddOperator,
  onDeleteOperator,
}) => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState<string>(APP_CONFIG.ranks[0]);
  const [newBdNo, setNewBdNo] = useState('');
  const [newRole, setNewRole] = useState<'NCOIC' | 'JCOIC'>('NCOIC');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check current occupancies
  const existingNcoic = operators.find((op) => op.role === 'NCOIC');
  const existingJcoic = operators.find((op) => op.role === 'JCOIC');

  const handleOpenEnroll = () => {
    setErrorMessage(null);
    setStatusMessage(null);

    // Auto-select missing counterpart role
    if (!existingNcoic && existingJcoic) {
      setNewRole('NCOIC');
    } else if (existingNcoic && !existingJcoic) {
      setNewRole('JCOIC');
    }

    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    // Military check: strictly max 1 NCOIC & 1 JCOIC
    if (newRole === 'NCOIC' && existingNcoic) {
      setErrorMessage(
        'Military Rule Violation: An NCOIC already exists. Maximum 1 NCOIC is permitted at RTS.',
      );
      return;
    }
    if (newRole === 'JCOIC' && existingJcoic) {
      setErrorMessage(
        'Military Rule Violation: A JCOIC already exists. Maximum 1 JCOIC is permitted at RTS.',
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await onAddOperator({
      username: newUsername.trim(),
      name: newName.trim(),
      rank: newRank,
      bdNo: newBdNo.trim(),
      role: newRole,
      password: newPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsEnrollModalOpen(false);
      setStatusMessage(`Operator ${newName} enrolled successfully as ${newRole}.`);
      setNewUsername('');
      setNewName('');
      setNewBdNo('');
      setNewPassword('');
    } else {
      setErrorMessage(res.error || 'Failed to enroll operator.');
    }
  };

  const handleDelete = async (targetOp: IUser) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const targetId = targetOp._id || targetOp.userId || targetOp.id || '';
    const myId = currentUser._id || currentUser.userId || currentUser.id || '';

    // Rule 1: Self-removal is strictly blocked
    if (targetOp.bdNo === currentUser.bdNo || (targetId && targetId === myId)) {
      setErrorMessage(
        'Self-removal strictly prohibited. You cannot revoke your own military credentials.',
      );
      return;
    }

    // Rule 2: Mutual counterpart removal only
    if (currentUser.role === 'NCOIC' && targetOp.role !== 'JCOIC') {
      setErrorMessage('As NCOIC, you may only revoke your JCOIC counterpart.');
      return;
    }
    if (currentUser.role === 'JCOIC' && targetOp.role !== 'NCOIC') {
      setErrorMessage('As JCOIC, you may only revoke your NCOIC counterpart.');
      return;
    }

    const confirmMsg = `Confirm revocation of military operator credentials for ${targetOp.rank} ${targetOp.name} (${targetOp.role})?`;
    if (!window.confirm(confirmMsg)) return;

    const res = await onDeleteOperator(targetId);
    if (res.success) {
      setStatusMessage(`Operator ${targetOp.name} has been removed.`);
    } else {
      setErrorMessage(res.error || 'Failed to remove operator.');
    }
  };

  return (
    <div>
      {/* Notifications */}
      {statusMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(22, 101, 52, 0.15)',
            border: '1px solid var(--status-success)',
            borderRadius: '6px',
            color: 'var(--status-success)',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid var(--status-danger)',
            borderRadius: '6px',
            color: 'var(--status-danger)',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Protocol Status Banner */}
      <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--baf-gold)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>BAF RTS Military Operator Protocol</h3>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Strict duty governance: Maximum 1 NCOIC &amp; 1 JCOIC. Mutual counterpart accountability enforced.
            </p>
          </div>

          <div>
            {existingNcoic && existingJcoic ? (
              <span className="tactical-badge" style={{ backgroundColor: 'rgba(225, 29, 72, 0.2)', color: 'var(--status-danger)' }}>
                SLOTS FULL (2/2)
              </span>
            ) : (
              <button className="tactical-btn" onClick={handleOpenEnroll}>
                <PlusCircle size={15} />
                <span>ENROLL COUNTERPART</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Operator Cards (NCOIC & JCOIC) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* NCOIC Slot */}
        <div
          className="room-card"
          style={{
            padding: '1.25rem',
            borderColor: existingNcoic ? 'var(--border-color)' : 'rgba(225, 29, 72, 0.4)',
          }}
        >
          <div className="room-header">
            <span className="tactical-badge" style={{ backgroundColor: 'var(--baf-navy)', color: '#fff' }}>
              NCOIC ROLE
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Non-Commissioned Officer in-Charge
            </span>
          </div>

          {existingNcoic ? (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {existingNcoic.rank} {existingNcoic.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                BD No: {existingNcoic.bdNo} &nbsp;|&nbsp; User: {existingNcoic.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', color: 'var(--status-success)', fontSize: '0.8rem' }}>
                <UserCheck size={14} />
                <span>Duty Active &amp; Verified</span>
              </div>

              {currentUser.role === 'JCOIC' && (
                <button
                  className="tactical-btn danger"
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => handleDelete(existingNcoic)}
                >
                  <UserX size={15} />
                  <span>REVOKE NCOIC CREDENTIALS</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '0.5rem' }}>Vacancy: No active NCOIC registered</div>
              {currentUser.role === 'JCOIC' && (
                <button
                  className="tactical-btn"
                  onClick={() => {
                    setNewRole('NCOIC');
                    setIsEnrollModalOpen(true);
                  }}
                >
                  <PlusCircle size={14} />
                  <span>ENROLL NCOIC</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* JCOIC Slot */}
        <div
          className="room-card"
          style={{
            padding: '1.25rem',
            borderColor: existingJcoic ? 'var(--border-color)' : 'rgba(225, 29, 72, 0.4)',
          }}
        >
          <div className="room-header">
            <span className="tactical-badge" style={{ backgroundColor: 'var(--baf-navy)', color: '#fff' }}>
              JCOIC ROLE
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Junior Commissioned Officer in-Charge
            </span>
          </div>

          {existingJcoic ? (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {existingJcoic.rank} {existingJcoic.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                BD No: {existingJcoic.bdNo} &nbsp;|&nbsp; User: {existingJcoic.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', color: 'var(--status-success)', fontSize: '0.8rem' }}>
                <UserCheck size={14} />
                <span>Duty Active &amp; Verified</span>
              </div>

              {currentUser.role === 'NCOIC' && (
                <button
                  className="tactical-btn danger"
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => handleDelete(existingJcoic)}
                >
                  <UserX size={15} />
                  <span>REVOKE JCOIC CREDENTIALS</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '0.5rem' }}>Vacancy: No active JCOIC registered</div>
              {currentUser.role === 'NCOIC' && (
                <button
                  className="tactical-btn"
                  onClick={() => {
                    setNewRole('JCOIC');
                    setIsEnrollModalOpen(true);
                  }}
                >
                  <PlusCircle size={14} />
                  <span>ENROLL JCOIC</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
                Enroll Counterpart Operator
              </h3>
              <button
                className="tactical-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => setIsEnrollModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="stat-label">OPERATOR ROLE *</label>
                  <select
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'NCOIC' | 'JCOIC')}
                  >
                    <option value="NCOIC" disabled={!!existingNcoic}>
                      NCOIC {existingNcoic ? '(OCCUPIED)' : ''}
                    </option>
                    <option value="JCOIC" disabled={!!existingJcoic}>
                      JCOIC {existingJcoic ? '(OCCUPIED)' : ''}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="stat-label">RANK *</label>
                  <select
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                  >
                    {APP_CONFIG.ranks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label className="stat-label">BD NO *</label>
                  <input
                    type="text"
                    required
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="e.g. 543210"
                    value={newBdNo}
                    onChange={(e) => setNewBdNo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="stat-label">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="e.g. Md Tariqul Islam"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label className="stat-label">LOGIN USERNAME *</label>
                  <input
                    type="text"
                    required
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="e.g. ncoic.tariqul"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="stat-label">SECURE PASSWORD *</label>
                  <input
                    type="password"
                    required
                    className="select-control"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="tactical-btn secondary"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="tactical-btn" disabled={isSubmitting}>
                  <UserCheck size={15} />
                  <span>{isSubmitting ? 'ENROLLING...' : 'CONFIRM ENROLLMENT'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
