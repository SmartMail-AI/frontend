import { Suspense, use, useCallback, useState } from 'react';
import { ScrollArea } from './components/ui/scroll-area';
import CategoryListView from './features/CategoryListView';
import SelectedEmailView from './features/SelectedEmailView';
import PaginatedEmailView from './features/PaginatedEmailView';
import { useQuery } from '@tanstack/react-query';
import { fetchAuthUrl, fetchCategories } from './api';
import LoginContext from './contexts/LoginContext';
import CenteredSpinner from './components/centered-spinner';
import { Button } from './components/ui/button';
import { invalidateToken } from './utils/storage';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedEmailId, setSelectedEmailId] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1); //page index
  const { isLoggedIn } = use(LoginContext);
  const { data: categoryData, isFetching: isCategoryFetching } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    initialData: [],
  });

  const handleLoginClick = useCallback(async() => {
    const { authorization_url: url } = await fetchAuthUrl();
    window.location.href = url;
  }, []);

  const handleLogoutClick = useCallback(async() => {
    invalidateToken();
    window.location.reload();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 - 카테고리 */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">이메일 분류</h2>
          <ScrollArea className="h-[calc(100vh-120px)]">
            {
              isLoggedIn ?
                <div className='space-y-1'>
                  {
                    isCategoryFetching ? <CenteredSpinner /> : (
                      <CategoryListView
                        categories={categoryData!}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={(category) => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                      />
                    )
                  }
                </div> : null
            }
          </ScrollArea>
        </div>
      </div>

      {/* 이메일 목록 */}
      <div className={`flex flex-col ${selectedEmailId ? 'w-96 border-r' : 'flex-1'}`}>
        <div className='p-4 border-b'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium'>{selectedCategory || '전체'}</h3>
            </div>
            {
              isLoggedIn ?
                <Button onClick={handleLogoutClick}>로그아웃</Button> :
                <Button onClick={handleLoginClick}>로그인</Button>
            }
          </div>
        </div>
        {
          isLoggedIn ?
            <Suspense fallback={<CenteredSpinner />}>
              <PaginatedEmailView
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setSelectedEmailId={setSelectedEmailId}
                selectedEmailId={selectedEmailId}
                selectedCategory={selectedCategory}
              />
            </Suspense>
            :
            <div className='flex items-center justify-center flex-1'>
              <p>
                로그인하여 계속하세요.
              </p>
            </div>
        }
      </div>
      {
        (selectedEmailId && isLoggedIn) && (
          <div className='flex-1 h-screen'>
            <Suspense fallback={<CenteredSpinner />}>
              <SelectedEmailView
                setSelectedEmailId={setSelectedEmailId}
                selectedEmailId={selectedEmailId}
              />
            </Suspense>
          </div>
        )
      }
  </div>
  )
}
