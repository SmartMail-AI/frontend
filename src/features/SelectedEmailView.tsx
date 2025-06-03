import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Forward, MoreVertical,  Reply, X } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { getPriorityColor } from '../utils/theme';

import { getEmailPriority } from '../utils/email';
import { fetchEmail } from '../api';
import { useSuspenseQuery } from '@tanstack/react-query';

interface SelectedEmailViewProps {
  selectedEmailId: string;
  setSelectedEmailId: (emailId?: string) => void;
}

export default function SelectedEmailView({ selectedEmailId, setSelectedEmailId }: SelectedEmailViewProps) {
  const { data: selectedEmail } = useSuspenseQuery({
    queryKey: ['email', selectedEmailId],
    queryFn: () => fetchEmail(selectedEmailId),
  });
  const priority = getEmailPriority(selectedEmail);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-indigo-400`}>
              {selectedEmail!.category}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(priority)}>
              {priority === "high"
                ? "높은 우선순위"
                : priority === "low"
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
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedEmailId(undefined);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-3">{selectedEmail.subject}</h1>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
            <AvatarFallback>{selectedEmail.from_[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{selectedEmail.from_}</div>
            <div className="text-sm text-muted-foreground">{selectedEmail.summary}</div>
          </div>
          <div className="text-sm text-muted-foreground">{selectedEmail.date.toLocaleString()}</div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedEmail.content}</div>
        </div>
      </ScrollArea>
    </div>
  )
}
