import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { getPriorityColor } from '../utils/theme';
import type { Email } from '../types';
import { getEmailPriority } from '../utils/email';

interface EmailListViewProps {
  emails: Email[];
  selectedEmailId?: string;
  onEmailSelect: (email: Email) => void;
  selectedCategory?: string;
}

export default function EmailListView({
  emails,
  selectedEmailId,
  onEmailSelect,
  selectedCategory,
}: EmailListViewProps) {
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="divide-y">
        {emails.map((email) => (
          <div key={email.id}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedEmailId === email.id ? 'bg-muted' : ''
            }`}
            onClick={() => onEmailSelect(email)}>
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`/placeholder.svg?height=32&width=32`}/>
                <AvatarFallback>{email.from_[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium truncate`}>
                    {email.from_}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs text-muted-foreground">{email.date.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`text-sm mb-1 truncate`}>
                  {email.subject}
                </div>
                <div
                  className="text-xs text-muted-foreground truncate">{email.summary}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline"
                    className={`text-xs ${getPriorityColor(getEmailPriority(email))}`}>
                    {getEmailPriority(email) === 'high' ?
                      '높음' :
                      getEmailPriority(email) === 'low' ? '낮음' : '보통'}
                  </Badge>
                  <Badge variant="secondary"
                    className={`text-xs bg-purple-100 ${email.category === selectedCategory ? 'text-purple-700' : 'text-purple-400'}`}> AI: {email.category}
                  </Badge>
                  <Clock
                  className={`h-3 w-3 ${getPriorityColor(email.category)}`}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
