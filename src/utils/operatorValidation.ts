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
  const myId = currentUser?._id || currentUser?.userId || currentUser?.id || '';

  // Prevent accidental self-removal if logged in as the same exact user
  if (currentUser && ((targetId && targetId === myId) || (targetUser.bdNo && targetUser.bdNo === currentUser.bdNo))) {
    return {
      isValid: false,
      error: 'Self-removal not permitted. Another in-charge officer or admin must relieve your position.',
    };
  }

  return { isValid: true };
}
