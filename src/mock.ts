import type { Email } from './types';

const categories = [
  '업무', '긴급', '학과', '연구실'
]

const mockEmails: Email[] = [
  {
    id: "1",
    subject: "프로젝트 진행 상황 보고",
    from_: "김철수 <kim@company.com>",
    snippet: "안녕하세요. 이번 주 프로젝트 진행 상황을 보고드립니다. 현재 개발 진도는 85% 완료되었으며...",
    date: new Date(), // 실제로는 timestamp 파싱 필요
    summary: "프로젝트 개발이 85% 완료되어 테스트 중이며 베타 버전 준비 중입니다.",
    key_points: ["개발 진도 85% 완료", "일정보다 앞서 진행", "다음 주 베타 버전 예정"],
    sentiment: "positive",
    action_items: ["다음 주까지 베타 버전 완성"],
    category: "중요",
    importance: 2, // high: 2, normal: 1, low: 0
  },
  {
    id: "2",
    subject: "새로운 콘텐츠가 추가되었습니다",
    from_: "Netflix <info@netflix.com>",
    snippet: "이번 주 새롭게 추가된 영화와 드라마를 확인해보세요. 액션, 로맨스, 코미디 장르의 다양한...",
    date: new Date(), // 예: 어제 → 실제 날짜로 변환 필요
    summary: "Netflix에 새로운 콘텐츠가 추가되었습니다: 미션 임파서블 7, 사랑의 불시착 시즌 2 등.",
    key_points: ["미션 임파서블 7", "사랑의 불시착 시즌 2", "오피스 시즌 9"],
    sentiment: "neutral",
    action_items: [],
    category: "프로모션",
    importance: 1,
  },
  {
    id: "3",
    subject: "회의 일정 변경 안내",
    from_: "이영희 <lee@example.com>",
    snippet: "내일 예정된 팀 회의 일정이 변경되었습니다. 오후 2시에서 오후 4시로 변경되었으니...",
    date: new Date(),
    summary: "팀 회의가 오후 2시에서 4시로 변경되었습니다. 장소는 회의실 A입니다.",
    key_points: ["회의 시간 변경: 2시→4시", "회의실 A 유지"],
    sentiment: "neutral",
    action_items: ["참석 여부 회신 요청"],
    category: "중요",
    importance: 2,
  },
  {
    id: "4",
    subject: "주문하신 상품이 배송되었습니다",
    from_: "Amazon <orders@amazon.com>",
    snippet: "주문번호 #123456789의 상품이 배송되었습니다. 예상 도착일은 내일입니다...",
    date: new Date(),
    summary: "무선 이어폰이 배송되었으며, CJ대한통운을 통해 내일 도착 예정입니다.",
    key_points: ["주문번호: #123456789", "무선 이어폰", "도착 예정일: 3월 15일"],
    sentiment: "positive",
    action_items: ["배송 조회 링크 확인"],
    category: "쇼핑",
    importance: 1,
  },
  {
    id: "5",
    subject: "긴급! 당첨되셨습니다!!!",
    from_: "스팸발송자 <spam@suspicious.com>",
    snippet: "축하합니다! 1억원에 당첨되셨습니다. 지금 즉시 클릭하여 상금을 수령하세요...",
    date: new Date(),
    summary: "1억원 당첨 안내를 가장한 스팸 메시지입니다.",
    key_points: ["1억원 당첨", "개인정보 입력 요구"],
    sentiment: "negative",
    action_items: ["링크 클릭 주의"],
    category: "스팸",
    importance: 0,
  }
];

export { categories, mockEmails };
