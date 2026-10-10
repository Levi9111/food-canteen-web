import type { ISquadron } from '../types/canteen.types';

export interface ISquadronRenameResult {
  updatedSquadrons: ISquadron[];
  updatedExpenses: Record<string, number>;
  updatedPreDues: Record<string, number>;
  updatedPaid: Record<string, number>;
  affectedLedgerCount: number;
}

/**
 * Validates a squadron rename request according to BAF canteen standards.
 */
export function validateSquadronRename(
  oldName: string,
  newName: string,
  existingSquadrons: ISquadron[],
): { isValid: boolean; error?: string } {
  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  if (!cleanOld) {
    return { isValid: false, error: 'Target squadron name cannot be empty.' };
  }

  if (!cleanNew) {
    return { isValid: false, error: 'New squadron name cannot be empty.' };
  }

  if (cleanOld.toLowerCase() === cleanNew.toLowerCase()) {
    return {
      isValid: false,
      error: 'New squadron name must be different from current name.',
    };
  }

  const nameCollision = existingSquadrons.some(
    (sqn) => sqn.name.toLowerCase() === cleanNew.toLowerCase(),
  );

  if (nameCollision) {
    return {
      isValid: false,
      error: `A squadron named "${cleanNew}" already exists in the canteen structure.`,
    };
  }

  return { isValid: true };
}

/**
 * Cascades squadron rename across all ledger structures:
 * 1. Squadron list
 * 2. Recruits Daily/Monthly Expenses (keys: `${entry}|${sqn}|${room}|${date}`)
 * 3. Recruits Pre-Dues (keys: `${entry}|${sqn}|${room}`)
 * 4. Recruits Paid records (keys: `${entry}|${sqn}|${room}`)
 */
export function cascadeSquadronRename(
  oldName: string,
  newName: string,
  squadrons: ISquadron[],
  expenses: Record<string, number>,
  preDues: Record<string, number>,
  paid: Record<string, number>,
): ISquadronRenameResult {
  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  // 1. Update squadrons array
  const updatedSquadrons = squadrons.map((sqn) => {
    if (sqn.name.toLowerCase() === cleanOld.toLowerCase()) {
      return { ...sqn, name: cleanNew };
    }
    return sqn;
  });

  let affectedLedgerCount = 0;

  // 2. Cascade expenses
  const updatedExpenses: Record<string, number> = {};
  for (const [key, amount] of Object.entries(expenses)) {
    const parts = key.split('|');
    // Format: entry | squadron | room | date
    if (parts.length >= 4 && parts[1]?.toLowerCase() === cleanOld.toLowerCase()) {
      const newKey = `${parts[0]}|${cleanNew}|${parts[2]}|${parts[3]}`;
      updatedExpenses[newKey] = amount;
      affectedLedgerCount++;
    } else {
      updatedExpenses[key] = amount;
    }
  }

  // 3. Cascade Pre-dues
  const updatedPreDues: Record<string, number> = {};
  for (const [key, amount] of Object.entries(preDues)) {
    const parts = key.split('|');
    // Format: entry | squadron | room
    if (parts.length >= 3 && parts[1]?.toLowerCase() === cleanOld.toLowerCase()) {
      const newKey = `${parts[0]}|${cleanNew}|${parts[2]}`;
      updatedPreDues[newKey] = amount;
    } else {
      updatedPreDues[key] = amount;
    }
  }

  // 4. Cascade Paid
  const updatedPaid: Record<string, number> = {};
  for (const [key, amount] of Object.entries(paid)) {
    const parts = key.split('|');
    // Format: entry | squadron | room
    if (parts.length >= 3 && parts[1]?.toLowerCase() === cleanOld.toLowerCase()) {
      const newKey = `${parts[0]}|${cleanNew}|${parts[2]}`;
      updatedPaid[newKey] = amount;
    } else {
      updatedPaid[key] = amount;
    }
  }

  return {
    updatedSquadrons,
    updatedExpenses,
    updatedPreDues,
    updatedPaid,
    affectedLedgerCount,
  };
}
