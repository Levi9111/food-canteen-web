import React, { useState } from 'react';
import { Calculator, X, Check, Zap, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (amount: number) => void;
  title?: string;
  initialValue?: number;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  title = 'CANTEEN EXPENSE CALCULATOR',
  initialValue = 0,
}) => {
  const [expression, setExpression] = useState(
    initialValue > 0 ? initialValue.toString() : '',
  );
  const [activeNumber, setActiveNumber] = useState(
    initialValue > 0 ? initialValue.toString() : '',
  );
  const [runningTotal, setRunningTotal] = useState(initialValue);

  if (!isOpen) return null;

  const evaluateSafe = (expr: string): number => {
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.]/g, '');
      if (!sanitized) return 0;
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const rounded = Math.round(result * 100) / 100;
        setRunningTotal(rounded);
        return rounded;
      }
    } catch {
      // Incomplete formula, keep previous running total
    }
    return runningTotal;
  };

  const handleDigit = (digit: string) => {
    if (digit === '.' && activeNumber.includes('.')) return;
    const nextActive = activeNumber + digit;
    const nextExpr = expression + digit;
    setActiveNumber(nextActive);
    setExpression(nextExpr);
    evaluateSafe(nextExpr);
  };

  const handleOperator = (op: string) => {
    if (!expression) return;
    const lastChar = expression[expression.length - 1];
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op);
    } else {
      setExpression(expression + op);
      setActiveNumber('');
    }
  };

  const handleClear = () => {
    setExpression('');
    setActiveNumber('');
    setRunningTotal(0);
  };

  const handleBackspace = () => {
    if (!expression) return;
    const nextExpr = expression.slice(0, -1);
    setExpression(nextExpr);
    setActiveNumber((prev) => (prev ? prev.slice(0, -1) : ''));
    evaluateSafe(nextExpr);
  };

  const handleQuickAdd = (amount: number) => {
    if (!expression || ['+', '-', '×', '÷'].includes(expression[expression.length - 1])) {
      const nextExpr = expression + amount;
      setExpression(nextExpr);
      setActiveNumber(amount.toString());
      evaluateSafe(nextExpr);
    } else {
      const nextExpr = `${expression}+${amount}`;
      setExpression(nextExpr);
      setActiveNumber(amount.toString());
      evaluateSafe(nextExpr);
    }
  };

  const handleApply = () => {
    const finalVal = evaluateSafe(expression);
    onApply(finalVal);
    onClose();
  };

  const quickPills = [10, 20, 50, 100];

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(2, 6, 18, 0.75)' }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '380px',
          background: 'linear-gradient(180deg, #0A1424 0%, #060D18 100%)',
          border: '1.8px solid var(--baf-gold)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Cockpit HUD Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #001F3F 0%, #0F2A4A 100%)',
            padding: '0.85rem 1.15rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '8px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calculator size={16} color="var(--baf-gold)" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--baf-sky-blue)',
                  letterSpacing: '0.04em',
                  fontWeight: 700,
                }}
              >
                TACTICAL RAPID ENTRY MATRIX
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#CBD5E1',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* OLED Bezel Screen */}
          <div
            style={{
              background: '#02060D',
              border: '1.2px solid #1E3A5F',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              boxShadow: 'inset 0 3px 10px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              minHeight: '75px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.2rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.08em',
                  fontWeight: 800,
                  color: 'var(--baf-sky-blue)',
                  background: 'rgba(2, 132, 199, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                }}
              >
                FORMULA
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#94A3B8',
                  letterSpacing: '0.05em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '220px',
                }}
              >
                {expression || '0'}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#FFB800',
                textShadow: '0 0 12px rgba(255, 184, 0, 0.4)',
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              ৳ {runningTotal.toFixed(2)}
            </div>
          </div>

          {/* Quick-Add Chips */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--baf-gold)',
                letterSpacing: '0.06em',
                marginBottom: '0.35rem',
              }}
            >
              <Zap size={11} />
              <span>RAPID PRESET CHIPS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
              {quickPills.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  style={{
                    background: 'linear-gradient(180deg, #162C47 0%, #0E1D31 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    color: '#FFD700',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    padding: '0.4rem 0',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFD700';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Tactical Keypad Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.45rem',
            }}
          >
            {/* Row 1 */}
            <button
              className="calc-tactical-btn calc-btn-danger"
              onClick={handleClear}
              style={{
                background: 'linear-gradient(180deg, #3E1620 0%, #290B13 100%)',
                color: '#FF6B81',
                border: '1px solid #7D1D30',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              C
            </button>
            <button
              className="calc-tactical-btn"
              onClick={handleBackspace}
              style={{
                background: 'linear-gradient(180deg, #3E1620 0%, #290B13 100%)',
                color: '#FF6B81',
                border: '1px solid #7D1D30',
                borderRadius: '8px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Delete size={16} />
            </button>
            <button
              className="calc-tactical-btn calc-btn-op"
              onClick={() => handleOperator('÷')}
              style={{
                background: 'linear-gradient(180deg, #162E4D 0%, #0D1F35 100%)',
                color: 'var(--baf-gold)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              ÷
            </button>
            <button
              className="calc-tactical-btn calc-btn-op"
              onClick={() => handleOperator('×')}
              style={{
                background: 'linear-gradient(180deg, #162E4D 0%, #0D1F35 100%)',
                color: 'var(--baf-gold)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            {/* Row 2 */}
            {['7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                style={{
                  background: 'linear-gradient(180deg, #182A40 0%, #111D2D 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #233A57',
                  borderRadius: '8px',
                  height: '42px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOperator('-')}
              style={{
                background: 'linear-gradient(180deg, #162E4D 0%, #0D1F35 100%)',
                color: 'var(--baf-gold)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              -
            </button>

            {/* Row 3 */}
            {['4', '5', '6'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                style={{
                  background: 'linear-gradient(180deg, #182A40 0%, #111D2D 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #233A57',
                  borderRadius: '8px',
                  height: '42px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOperator('+')}
              style={{
                background: 'linear-gradient(180deg, #162E4D 0%, #0D1F35 100%)',
                color: 'var(--baf-gold)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              +
            </button>

            {/* Row 4 */}
            {['1', '2', '3'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                style={{
                  background: 'linear-gradient(180deg, #182A40 0%, #111D2D 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #233A57',
                  borderRadius: '8px',
                  height: '42px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => evaluateSafe(expression)}
              style={{
                background: 'linear-gradient(180deg, #1C7430 0%, #155724 100%)',
                color: '#FFFFFF',
                border: '1px solid #28A745',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              =
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleDigit('0')}
              style={{
                gridColumn: 'span 2',
                background: 'linear-gradient(180deg, #182A40 0%, #111D2D 100%)',
                color: '#FFFFFF',
                border: '1px solid #233A57',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              0
            </button>
            <button
              onClick={() => handleDigit('.')}
              style={{
                background: 'linear-gradient(180deg, #182A40 0%, #111D2D 100%)',
                color: '#FFFFFF',
                border: '1px solid #233A57',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              .
            </button>
            <button
              onClick={handleApply}
              style={{
                background: 'linear-gradient(180deg, #D4AF37 0%, #B89628 100%)',
                color: '#001F3F',
                border: '1px solid #FFD700',
                borderRadius: '8px',
                height: '42px',
                fontWeight: 900,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
              }}
            >
              <Check size={16} />
              APPLY
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid #1E2D44',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            CANCEL
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApply}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            APPLY ৳ {runningTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
