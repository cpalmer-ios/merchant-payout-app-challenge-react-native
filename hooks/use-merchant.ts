import { useQuery } from '@tanstack/react-query';

import { getMerchant } from '@/lib/api/merchant';

export function useMerchant() {
  return useQuery({
    queryKey: ['merchant'],
    queryFn: getMerchant,
  });
}
