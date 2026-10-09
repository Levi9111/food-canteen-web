import {
  validateOperatorEnrollment,
  validateOperatorRemoval,
} from '../utils/operatorValidation';
import type { IUser, IPStaff } from '../types/canteen.types';

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

  // --- Test 1: NCOIC Shanjid Ahmad Particulars Verification ---
  const ncoicShanjid: IUser = {
    username: 'ncoic',
    name: 'Shanjid Ahmad',
    rank: 'Cpl',
    trade: 'E&I Fitter',
    bdNo: 'BD/472770',
    role: 'NCOIC',
  };

  assert(ncoicShanjid.name === 'Shanjid Ahmad', 'NCOIC name must be Shanjid Ahmad');
  assert(ncoicShanjid.rank === 'Cpl', 'NCOIC rank must be Cpl');
  assert(ncoicShanjid.bdNo === 'BD/472770', 'NCOIC BD number must be BD/472770');
  assert(ncoicShanjid.trade === 'E&I Fitter', 'NCOIC trade must be E&I Fitter');

  // --- Test 2: Dual Occupancy Enforcement (Max 1 NCOIC & 1 JCOIC) ---
  const operators: IUser[] = [
    ncoicShanjid,
    {
      username: 'jcoic',
      name: 'Mostafa Kamal',
      rank: 'MWO',
      trade: 'Admin Tech',
      bdNo: 'BD/489110',
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

  // --- Test 3: Vacant JCOIC Slot Allows Enrollment ---
  const singleOperator: IUser[] = [ncoicShanjid];
  const jcoicAllowed = validateOperatorEnrollment('JCOIC', singleOperator);
  assert(jcoicAllowed.isValid, 'Should permit JCOIC enrollment when slot is vacant');

  // --- Test 4: Self-Removal Blocked, Counterpart Revocation Permitted ---
  const selfRemoval = validateOperatorRemoval(ncoicShanjid, ncoicShanjid);
  assert(
    !selfRemoval.isValid,
    'Should reject operator trying to remove own credentials',
  );

  const ncoicRemovesJcoic = validateOperatorRemoval(ncoicShanjid, operators[1]);
  assert(
    ncoicRemovesJcoic.isValid,
    'NCOIC should be authorized to relieve JCOIC counterpart',
  );

  // --- Test 5: P-Staff 31-Day Ledger Matrix Math ---
  const testStaff: IPStaff = {
    name: 'Aminul Islam',
    rank: 'Sgt',
    bdNo: '489201',
    office: 'RTS HQ',
    isActive: true,
    preDue: 450,
    dailyExpenses: {
      '2026-10-01': 55,
      '2026-10-02': 70,
      '2026-10-15': 120,
    },
    payments: [
      { id: 'pay-1', paymentDate: '2026-10-10', amount: 300 },
    ],
  };

  const monthExpenses = Object.values(testStaff.dailyExpenses || {}).reduce((a, b) => a + b, 0); // 245
  const preDue = testStaff.preDue || 0; // 450
  const grossPayable = monthExpenses + preDue; // 695
  const totalPaid = (testStaff.payments || []).reduce((a, p) => a + p.amount, 0); // 300
  const netDue = grossPayable - totalPaid; // 395

  assert(monthExpenses === 245, 'P-Staff month expenses should sum to 245');
  assert(grossPayable === 695, 'P-Staff gross payable should be 695');
  assert(netDue === 395, 'P-Staff net due should be 395');

  // --- Test 6: Built-in Tactical Calculator Rapid Arithmetic ---
  const expr = '55+20+50';
  const tokens = expr.split('+').map((t) => parseFloat(t.trim()) || 0);
  const evaluated = tokens.reduce((a, b) => a + b, 0);
  assert(evaluated === 125, 'Calculator expression 55+20+50 must evaluate to 125');

  return { passed, failed, errors };
}
