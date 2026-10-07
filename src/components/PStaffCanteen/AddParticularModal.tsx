import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { APP_CONFIG } from '../../constants/canteen.constants';
import type { IPStaff } from '../../types/canteen.types';

interface AddParticularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Partial<IPStaff>) => void;
  initialQuery?: string;
}

export const AddParticularModal: React.FC<AddParticularModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuery = '',
}) => {
  const [newBdNo, setNewBdNo] = useState(() =>
    /^\d+$/.test(initialQuery.trim()) ? initialQuery.trim() : '',
  );
  const [newName, setNewName] = useState(() =>
    !/^\d+$/.test(initialQuery.trim()) ? initialQuery.trim() : '',
  );
  const [newRank, setNewRank] = useState<string>(APP_CONFIG.ranks[0]);
  const [newOffice, setNewOffice] = useState('RTS HQ');
  const [newPhone, setNewPhone] = useState('');
  const [newPreDue, setNewPreDue] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBdNo.trim() || !newName.trim()) return;

    onSave({
      bdNo: newBdNo.trim(),
      name: newName.trim(),
      rank: newRank,
      office: newOffice.trim(),
      phone: newPhone.trim(),
      preDue: parseFloat(newPreDue) || 0,
      isActive: true,
      dailyExpenses: {},
      payments: [],
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
            Add New Particular / P-Staff
          </h3>
          <button
            className="tactical-btn secondary"
            style={{ padding: '0.25rem 0.5rem' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

          <div style={{ marginTop: '0.75rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div>
              <label className="stat-label">OFFICE / BRANCH</label>
              <input
                type="text"
                className="select-control"
                style={{ width: '100%', marginTop: '0.25rem' }}
                placeholder="e.g. RTS HQ"
                value={newOffice}
                onChange={(e) => setNewOffice(e.target.value)}
              />
            </div>
            <div>
              <label className="stat-label">PRE-DUE BALANCE (৳)</label>
              <input
                type="number"
                className="select-control"
                style={{ width: '100%', marginTop: '0.25rem' }}
                placeholder="0"
                value={newPreDue}
                onChange={(e) => setNewPreDue(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label className="stat-label">CONTACT PHONE</label>
            <input
              type="tel"
              className="select-control"
              style={{ width: '100%', marginTop: '0.25rem' }}
              placeholder="017xxxxxxxx"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="tactical-btn secondary"
              onClick={onClose}
            >
              CANCEL
            </button>
            <button type="submit" className="tactical-btn">
              <UserPlus size={15} />
              <span>REGISTER PARTICULAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
