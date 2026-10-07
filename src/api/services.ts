import { apiClient } from './client';
import type { IUser, ISquadron, IEntry, IPStaff, IRoomExpense } from '../types/canteen.types';

export const canteenApi = {
  // Entries (Batches)
  async getEntries(): Promise<IEntry[]> {
    const res = await apiClient.get<{ data: IEntry[] }>('/entries');
    return res.data.data;
  },

  async getActiveEntry(): Promise<IEntry> {
    const res = await apiClient.get<{ data: IEntry }>('/entries/active');
    return res.data.data;
  },

  async createEntry(entryNo: string): Promise<IEntry> {
    const res = await apiClient.post<{ data: IEntry }>('/entries', { entryNo });
    return res.data.data;
  },

  async activateEntry(id: string): Promise<IEntry> {
    const res = await apiClient.patch<{ data: IEntry }>(`/entries/${id}/activate`);
    return res.data.data;
  },

  // Squadrons & Rooms
  async getSquadrons(): Promise<ISquadron[]> {
    const res = await apiClient.get<{ data: ISquadron[] }>('/squadrons');
    return res.data.data;
  },

  async getSquadronRooms(sqnName: string): Promise<string[]> {
    const res = await apiClient.get<{ data: string[] }>(`/squadrons/${sqnName}/rooms`);
    return res.data.data;
  },

  async createSquadron(name: string, rooms: string[]): Promise<ISquadron> {
    const res = await apiClient.post<{ data: ISquadron }>('/squadrons', { name, rooms });
    return res.data.data;
  },

  async addRoom(sqnName: string, room: string): Promise<ISquadron> {
    const res = await apiClient.post<{ data: ISquadron }>(`/squadrons/${sqnName}/rooms`, { room });
    return res.data.data;
  },

  // Operators Management
  async getOperators(): Promise<IUser[]> {
    const res = await apiClient.get<{ data: IUser[] }>('/users');
    return res.data.data;
  },

  async createOperator(data: Partial<IUser> & { password?: string }): Promise<IUser> {
    const res = await apiClient.post<{ data: IUser }>('/users', data);
    return res.data.data;
  },

  async deleteOperator(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Recruits Expenses
  async recordRoomExpense(expense: Partial<IRoomExpense>): Promise<IRoomExpense> {
    const res = await apiClient.post<{ data: IRoomExpense }>('/recruits/expenses', expense);
    return res.data.data;
  },

  // P-Staff
  async getStaffList(): Promise<IPStaff[]> {
    const res = await apiClient.get<{ data: IPStaff[] }>('/staff');
    return res.data.data;
  },

  async createStaff(staff: Partial<IPStaff>): Promise<IPStaff> {
    const res = await apiClient.post<{ data: IPStaff }>('/staff', staff);
    return res.data.data;
  },

  async recordStaffExpense(staffId: string, date: string, amount: number): Promise<void> {
    await apiClient.post(`/staff/${staffId}/expenses`, { date, amount });
  },

  async recordStaffPayment(staffId: string, date: string, amount: number, receiptNo?: string): Promise<void> {
    await apiClient.post(`/staff/${staffId}/payments`, { paymentDate: date, amount, receiptNo });
  },
};
