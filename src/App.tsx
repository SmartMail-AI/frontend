import { type ChangeEvent, useState } from 'react';
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { ScrollArea } from "./components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu"
import {
  Star,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Forward,
  Clock,
  Paperclip,
  X,
  ChevronRight,
} from "lucide-react"
import { aiCategories, categories, type Email, mockEmails } from './mock';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("AI분류")
  const [selectedAiCategory, setSelectedAiCategory] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEmailDetail, setShowEmailDetail] = useState(false)
  const [isAiCategoryExpanded, setIsAiCategoryExpanded] = useState(false)

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    setShowEmailDetail(true)
  }

  const handleCloseEmail = () => {
    setSelectedEmail(null)
    setShowEmailDetail(false)
  }

  const filteredEmails = mockEmails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedCategory === "AI분류") {
      if (selectedAiCategory) {
        return email.aiCategory === selectedAiCategory && matchesSearch
      }
      return email.aiCategory && matchesSearch
    }

    return email.category === selectedCategory && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "low":
        return "text-gray-400"
      default:
        return "text-blue-500"
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.name === category)
    return cat?.color || "gray"
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 - 카테고리 */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">이메일 분류</h2>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon
                if (category.name === "AI분류") {
                  return (
                    <div key={category.name}>
                      <Button
                        variant={selectedCategory === category.name ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-10"
                        onClick={() => {
                          setIsAiCategoryExpanded(!isAiCategoryExpanded)
                          if (!isAiCategoryExpanded) {
                            setSelectedCategory(category.name)
                            setSelectedAiCategory(null)
                            setShowEmailDetail(false)
                            setSelectedEmail(null)
                          }
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${isAiCategoryExpanded ? "rotate-90" : ""}`}
                        />
                      </Button>
                      {isAiCategoryExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {aiCategories.map((aiCat) => {
                            return (
                              <Button
                                key={aiCat.name}
                                variant={selectedAiCategory === aiCat.name ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 h-9 text-sm"
                                onClick={() => {
                                  setSelectedCategory("AI분류")
                                  setSelectedAiCategory(aiCat.name)
                                  setShowEmailDetail(false)
                                  setSelectedEmail(null)
                                }}
                              >
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    aiCat.color === "yellow"
                                      ? "bg-yellow-400"
                                      : aiCat.color === "purple"
                                        ? "bg-purple-400"
                                        : aiCat.color === "orange"
                                          ? "bg-orange-400"
                                          : aiCat.color === "red"
                                            ? "bg-red-400"
                                            : "bg-gray-400"
                                  }`}
                                />
                                <span className="flex-1 text-left">{aiCat.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {aiCat.count}
                                </Badge>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Button
                    key={category.name}
                    variant={
                      selectedCategory === category.name && selectedCategory !== "AI분류" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-3 h-10"
                    onClick={() => {
                      setSelectedCategory(category.name)
                      setSelectedAiCategory(null)
                      setShowEmailDetail(false)
                      setSelectedEmail(null)
                      setIsAiCategoryExpanded(false)
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* AI 카테고리 또는 이메일 목록 */}
      <div className={showEmailDetail ? "w-96 border-r" : "flex-1"}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이메일 검색..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{selectedAiCategory || selectedCategory}</h3>
            </div>
            <span className="text-sm text-muted-foreground">{filteredEmails.length}개의 이메일</span>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="divide-y">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedEmail?.id === email.id ? "bg-muted" : ""
                } ${!email.isRead ? "border-l-2 border-l-blue-500" : ""}`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>{email.sender[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium truncate ${!email.isRead ? "font-bold" : ""}`}>
                        {email.sender}
                      </span>
                      <div className="flex items-center gap-1">
                        {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                        {email.isStarred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                        <span className="text-xs text-muted-foreground">{email.timestamp}</span>
                      </div>
                    </div>
                    <div className={`text-sm mb-1 truncate ${!email.isRead ? "font-semibold" : ""}`}>
                      {email.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{email.preview}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(email.priority)}`}>
                        {email.priority === "high" ? "높음" : email.priority === "low" ? "낮음" : "보통"}
                      </Badge>
                      {selectedAiCategory && email.aiCategory && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          AI: {email.aiCategory}
                        </Badge>
                      )}
                      <Clock className={`h-3 w-3 ${getPriorityColor(email.priority)}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 이메일 상세 내용 */}
      {showEmailDetail && selectedEmail && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-${getCategoryColor(selectedEmail.category)}-600`}>
                  {selectedEmail.category}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedEmail.priority)}>
                  {selectedEmail.priority === "high"
                    ? "높은 우선순위"
                    : selectedEmail.priority === "low"
                      ? "낮은 우선순위"
                      : "보통 우선순위"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-2" />
                  답장
                </Button>
                <Button variant="outline" size="sm">
                  <Forward className="h-4 w-4 mr-2" />
                  전달
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>보관</DropdownMenuItem>
                    <DropdownMenuItem>스팸 신고</DropdownMenuItem>
                    <DropdownMenuItem>삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleCloseEmail}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h1 className="text-xl font-semibold mb-3">{selectedEmail.subject}</h1>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                <AvatarFallback>{selectedEmail.sender[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{selectedEmail.sender}</div>
                <div className="text-sm text-muted-foreground">{selectedEmail.senderEmail}</div>
              </div>
              <div className="text-sm text-muted-foreground">{selectedEmail.timestamp}</div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedEmail.content}</div>
            </div>

            {selectedEmail.hasAttachment && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-4 w-4" />
                  <span className="font-medium">첨부파일</span>
                </div>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    project-report.pdf (2.3MB)
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
