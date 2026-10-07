import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canteenApi } from '../api/services';
import type { IUser, IPStaff } from '../types/canteen.types';

export const CANTEEN_QUERY_KEYS = {
  entries: ['entries'] as const,
  activeEntry: ['entries', 'active'] as const,
  squadrons: ['squadrons'] as const,
  operators: ['operators'] as const,
  staffList: ['staff'] as const,
};

export function useEntriesQuery() {
  return useQuery({
    queryKey: CANTEEN_QUERY_KEYS.entries,
    queryFn: () => canteenApi.getEntries(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useActiveEntryQuery() {
  return useQuery({
    queryKey: CANTEEN_QUERY_KEYS.activeEntry,
    queryFn: () => canteenApi.getActiveEntry(),
  });
}

export function useSquadronsQuery() {
  return useQuery({
    queryKey: CANTEEN_QUERY_KEYS.squadrons,
    queryFn: () => canteenApi.getSquadrons(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOperatorsQuery() {
  return useQuery({
    queryKey: CANTEEN_QUERY_KEYS.operators,
    queryFn: () => canteenApi.getOperators(),
  });
}

export function useStaffListQuery() {
  return useQuery({
    queryKey: CANTEEN_QUERY_KEYS.staffList,
    queryFn: () => canteenApi.getStaffList(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newStaff: Partial<IPStaff>) => canteenApi.createStaff(newStaff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANTEEN_QUERY_KEYS.staffList });
    },
  });
}

export function useRecordExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, date, amount }: { staffId: string; date: string; amount: number }) =>
      canteenApi.recordStaffExpense(staffId, date, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANTEEN_QUERY_KEYS.staffList });
    },
  });
}

export function useRecordPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      date,
      amount,
      receiptNo,
    }: {
      staffId: string;
      date: string;
      amount: number;
      receiptNo?: string;
    }) => canteenApi.recordStaffPayment(staffId, date, amount, receiptNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANTEEN_QUERY_KEYS.staffList });
    },
  });
}

export function useCreateOperatorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<IUser> & { password?: string }) =>
      canteenApi.createOperator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANTEEN_QUERY_KEYS.operators });
    },
  });
}

export function useDeleteOperatorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => canteenApi.deleteOperator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANTEEN_QUERY_KEYS.operators });
    },
  });
}
