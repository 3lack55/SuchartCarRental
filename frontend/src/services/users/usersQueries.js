import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUserRole, updateUserStatus, resetUserPassword } from './usersApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

export const userKeys = {
  all: ['users'],
  list: (token) => ['users', token],
};

export function useUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: userKeys.list(user?.token),
    queryFn: () => getUsers(user.token),
    enabled: Boolean(user?.token),
  });
}

export function useCreateUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createUser(user?.token, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserRole() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }) => updateUserRole(user?.token, id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }) => updateUserStatus(user?.token, id, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useResetUserPassword() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, newPassword }) => resetUserPassword(user?.token, id, newPassword),
  });
}
