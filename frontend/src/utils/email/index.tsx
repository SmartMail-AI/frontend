import type { DetailedEmail, Email } from '@/types';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';

export function getEmailPriority(email: Email | DetailedEmail): 'low' | 'moderate' | 'high' {
  if (email.importance >= 0 && email.importance <= 3) {
    return 'low';
  } else if (email.importance >= 4 && email.importance <= 7) {
    return 'moderate';
  } else {
    return 'high';
  }
}

export function getSentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case "positive":
      return "bg-green-100 text-green-800"
    case "negative":
      return "bg-red-100 text-red-800"
    case "neutral":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getImportanceIcon(importance: number) {
  if (importance >= 8) return <AlertCircle className="h-4 w-4 text-red-500" />
  if (importance >= 6) return <Star className="h-4 w-4 text-yellow-500" />
  return <CheckCircle2 className="h-4 w-4 text-green-500" />
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getInitials(name: string) {
  return name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()
}
