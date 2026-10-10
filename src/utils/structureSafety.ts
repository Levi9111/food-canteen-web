import type { ISquadron } from '../types/canteen.types';

export function validateRoomAddition(
  roomName: string,
  existingRooms: string[],
): { isValid: boolean; error?: string } {
  const cleanRoom = roomName.trim();
  if (!cleanRoom) {
    return { isValid: false, error: 'Barrack room name/number cannot be empty.' };
  }

  if (cleanRoom.length > 30) {
    return { isValid: false, error: 'Room identifier is too long (maximum 30 characters).' };
  }

  const isDuplicate = existingRooms.some(
    (r) => r.trim().toLowerCase() === cleanRoom.toLowerCase(),
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: `Room "${cleanRoom}" already exists in this squadron.`,
    };
  }

  return { isValid: true };
}

export function validateSquadronDeletion(
  squadronName: string,
  squadrons: ISquadron[],
): { isValid: boolean; error?: string } {
  const cleanName = squadronName.trim();
  const existing = squadrons.find(
    (s) => s.name.trim().toLowerCase() === cleanName.toLowerCase(),
  );

  if (!existing) {
    return { isValid: false, error: `Squadron "${cleanName}" not found.` };
  }

  const activeCount = squadrons.filter((s) => s.isActive !== false).length;
  if (activeCount <= 1) {
    return {
      isValid: false,
      error: 'Cannot delete or deactivate the only remaining active squadron. Canteen requires at least one squadron.',
    };
  }

  return { isValid: true };
}

export function validateRoomDeletion(
  roomName: string,
  existingRooms: string[],
): { isValid: boolean; error?: string } {
  const cleanRoom = roomName.trim();
  const exists = existingRooms.some(
    (r) => r.trim().toLowerCase() === cleanRoom.toLowerCase(),
  );

  if (!exists) {
    return { isValid: false, error: `Room "${cleanRoom}" does not exist in this squadron.` };
  }

  if (existingRooms.length <= 1) {
    return {
      isValid: false,
      error: 'Cannot delete the final room. Each squadron must have at least one room allocated.',
    };
  }

  return { isValid: true };
}
