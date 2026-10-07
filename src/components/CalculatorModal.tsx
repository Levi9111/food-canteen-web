import React, { useState } from 'react';
import { Calculator, X, Check } from 'lucide-react';

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
    evaluateSafe(nextExpr);
  };

  const evaluateSafe = (expr: string) => {
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.]/g, '');
      if (!sanitized) {
        setRunningTotal(0);
        return;
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        setRunningTotal(Math.round(result * 100) / 100);
      }
    } catch {
      // Expression incomplete, keep running total
    }
  };

  const handleApply = () => {
    evaluateSafe(expression);
    onApply(runningTotal);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={18} color="var(--baf-gold)" />
            <h3>{title}</h3>
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
          <div className="calc-display">
            <div className="calc-expression">{expression || '0'}</div>
            <div className="calc-result">৳ {runningTotal.toFixed(2)}</div>
          </div>

          <div className="calc-grid">
            <button className="calc-btn calc-btn-danger" onClick={handleClear}>
              C
            </button>
            <button className="calc-btn" onClick={handleBackspace}>
              DEL
            </button>
            <button
              className="calc-btn calc-btn-op"
              onClick={() => handleOperator('÷')}
            >
              ÷
            </button>
            <button
              className="calc-btn calc-btn-op"
              onClick={() => handleOperator('×')}
            >
              ×
            </button>

            <button className="calc-btn" onClick={() => handleDigit('7')}>
              7
            </button>
            <button className="calc-btn" onClick={() => handleDigit('8')}>
              8
            </button>
            <button className="calc-btn" onClick={() => handleDigit('9')}>
              9
            </button>
            <button
              className="calc-btn calc-btn-op"
              onClick={() => handleOperator('-')}
            >
              -
            </button>

            <button className="calc-btn" onClick={() => handleDigit('4')}>
              4
            </button>
            <button className="calc-btn" onClick={() => handleDigit('5')}>
              5
            </button>
            <button className="calc-btn" onClick={() => handleDigit('6')}>
              6
            </button>
            <button
              className="calc-btn calc-btn-op"
              onClick={() => handleOperator('+')}
            >
              +
            </button>

            <button className="calc-btn" onClick={() => handleDigit('1')}>
              1
            </button>
            <button className="calc-btn" onClick={() => handleDigit('2')}>
              2
            </button>
            <button className="calc-btn" onClick={() => handleDigit('3')}>
              3
            </button>
            <button
              className="calc-btn calc-btn-op"
              onClick={() => evaluateSafe(expression)}
            >
              =
            </button>

            <button
              className="calc-btn"
              style={{ gridColumn: 'span 2' }}
              onClick={() => handleDigit('0')}
            >
              0
            </button>
            <button className="calc-btn" onClick={() => handleDigit('.')}>
              .
            </button>
            <button
              className="btn btn-primary"
              style={{ height: '44px' }}
              onClick={handleApply}
            >
              <Check size={16} />
              APPLY
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            CANCEL
          </button>
          <button className="btn btn-primary" onClick={handleApply}>
            APPLY TO PRICE (৳ {runningTotal.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};
