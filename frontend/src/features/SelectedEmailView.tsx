import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Mail, User, CheckCircle2, X, Reply, Forward, Archive, Trash2 } from "lucide-react"
import { fetchEmail } from '@/api'
import { useSuspenseQuery } from "@tanstack/react-query"
import type { DetailedEmail } from '@/types'
import { formatDate, getImportanceIcon, getInitials, getSentimentColor } from '@/utils/email'

// 1. HTML 본문을 렌더링하기 위한 함수 추가
function renderHtmlBody(html: string) {
  return { __html: html }
}

export default function EmailViewer({
                                      selectedEmailId,
                                      setSelectedEmailId,
                                    }: {
  selectedEmailId: string
  setSelectedEmailId: (email: string | undefined) => void
}) {
  const { data: selectedEmail } = useSuspenseQuery<DetailedEmail>({
    queryKey: ["email", selectedEmailId],
    queryFn: () => fetchEmail(selectedEmailId),
  })
  const keyPoints = Array.isArray(selectedEmail.key_points)
    ? selectedEmail.key_points
    : [...JSON.parse(selectedEmail.key_points)]
  const actionItems = Array.isArray(selectedEmail.action_items)
    ? selectedEmail.action_items
    : [...JSON.parse(selectedEmail.action_items)]

  return (
    <ScrollArea className="h-screen">
      <ScrollArea className="flex-1 flex flex-col">
        <div className="p-6 space-y-2">
          {/* 유틸리티 버튼 섹션 */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Reply className="h-4 w-4 mr-2" />
                답장
              </Button>
              <Button variant="outline" size="sm">
                <Forward className="h-4 w-4 mr-2" />
                전달
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                보관
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
            <Button variant="ghost" size="sm"
              onClick={() => setSelectedEmailId(undefined)}
              className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardHeader className="py-3 px-4 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>{getInitials(
                      selectedEmail.headers.From)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle
                      className="text-xl">{selectedEmail.headers.Subject}</CardTitle>
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <User className="h-4 w-4" />
                      <span>{selectedEmail.headers.From}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getImportanceIcon(selectedEmail.importance)}
                  <Badge variant="outline">{selectedEmail.importance}/100</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">받는 사람:</span>
                  <span>{selectedEmail.headers.To}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">받은 시간:</span>
                  <span>{formatDate(selectedEmail.received_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={renderHtmlBody(selectedEmail.body)} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* 요약 및 감정 분석 */}
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4 pb-0">
                <CardTitle className="text-base">요약 및 감정 분석</CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4 space-y-3 pt-1">
                <p
                  className="text-sm text-muted-foreground">{selectedEmail.summary}</p>
                {selectedEmail.sentiment && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">감정:</span>
                    <Badge
                      className={getSentimentColor(selectedEmail.sentiment)}>
                      {selectedEmail.sentiment === "positive"
                        ? "긍정적"
                        : selectedEmail.sentiment === "negative"
                          ? "부정적"
                          : "중립적"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 라벨 */}
            {selectedEmail.labelIds.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-4 pb-0">
                  <CardTitle className="text-base">라벨 및 카테고리</CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 pt-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedEmail.category}</Badge>
                    {selectedEmail.labelIds.map((label, index) => (
                      <Badge key={`label-${index}`} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {keyPoints.length > 0 && keyPoints[0] && (
              <Card className="shadow-sm">
                <CardHeader className="py-2 px-4 pb-0">
                  <CardTitle className="text-base">핵심 포인트</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pt-1">
                  <ul className="space-y-1">
                    {keyPoints.map((point, index) => (
                      <li key={`key-point-${index}`}
                        className="flex items-start gap-2 text-sm">
                        <div
                          className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span
                          className="break-words overflow-hidden">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 액션 아이템 */}
            {actionItems.length > 0 && actionItems[0] && (
              <Card className="shadow-sm">
                <CardHeader className="py-2 px-4 pb-0">
                  <CardTitle className="text-base">액션 아이템</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 pt-1">
                  <ul className="space-y-1">
                    {actionItems.map((item, index) => (
                      <li key={`action-item-${index}`}
                        className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span
                          className="break-words overflow-hidden">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 메타데이터 - 접을 수 있는 디스클로저로 변경 */}
          <div className="mt-4">
            <details className="text-sm">
              <summary
                className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">
                메타데이터 보기
              </summary>
              <div className="mt-3 p-4 bg-muted/50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium">이메일 ID:</span>
                    <span className="ml-2 font-mono">{selectedEmail.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">스레드 ID:</span>
                    <span
                      className="ml-2 font-mono">{selectedEmail.threadId}</span>
                  </div>
                  <div>
                    <span className="font-medium">Message ID:</span>
                    <span
                      className="ml-2 font-mono">{selectedEmail.headers["Message-Id"]}</span>
                  </div>
                  <div>
                    <span className="font-medium">우선순위:</span>
                    <span
                      className="ml-2">{selectedEmail.headers["X-Priority"]}</span>
                  </div>
                  <div>
                    <span className="font-medium">처리 시간:</span>
                    <span className="ml-2">{formatDate(
                      selectedEmail.processed_at)}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </ScrollArea>
    </ScrollArea>
  )
}
