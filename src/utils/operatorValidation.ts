import type { IUser } from '../types/canteen.types';

export interface IValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateOperatorEnrollment(
  newRole: 'NCOIC' | 'JCOIC',
  operators: IUser[],
): IValidationResult {
  const existingWithRole = operators.find((op) => op.role === newRole);
  if (existingWithRole) {
    return {
      isValid: false,
      error: `Military Rule Violation: An ${newRole} already exists (${existingWithRole.name}). Maximum 1 ${newRole} is permitted.`,
    };
  }
  return { isValid: true };
}

export function validateOperatorRemoval(
  currentUser: IUser,
  targetUser: IUser,
): IValidationResult {
  const targetId = targetUser._id || targetUser.userId || targetUser.id || '';
  const myId = currentUser._id || currentUser.userId || currentUser.id || '';

  // Rule 1: Self-removal is strictly blocked
  if (targetUser.bdNo === currentUser.bdNo || (targetId && targetId === myId)) {
    return {
      isValid: false,
      error: 'Self-removal strictly prohibited. You cannot revoke your own military credentials.',
    };
  }

  // Rule 2: Mutual counterpart removal only
  if (currentUser.role === 'NCOIC' && targetUser.role !== 'JCOIC') {
    return {
      isValid: false,
      error: 'As NCOIC, you may only revoke your JCOIC counterpart.',
    };
  }

  if (currentUser.role === 'JCOIC' && targetUser.role !== 'NCOIC') {
    return {
      isValid: false,
      error: 'As JCOIC, you may only revoke your NCOIC counterpart.',
    };
  }

  return { isValid: true };
}
