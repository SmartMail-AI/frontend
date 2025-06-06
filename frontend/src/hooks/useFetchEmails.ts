import {
  type InfiniteData,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { fetchEmails } from '@/api';
import type { AxiosError } from 'axios';

interface UseFetchEmailsProps {
  selectedCategory?: string;
}

export default function useFetchEmails({ selectedCategory }: UseFetchEmailsProps) { // 추후 category 추가
  const {
    fetchNextPage: fetchNextEmailPage,
    isFetchingNextPage: isFetchingNextEmailPage,
    fetchPreviousPage: fetchPreviousEmailPage,
    isFetchingPreviousPage: isFetchingPreviousEmailPage,
    data: emailPageData,
    hasNextPage: hasNextEmailPage,
    hasPreviousPage: hasPreviousEmailPage,
  } = useSuspenseInfiniteQuery<
    Awaited<ReturnType<typeof fetchEmails>>,
    AxiosError,
    InfiniteData<Awaited<ReturnType<typeof fetchEmails>>>,
    [string, string?],
    string | undefined
  >({
    queryKey: ['emails', selectedCategory],
    queryFn: ({ pageParam }) => fetchEmails({ pageParam, selectedCategory }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_page_token,
    getPreviousPageParam: (firstPage) => firstPage.previous_page_token,
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
