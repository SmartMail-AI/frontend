import {
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { fetchEmails } from '../api';

export default function useFetchEmails() { // 추후 category 추가
  const {
    fetchNextPage: fetchNextEmailPage,
    isFetchingNextPage: isFetchingNextEmailPage,
    fetchPreviousPage: fetchPreviousEmailPage,
    isFetchingPreviousPage: isFetchingPreviousEmailPage,
    data: emailPageData,
    hasNextPage: hasNextEmailPage,
    hasPreviousPage: hasPreviousEmailPage,
  } = useSuspenseInfiniteQuery({
    queryKey: ['emails'],
    queryFn: fetchEmails,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_page_token,
  });

  return {
    fetchNextEmailPage,
    isFetchingNextEmailPage,
    fetchPreviousEmailPage,
    isFetchingPreviousEmailPage,
    emailPageData,
    hasNextEmailPage,
    hasPreviousEmailPage,
  }
}
