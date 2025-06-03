import EmailListView from './EmailListView';
import {
  Pagination,
  PaginationContent,
  PaginationItem, PaginationNext, PaginationPrevious,
} from '../components/ui/pagination';
import { useState } from 'react';
import useFetchEmails from '../hooks/useFetchEmail';

interface PaginatedEmailViewProps {
  selectedEmailId?: string;
  setSelectedEmailId: (selectedEmailId?: string) => void;
  selectedCategory?: string;
}

export default function PaginatedEmailView({ selectedEmailId, setSelectedEmailId, selectedCategory }: PaginatedEmailViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    emailPageData,
    isFetchingNextEmailPage,
    isFetchingPreviousEmailPage,
    hasNextEmailPage,
    hasPreviousEmailPage,
    fetchPreviousEmailPage,
    fetchNextEmailPage,
  } = useFetchEmails();
  return (
    <>
    <EmailListView
      emails={emailPageData.pages[currentPage - 1].messages}
      onEmailSelect={(email) => {
        setSelectedEmailId(email.id)
      }}
      selectedCategory={selectedCategory}
      selectedEmailId={selectedEmailId}
    />
    <div className="flex items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={async() => {
                if (hasPreviousEmailPage && !isFetchingPreviousEmailPage) {
                  await fetchPreviousEmailPage();
                  setCurrentPage((prev) => prev - 1);
                }
              }}
              className={!hasPreviousEmailPage || isFetchingPreviousEmailPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={async() => {
                if (hasNextEmailPage && !isFetchingNextEmailPage) {
                  await fetchNextEmailPage();
                  setCurrentPage((prev) => prev + 1);
                }
              }}
              className={!hasNextEmailPage || isFetchingNextEmailPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
    </>
  )
}
