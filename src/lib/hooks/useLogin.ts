import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toaster } from '@/lib/components/ui/toaster';
import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';
import { getErrorMessage } from '@/lib/types/api';

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),

    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me(), user);
      navigate({ to: '/feed' });
    },

    onError: (error) => {
      toaster.create({
        type: 'error',
        title: 'Login failed',
        description: getErrorMessage(error),
        duration: 5000,
      });
    },
  });
}
