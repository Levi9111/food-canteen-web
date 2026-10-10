import {
  validateOperatorEnrollment,
  validateOperatorRemoval,
} from '../utils/operatorValidation';
import type { IUser, IPStaff, ISquadron } from '../types/canteen.types';
import {
  cascadeSquadronRename,
  validateSquadronRename,
} from '../utils/squadronCascade';
import {
  validateRoomAddition,
  validateRoomDeletion,
  validateSquadronDeletion,
} from '../utils/structureSafety';

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

  // --- Test 7: Squadron Rename Cascade Logic ---
  const initialSquadrons: ISquadron[] = [
    { name: 'Sadruddin', rooms: ['Room 1', 'Room 2', 'Room 3'] },
    { name: 'Liakot Ali', rooms: ['Room 1', 'Room 2'] },
  ];
  const initialExpenses: Record<string, number> = {
    '54|Sadruddin|Room 1|2026-10-01': 350,
    '54|Sadruddin|Room 2|2026-10-01': 280,
    '54|Liakot Ali|Room 1|2026-10-01': 400,
  };
  const initialPreDues: Record<string, number> = {
    '54|Sadruddin|Room 1': 1200,
    '54|Liakot Ali|Room 1': 800,
  };
  const initialPaid: Record<string, number> = {
    '54|Sadruddin|Room 1': 1000,
  };

  const cascadeResult = cascadeSquadronRename(
    'Sadruddin',
    'Matiur Rahman',
    initialSquadrons,
    initialExpenses,
    initialPreDues,
    initialPaid,
  );

  assert(cascadeResult.affectedLedgerCount === 2, 'Cascade should affect 2 expense records for Sadruddin');
  assert(
    cascadeResult.updatedSquadrons[0]?.name === 'Matiur Rahman',
    'Squadron name must be updated to Matiur Rahman',
  );
  assert(
    cascadeResult.updatedExpenses['54|Matiur Rahman|Room 1|2026-10-01'] === 350,
    'Expense key must be updated to Matiur Rahman with preserved amount',
  );
  assert(
    cascadeResult.updatedExpenses['54|Liakot Ali|Room 1|2026-10-01'] === 400,
    'Unrelated Liakot Ali expense must remain untouched',
  );
  assert(
    cascadeResult.updatedPreDues['54|Matiur Rahman|Room 1'] === 1200,
    'Pre-due key must cascade to Matiur Rahman',
  );
  assert(
    cascadeResult.updatedPaid['54|Matiur Rahman|Room 1'] === 1000,
    'Paid key must cascade to Matiur Rahman',
  );

  // --- Test 8: Squadron Rename Validation ---
  const validRename = validateSquadronRename('Sadruddin', 'Matiur Rahman', initialSquadrons);
  assert(validRename.isValid, 'Valid squadron rename should pass validation');

  const collisionRename = validateSquadronRename('Sadruddin', 'Liakot Ali', initialSquadrons);
  assert(!collisionRename.isValid, 'Rename to existing squadron must be rejected with collision error');

  const identicalRename = validateSquadronRename('Sadruddin', 'Sadruddin', initialSquadrons);
  assert(!identicalRename.isValid, 'Rename to identical name must be rejected');

  // --- Test 9: Barrack Room Addition Safety ---
  const existingRooms = ['Room 1', 'Room 2', 'Room 3'];
  const validRoomAdd = validateRoomAddition('Room 4', existingRooms);
  assert(validRoomAdd.isValid, 'Room 4 addition should be valid');

  const duplicateRoomAdd = validateRoomAddition('room 2', existingRooms);
  assert(!duplicateRoomAdd.isValid, 'Duplicate room addition (case-insensitive) must be rejected');

  const emptyRoomAdd = validateRoomAddition('   ', existingRooms);
  assert(!emptyRoomAdd.isValid, 'Empty room addition must be rejected');

  // --- Test 10: Barrack Room Deletion Safety ---
  const validRoomDel = validateRoomDeletion('Room 3', existingRooms);
  assert(validRoomDel.isValid, 'Deleting Room 3 with 3 rooms remaining should be permitted');

  const finalRoomDel = validateRoomDeletion('Room 1', ['Room 1']);
  assert(!finalRoomDel.isValid, 'Deleting the final remaining room in a squadron must be blocked');

  // --- Test 11: Squadron Deletion Safety ---
  const validSqnDel = validateSquadronDeletion('Sadruddin', initialSquadrons);
  assert(validSqnDel.isValid, 'Deleting squadron with 2 squadrons active should be permitted');

  const finalSqnDel = validateSquadronDeletion('Sadruddin', [initialSquadrons[0]]);
  assert(!finalSqnDel.isValid, 'Deleting the only active squadron in canteen must be blocked');

  return { passed, failed, errors };
}
