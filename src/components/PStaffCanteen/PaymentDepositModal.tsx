import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import type { IPStaff } from '../../types/canteen.types';

interface PaymentDepositModalProps {
  isOpen: boolean;
  staff: IPStaff | null;
  selectedDate: string;
  onClose: () => void;
  onSavePayment: (staffId: string, date: string, amount: number) => void;
}

export const PaymentDepositModal: React.FC<PaymentDepositModalProps> = ({
  isOpen,
  staff,
  selectedDate,
  onClose,
  onSavePayment,
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!isOpen || !staff) return null;

  const handleSave = () => {
    const num = parseFloat(paymentAmount) || 0;
    if (num > 0) {
      onSavePayment(staff._id || staff.bdNo, selectedDate, num);
    }
    setPaymentAmount('');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--baf-navy)' }}>
            Deposit / Random Payment
          </h3>
          <button
            className="tactical-btn secondary"
            style={{ padding: '0.25rem 0.5rem' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ margin: '1rem 0' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            <strong>{staff.rank} {staff.name}</strong> (BD/{staff.bdNo})
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Payment Date: {selectedDate}
          </div>

          <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
            PAYMENT AMOUNT (৳)
          </label>
          <input
            type="number"
            className="calculator-display"
            placeholder="0.00"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            autoFocus
            style={{ width: '100%', height: '48px', fontSize: '1.3rem' }}
          />
        </div>

        <div className="modal-actions">
          <button
            className="tactical-btn secondary"
            onClick={onClose}
          >
            CANCEL
          </button>
          <button className="tactical-btn" onClick={handleSave}>
            <CreditCard size={15} />
            <span>SAVE PAYMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
