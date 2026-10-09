import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  UserX,
  PlusCircle,
  X,
  BadgeCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import type { IUser } from '../../types/canteen.types';
import { APP_CONFIG } from '../../constants/canteen.constants';
import {
  validateOperatorEnrollment,
  validateOperatorRemoval,
} from '../../utils/operatorValidation';

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
  const [newRank, setNewRank] = useState<string>('MWO');
  const [newTrade, setNewTrade] = useState('Admin Tech');
  const [newBdNo, setNewBdNo] = useState('');
  const [newRole, setNewRole] = useState<'NCOIC' | 'JCOIC'>('JCOIC');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ncoicOperator = operators.find((op) => op.role === 'NCOIC');
  const jcoicOperator = operators.find((op) => op.role === 'JCOIC');

  const handleOpenEnroll = (targetRole: 'NCOIC' | 'JCOIC') => {
    setErrorMessage(null);
    setStatusMessage(null);
    setNewRole(targetRole);
    if (targetRole === 'JCOIC') {
      setNewRank('MWO');
      setNewTrade('Admin Tech');
      setNewUsername('jcoic');
    } else {
      setNewRank('Cpl');
      setNewTrade('E&I Fitter');
      setNewUsername('ncoic');
    }
    setNewName('');
    setNewBdNo('');
    setNewPassword('');
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const enrollmentValidation = validateOperatorEnrollment(newRole, operators);
    if (!enrollmentValidation.isValid) {
      setErrorMessage(enrollmentValidation.error || 'Position is already occupied.');
      return;
    }

    if (!newName.trim()) {
      setErrorMessage('Please enter the officer name.');
      return;
    }

    if (!newBdNo.trim()) {
      setErrorMessage('Please enter BD Number (e.g. 472770 or BD/472770).');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await onAddOperator({
      username: (newUsername.trim() || newBdNo.trim().replace(/[^0-9]/g, '') || newRole.toLowerCase()),
      name: newName.trim(),
      rank: newRank,
      trade: newTrade.trim(),
      bdNo: newBdNo.trim().startsWith('BD/') ? newBdNo.trim() : `BD/${newBdNo.trim()}`,
      role: newRole,
      password: newPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsEnrollModalOpen(false);
      setStatusMessage(`${newRank} ${newName} appointed successfully as ${newRole}.`);
      setNewName('');
      setNewBdNo('');
      setNewPassword('');
    } else {
      setErrorMessage(res.error || 'Failed to appoint officer.');
    }
  };

  const handleRelieve = async (targetOp: IUser) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const removalValidation = validateOperatorRemoval(currentUser, targetOp);
    if (!removalValidation.isValid) {
      setErrorMessage(removalValidation.error || 'Cannot relieve this position.');
      return;
    }

    const confirmMsg = `Relieve ${targetOp.rank} ${targetOp.name} from duty as ${targetOp.role}? The position will become vacant until a new appointment is made.`;
    if (!window.confirm(confirmMsg)) return;

    const targetId = targetOp._id || targetOp.userId || targetOp.id || '';
    const res = await onDeleteOperator(targetId);
    if (res.success) {
      setStatusMessage(`${targetOp.rank} ${targetOp.name} has been relieved from ${targetOp.role} duty.`);
    } else {
      setErrorMessage(res.error || 'Failed to relieve officer from position.');
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
            border: '1px solid var(--baf-green)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--baf-green)',
            marginBottom: '1rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <BadgeCheck size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid var(--baf-red)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--baf-red)',
            marginBottom: '1rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Section Banner */}
      <div className="room-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--baf-gold)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Canteen Duty In-Charge Appointments</h3>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Official military personnel assigned to manage daily sales, recruits meal registers, and financial ledgers.
            </p>
          </div>
        </div>
      </div>

      {/* 2 Position Cards: NCOIC and JCOIC */}
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
            borderTop: '4px solid var(--baf-gold)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--baf-gold)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DUTY ROLE 01
                </span>
                <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem' }}>NCOIC Canteen</h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Non-Commissioned Officer In-Charge
                </p>
              </div>

              {ncoicOperator ? (
                <span
                  className="tactical-badge"
                  style={{
                    backgroundColor: 'rgba(5, 150, 105, 0.15)',
                    color: 'var(--baf-green)',
                    border: '1px solid var(--baf-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <UserCheck size={12} /> ON DUTY
                </span>
              ) : (
                <span
                  className="tactical-badge"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--baf-gold)',
                    border: '1px solid var(--baf-gold)',
                  }}
                >
                  VACANT
                </span>
              )}
            </div>

            {ncoicOperator ? (
              <div
                style={{
                  background: 'var(--surface-hover)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">NAME &amp; RANK:</span>
                  <span style={{ fontWeight: 800 }}>
                    {ncoicOperator.rank} {ncoicOperator.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">BD NUMBER:</span>
                  <span className="mono-num" style={{ color: 'var(--baf-sky-blue)' }}>
                    {ncoicOperator.bdNo}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">TRADE:</span>
                  <span style={{ fontWeight: 700, color: 'var(--baf-gold)' }}>
                    {ncoicOperator.trade || 'E&I Fitter'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">LOGIN USERNAME:</span>
                  <span className="mono-num">{ncoicOperator.username}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                No NCOIC is currently appointed. Click below to assign an NCOIC.
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            {ncoicOperator ? (
              <button
                className="btn btn-danger"
                style={{ width: '100%' }}
                onClick={() => handleRelieve(ncoicOperator)}
              >
                <UserX size={15} />
                <span>RELIEVE FROM DUTY</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleOpenEnroll('NCOIC')}
              >
                <UserPlus size={15} />
                <span>APPOINT NCOIC</span>
              </button>
            )}
          </div>
        </div>

        {/* JCOIC Slot */}
        <div
          className="room-card"
          style={{
            borderTop: '4px solid var(--baf-sky-blue)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--baf-sky-blue)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DUTY ROLE 02
                </span>
                <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem' }}>JCOIC Canteen</h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Junior Commissioned Officer In-Charge
                </p>
              </div>

              {jcoicOperator ? (
                <span
                  className="tactical-badge"
                  style={{
                    backgroundColor: 'rgba(5, 150, 105, 0.15)',
                    color: 'var(--baf-green)',
                    border: '1px solid var(--baf-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <UserCheck size={12} /> ON DUTY
                </span>
              ) : (
                <span
                  className="tactical-badge"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--baf-gold)',
                    border: '1px solid var(--baf-gold)',
                  }}
                >
                  VACANT
                </span>
              )}
            </div>

            {jcoicOperator ? (
              <div
                style={{
                  background: 'var(--surface-hover)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">NAME &amp; RANK:</span>
                  <span style={{ fontWeight: 800 }}>
                    {jcoicOperator.rank} {jcoicOperator.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">BD NUMBER:</span>
                  <span className="mono-num" style={{ color: 'var(--baf-sky-blue)' }}>
                    {jcoicOperator.bdNo}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">TRADE:</span>
                  <span style={{ fontWeight: 700, color: 'var(--baf-gold)' }}>
                    {jcoicOperator.trade || 'Admin Tech'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="stat-label">LOGIN USERNAME:</span>
                  <span className="mono-num">{jcoicOperator.username}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                No JCOIC currently appointed. The NCOIC operates as active duty manager until you appoint a JCOIC.
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            {jcoicOperator ? (
              <button
                className="btn btn-danger"
                style={{ width: '100%' }}
                onClick={() => handleRelieve(jcoicOperator)}
              >
                <UserX size={15} />
                <span>RELIEVE FROM DUTY</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleOpenEnroll('JCOIC')}
              >
                <UserPlus size={15} />
                <span>APPOINT JCOIC</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {isEnrollModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={18} color="var(--baf-gold)" />
                <h3>Appoint {newRole} In-Charge</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="modal-body">
                <div>
                  <label className="stat-label">ASSIGNED POSITION</label>
                  <input
                    type="text"
                    disabled
                    value={newRole === 'NCOIC' ? 'NCOIC (Non-Commissioned Officer In-Charge)' : 'JCOIC (Junior Commissioned Officer In-Charge)'}
                    className="input-control"
                    style={{ width: '100%', opacity: 0.85, fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="stat-label">RANK</label>
                    <select
                      value={newRank}
                      onChange={(e) => setNewRank(e.target.value)}
                      className="select-control"
                      style={{ width: '100%' }}
                    >
                      {APP_CONFIG.ranks.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="stat-label">TRADE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admin Tech / E&I Fitter"
                      value={newTrade}
                      onChange={(e) => setNewTrade(e.target.value)}
                      className="input-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="stat-label">OFFICER FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mostafa Kamal"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-control"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="stat-label">BD NUMBER</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 489110 or BD/489110"
                      value={newBdNo}
                      onChange={(e) => setNewBdNo(e.target.value)}
                      className="input-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label className="stat-label">SYSTEM USERNAME</label>
                    <input
                      type="text"
                      placeholder="e.g. jcoic"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="input-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="stat-label">SIGN-IN PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-control"
                    style={{ width: '100%' }}
                  />
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Officer can log in using their BD Number or this username and password.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'APPOINTING...' : 'CONFIRM APPOINTMENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
