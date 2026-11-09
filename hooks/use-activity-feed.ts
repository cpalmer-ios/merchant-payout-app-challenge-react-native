import { useInfiniteQuery } from '@tanstack/react-query';

import { getActivityPage } from '@/lib/api/merchant';

export function useActivityFeed() {
  return useInfiniteQuery({
    queryKey: ['merchant', 'activity'],
    queryFn: ({ pageParam }) => getActivityPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more || lastPage.next_cursor === null) {
        return undefined;
      }
      return lastPage.next_cursor;
    },
  });
}
