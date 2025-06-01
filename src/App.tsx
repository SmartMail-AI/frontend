import { useState } from 'react';
import { ScrollArea } from './components/ui/scroll-area';
import { categories as mockCategories, mockEmails } from './mock';
import EmailListView from './features/EmailListView';
import CategoryListView from './features/CategoryListView';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("AI분류");
  const [selectedEmailId, setSelectedEmailId] = useState<string>();
  const [categories,] = useState<string[]>(mockCategories);
  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 - 카테고리 */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">이메일 분류</h2>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1">
              <CategoryListView
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* AI 카테고리 또는 이메일 목록 */}
      <div className={selectedEmailId ? "w-96 border-r" : "flex-1"}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{selectedCategory}</h3>
            </div>
            <span className="text-sm text-muted-foreground">10개의 이메일</span>
          </div>
        </div>

        <EmailListView
          emails={mockEmails}
          onEmailSelect={(email) => {
            setSelectedEmailId(email.id)
          }}
          selectedCategory={selectedCategory}
          selectedEmailId={selectedEmailId}
        />
      </div>

      {/*Selected Email View*/}

    </div>
  )
}
