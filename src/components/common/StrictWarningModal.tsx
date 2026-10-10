import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import type { TStrictActionSeverity } from '../../types/canteen.types';

export interface StrictWarningModalProps {
  isOpen: boolean;
  title: string;
  targetIdentifier?: string;
  severity?: TStrictActionSeverity;
  consequences: string[];
  requiredConfirmationText?: string;
  confirmButtonText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const StrictWarningModal: React.FC<StrictWarningModalProps> = ({
  isOpen,
  title,
  targetIdentifier,
  severity = 'DANGER',
  consequences,
  requiredConfirmationText,
  confirmButtonText = 'PROCEED WITH ACTION',
  isProcessing = false,
  onConfirm,
  onClose,
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  if (!isOpen) return null;

  const isConfirmed = requiredConfirmationText
    ? typedConfirmation.trim().toUpperCase() === requiredConfirmationText.trim().toUpperCase()
    : true;

  const isCriticalOrDanger = severity === 'CRITICAL' || severity === 'DANGER';
  const accentColor = isCriticalOrDanger ? 'var(--baf-red, #dc2626)' : 'var(--baf-gold, #f59e0b)';
  const bgBadgeColor = isCriticalOrDanger ? 'rgba(220, 38, 38, 0.12)' : 'rgba(245, 158, 11, 0.12)';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '560px',
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 28px ${bgBadgeColor}`,
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            borderBottom: `1px solid ${accentColor}`,
            background: bgBadgeColor,
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isCriticalOrDanger ? (
              <ShieldAlert size={22} color={accentColor} />
            ) : (
              <AlertTriangle size={22} color={accentColor} />
            )}
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: accentColor,
                  textTransform: 'uppercase',
                }}
              >
                BAF RTS MILITARY MANDATE • STRICT ACTION WARNING
              </div>
              <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.08rem', color: '#fff' }}>
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {targetIdentifier && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-color, #334155)',
                borderRadius: '6px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                TARGET ENTITY:
              </span>
              <span
                className="font-mono"
                style={{ fontWeight: 800, fontSize: '0.92rem', color: accentColor }}
              >
                {targetIdentifier}
              </span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Operational Consequences &amp; Audit Impacts:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              {consequences.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.84rem',
                    color: '#e2e8f0',
                    lineHeight: 1.45,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {requiredConfirmationText && (
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px dashed var(--baf-red, #dc2626)',
                borderRadius: '6px',
              }}
            >
              <label
                htmlFor="strict-confirm-input"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#fca5a5',
                  marginBottom: '0.4rem',
                }}
              >
                TO CONFIRM, TYPE &quot;
                <strong style={{ color: '#fff' }}>{requiredConfirmationText}</strong>
                &quot; BELOW:
              </label>
              <input
                id="strict-confirm-input"
                type="text"
                autoComplete="off"
                placeholder={`Type "${requiredConfirmationText}" to unlock`}
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                className="input-control"
                style={{
                  width: '100%',
                  borderColor: isConfirmed && typedConfirmation ? 'var(--baf-green, #16a34a)' : undefined,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-color, #334155)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            CANCEL
          </button>

          <button
            type="button"
            className={isCriticalOrDanger ? 'btn btn-danger' : 'btn btn-primary'}
            disabled={!isConfirmed || isProcessing}
            onClick={onConfirm}
            style={{
              opacity: !isConfirmed || isProcessing ? 0.6 : 1,
              cursor: !isConfirmed || isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {isConfirmed && <CheckCircle2 size={15} />}
            <span>{isProcessing ? 'PROCESSING...' : confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
