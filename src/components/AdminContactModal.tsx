import React, { useState } from 'react';
import { CreditCard, Copy, Check, X, Phone, Building } from 'lucide-react';
import { APP_CONFIG } from '../constants/canteen.constants';

interface AdminContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminContactModal: React.FC<AdminContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="var(--baf-gold)" />
            <h3>OFFICIAL CANTEEN PAYMENT CREDENTIALS</h3>
          </div>
          <button
            onClick={onClose}
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
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            P-Staff members and personnel depositing canteen bills may remit directly
            via the official channels below. Click any credential to copy.
          </p>

          {/* bKash */}
          <div
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--card-border)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#E11D48',
                }}
              >
                <span>bKash Personal:</span>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  handleCopy(APP_CONFIG.adminContact.bkash, 'bkash')
                }
              >
                {copiedKey === 'bkash' ? (
                  <>
                    <Check size={12} color="var(--baf-green)" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy size={12} /> COPY
                  </>
                )}
              </button>
            </div>
            <div
              className="mono-num"
              style={{ fontSize: '0.95rem', fontWeight: 800 }}
            >
              {APP_CONFIG.adminContact.bkash}
            </div>
          </div>

          {/* Bank Account */}
          <div
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--card-border)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: 'var(--baf-sky-blue)',
                }}
              >
                <Building size={14} />
                <span>Bank Account:</span>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  handleCopy(APP_CONFIG.adminContact.bankAccount, 'bank')
                }
              >
                {copiedKey === 'bank' ? (
                  <>
                    <Check size={12} color="var(--baf-green)" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy size={12} /> COPY
                  </>
                )}
              </button>
            </div>
            <div
              className="mono-num"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {APP_CONFIG.adminContact.bankAccount}
            </div>
          </div>

          {/* WhatsApp / Contact */}
          <div
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--card-border)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: 'var(--baf-green)',
                }}
              >
                <Phone size={14} />
                <span>WhatsApp Duty Support:</span>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  handleCopy(APP_CONFIG.adminContact.whatsapp, 'whatsapp')
                }
              >
                {copiedKey === 'whatsapp' ? (
                  <>
                    <Check size={12} color="var(--baf-green)" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy size={12} /> COPY
                  </>
                )}
              </button>
            </div>
            <div
              className="mono-num"
              style={{ fontSize: '0.95rem', fontWeight: 800 }}
            >
              {APP_CONFIG.adminContact.whatsapp}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '0.2rem',
              }}
            >
              Contact Person: {APP_CONFIG.adminContact.officer}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-navy" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
