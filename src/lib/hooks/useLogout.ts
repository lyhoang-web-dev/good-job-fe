import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { authService } from '@/lib/services/auth';
import { setSessionAccessToken } from '@/lib/services/sessionAccessToken';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      setSessionAccessToken(null);
      queryClient.clear();
      navigate({ search: { error: undefined }, to: '/login' });
    },
  });
}
