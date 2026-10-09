export type TBafRank =
  | 'Air Cdre'
  | 'Gp Capt'
  | 'Wg Cdr'
  | 'Sqn Ldr'
  | 'Flt Lt'
  | 'Fg Offr'
  | 'MWO'
  | 'SWO'
  | 'WO'
  | 'Sgt'
  | 'Cpl'
  | 'LAC'
  | 'AC'
  | 'Civilian';

export type TManagerRole = 'ADMIN' | 'NCOIC' | 'JCOIC' | 'WOIC';

export interface IUser {
  _id?: string;
  userId?: string;
  id?: string;
  username: string;
  name: string;
  rank: TBafRank | string;
  trade?: string;
  bdNo: string;
  email?: string;
  role: TManagerRole | string;
  phone?: string;
  isActive?: boolean;
}

export interface ISquadron {
  _id?: string;
  name: string;
  rooms: string[];
  isActive?: boolean;
}

export interface IEntry {
  _id?: string;
  entryNo: string;
  status: 'ACTIVE' | 'PASSED_OUT';
  startDate?: string;
  endDate?: string;
}

export interface IRoomExpense {
  _id?: string;
  entryNo: string;
  squadron: string;
  roomNo: string;
  date: string; // YYYY-MM-DD
  amount: number;
  recordedBy?: string;
}

export interface IStaffPayment {
  id?: string;
  _id?: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  receiptNo?: string;
  recordedBy?: string;
}

export interface IPStaff {
  _id?: string;
  name: string;
  rank: string;
  bdNo: string;
  office: string;
  phone?: string;
  isActive: boolean;
  preDue?: number;
  dailyExpenses?: Record<string, number>; // date -> amount
  payments?: IStaffPayment[];
}
