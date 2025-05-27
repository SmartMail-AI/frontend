import {
  AlertCircle,
  Filter,
  Inbox,
  Send, ShoppingBag,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';

export interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  content: string
  timestamp: string
  category: string
  aiCategory?: string // AI가 분류한 카테고리
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  priority: "high" | "normal" | "low"
}

const categories = [
  { name: "AI분류", icon: Filter, count: 15, color: "purple" },
  { name: "받은편지함", icon: Inbox, count: 10, color: "blue" },
  { name: "중요", icon: Star, count: 4, color: "yellow" },
  { name: "보낸편지함", icon: Send, count: 8, color: "green" },
  { name: "스팸", icon: AlertCircle, count: 25, color: "red" },
  { name: "휴지통", icon: Trash2, count: 23, color: "red" },
]

const aiCategories = [
  { name: "중요", icon: Star, count: 2, color: "yellow" },
  { name: "프로모션", icon: Tag, count: 1, color: "purple" },
  { name: "쇼핑", icon: ShoppingBag, count: 1, color: "orange" },
  { name: "스팸", icon: AlertCircle, count: 1, color: "red" },
]

const mockEmails: Email[] = [
  {
    id: "1",
    sender: "김철수",
    senderEmail: "kim@company.com",
    subject: "프로젝트 진행 상황 보고",
    preview: "안녕하세요. 이번 주 프로젝트 진행 상황을 보고드립니다. 현재 개발 진도는 85% 완료되었으며...",
    content:
      "안녕하세요. 이번 주 프로젝트 진행 상황을 보고드립니다.\n\n현재 개발 진도는 85% 완료되었으며, 예정된 일정보다 약간 앞서 진행되고 있습니다. 주요 기능들이 모두 구현되었고, 현재 테스트 단계에 있습니다.\n\n다음 주까지 베타 버전을 완성할 예정입니다.\n\n감사합니다.",
    timestamp: "오전 10:30",
    category: "받은편지함",
    aiCategory: "중요",
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    priority: "high",
  },
  {
    id: "2",
    sender: "Netflix",
    senderEmail: "info@netflix.com",
    subject: "새로운 콘텐츠가 추가되었습니다",
    preview: "이번 주 새롭게 추가된 영화와 드라마를 확인해보세요. 액션, 로맨스, 코미디 장르의 다양한...",
    content:
      "안녕하세요!\n\n이번 주 Netflix에 새롭게 추가된 콘텐츠를 소개합니다.\n\n• 액션 영화: 미션 임파서블 7\n• 로맨스 드라마: 사랑의 불시착 시즌 2\n• 코미디: 오피스 시즌 9\n\n지금 바로 시청해보세요!",
    timestamp: "어제",
    category: "받은편지함",
    aiCategory: "프로모션",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    priority: "normal",
  },
  {
    id: "3",
    sender: "이영희",
    senderEmail: "lee@example.com",
    subject: "회의 일정 변경 안내",
    preview: "내일 예정된 팀 회의 일정이 변경되었습니다. 오후 2시에서 오후 4시로 변경되었으니...",
    content:
      "안녕하세요.\n\n내일(3월 15일) 예정된 팀 회의 일정이 변경되었습니다.\n\n변경 전: 오후 2시 - 3시\n변경 후: 오후 4시 - 5시\n\n장소는 동일하게 회의실 A입니다.\n\n참석 가능 여부를 회신해주세요.\n\n감사합니다.",
    timestamp: "2시간 전",
    category: "받은편지함",
    aiCategory: "중요",
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    priority: "high",
  },
  {
    id: "4",
    sender: "Amazon",
    senderEmail: "orders@amazon.com",
    subject: "주문하신 상품이 배송되었습니다",
    preview: "주문번호 #123456789의 상품이 배송되었습니다. 예상 도착일은 내일입니다...",
    content:
      "주문해주셔서 감사합니다!\n\n주문번호: #123456789\n상품명: 무선 이어폰\n배송업체: CJ대한통운\n송장번호: 123456789012\n\n예상 도착일: 2024년 3월 15일\n\n배송 조회는 아래 링크에서 확인하실 수 있습니다.",
    timestamp: "3시간 전",
    category: "받은편지함",
    aiCategory: "쇼핑",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    priority: "normal",
  },
  {
    id: "5",
    sender: "스팸발송자",
    senderEmail: "spam@suspicious.com",
    subject: "긴급! 당첨되셨습니다!!!",
    preview: "축하합니다! 1억원에 당첨되셨습니다. 지금 즉시 클릭하여 상금을 수령하세요...",
    content:
      "축하합니다!!!\n\n당신이 1억원 복권에 당첨되었습니다!\n\n지금 즉시 아래 링크를 클릭하여 개인정보를 입력하고 상금을 수령하세요.\n\n이 기회를 놓치지 마세요!",
    timestamp: "1일 전",
    category: "받은편지함",
    aiCategory: "스팸",
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    priority: "low",
  },
]

export { categories, aiCategories, mockEmails };
