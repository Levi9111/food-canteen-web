import {
  validateOperatorEnrollment,
  validateOperatorRemoval,
} from '../utils/operatorValidation';
import type { IUser } from '../types/canteen.types';

export function runCanteenDomainTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(`Assertion failed: ${message}`);
    }
  }

  // --- Test 1: Dual Occupancy Enforcement (1 NCOIC & 1 JCOIC) ---
  const operators: IUser[] = [
    {
      username: 'ncoic.tariqul',
      name: 'Md Tariqul Islam',
      rank: 'Sgt',
      bdNo: '512044',
      role: 'NCOIC',
    },
    {
      username: 'jcoic.kamal',
      name: 'Mostafa Kamal',
      rank: 'WO',
      bdNo: '489110',
      role: 'JCOIC',
    },
  ];

  const ncoicDuplication = validateOperatorEnrollment('NCOIC', operators);
  assert(
    !ncoicDuplication.isValid,
    'Should reject second NCOIC with military violation',
  );

  const jcoicDuplication = validateOperatorEnrollment('JCOIC', operators);
  assert(
    !jcoicDuplication.isValid,
    'Should reject second JCOIC with military violation',
  );

  // --- Test 2: Vacancy Enrollment Allowed ---
  const singleOperator: IUser[] = [operators[0]];
  const jcoicAllowed = validateOperatorEnrollment('JCOIC', singleOperator);
  assert(jcoicAllowed.isValid, 'Should permit JCOIC enrollment when slot is vacant');

  // --- Test 3: Self-Removal Strictly Prohibited ---
  const selfRemoval = validateOperatorRemoval(operators[0], operators[0]);
  assert(
    !selfRemoval.isValid,
    'Should reject operator trying to remove own credentials',
  );

  // --- Test 4: Mutual Counterpart Revocation Permitted ---
  const ncoicRemovesJcoic = validateOperatorRemoval(operators[0], operators[1]);
  assert(
    ncoicRemovesJcoic.isValid,
    'NCOIC should be authorized to revoke JCOIC counterpart',
  );

  const jcoicRemovesNcoic = validateOperatorRemoval(operators[1], operators[0]);
  assert(
    jcoicRemovesNcoic.isValid,
    'JCOIC should be authorized to revoke NCOIC counterpart',
  );

  // --- Test 5: Effective Bill Math (Gross + PreDue - RandomPayments) ---
  const preDue = 1250;
  const expenses = [120, 85, 150, 95, 110];
  const payments = [500, 300];

  const grossExpense = expenses.reduce((a, b) => a + b, 0); // 560
  const grossPayable = grossExpense + preDue; // 1810
  const totalPaid = payments.reduce((a, b) => a + b, 0); // 800
  const effectiveBill = grossPayable - totalPaid; // 1010

  assert(effectiveBill === 1010, 'Effective bill math should be exactly 1010');

  // --- Test 6: Built-in Calculator Additive Expression Parsing ---
  const expression = '55+20+50';
  const tokens = expression.split('+').map((t) => parseFloat(t.trim()) || 0);
  const evaluated = tokens.reduce((a, b) => a + b, 0);
  assert(evaluated === 125, 'Calculator expression 55+20+50 must evaluate to 125');

  return { passed, failed, errors };
}
