import EmailListView from './EmailListView';
import {
  Pagination,
  PaginationContent,
  PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import useFetchEmails from '../hooks/useFetchEmails';
import EmailFallback from '@/components/email-fallback';

interface PaginatedEmailViewProps {
  selectedEmailId?: string;
  setSelectedEmailId: (selectedEmailId?: string) => void;
  selectedCategory?: string;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
}

export default function PaginatedEmailView({ selectedEmailId, setSelectedEmailId, selectedCategory, currentPage, setCurrentPage}
                                             : PaginatedEmailViewProps) {
  const {
    emailPageData,
    isFetchingNextEmailPage,
    // isFetchingPreviousEmailPage,
    hasNextEmailPage,
    // hasPreviousEmailPage,
    // fetchPreviousEmailPage,
    fetchNextEmailPage,
  } = useFetchEmails({ selectedCategory });

  const hasStoredPreviousPage = currentPage > 1;
  const hasStoredNextPage = currentPage < emailPageData.pages.length;
  return (
    <>
      {
        isFetchingNextEmailPage ?
          <EmailFallback /> :
          <EmailListView
            emails={emailPageData.pages[currentPage - 1].messages}
            onEmailSelect={(email) => {
              setSelectedEmailId(email.id)
            }}
            selectedCategory={selectedCategory}
            selectedEmailId={selectedEmailId}
          />
      }
    <div className="flex items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={async() => {
                if (hasStoredPreviousPage) {
                  // await fetchPreviousEmailPage();
                  setCurrentPage(currentPage - 1);
                }
              }}
              className={hasStoredPreviousPage && !isFetchingNextEmailPage ? "cursor-pointer" : "pointer-events-none opacity-50"}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={async() => {
                if(hasStoredNextPage) {
                  setCurrentPage(currentPage + 1);
                  return;
                }
                if (hasNextEmailPage && !isFetchingNextEmailPage) {
                  await fetchNextEmailPage();
                  setCurrentPage(currentPage + 1);
                }
              }}
              className={
                hasStoredNextPage || (hasNextEmailPage && !isFetchingNextEmailPage)
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-50"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
    </>
  )
}
