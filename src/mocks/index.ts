import { http, HttpResponse } from 'msw';
import { mockCategories, mockEmails } from './mock';

const SERVER_URL = import.meta.env.VITE_SERVER_URL! + '/api';
const PAGE_SIZE = 10;

export const handlers = [
// GET /api/emails?page=1
  http.get(`${SERVER_URL}/emails`, ({ request: req }) => {
    const url = new URL(req.url);

    const pageParam = url.searchParams.get('page_token');
    const categoryParam = url.searchParams.get('category');

    const page = pageParam ? parseInt(pageParam, 10) : 1;

    // 카테고리 필터링
    const filteredEmails = categoryParam
      ? mockEmails.filter((email) => email.category === categoryParam)
      : mockEmails;

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageEmails = filteredEmails.slice(start, end);

    // `content` 필드 제거해서 Email[] 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const messages = pageEmails.map(({ content, ...email }) => email);

    const hasPrevPage = start > 0;
    const hasNextPage = end < filteredEmails.length;
    const nextPageToken = hasNextPage ? String(page + 1) : undefined;
    const prevPageToken = hasPrevPage ? String(page - 1) : undefined;

    return HttpResponse.json({
      messages,
      next_page_token: nextPageToken,
      previous_page_token: prevPageToken,
    });
  }),

  // GET /api/emails/:email_id
  http.get<{ email_id: string }>(`${SERVER_URL}/emails/:email_id`, ({ params }) => {
    const { email_id } = params;
    const email = mockEmails.find(e => e.id === email_id);

    if (!email) {
      return HttpResponse.json({
        message: '존재하지 않는 이메일입니다.'
      }, { status: 404 });
    }

    return HttpResponse.json(email)
  }),

  http.get(`${SERVER_URL}/emails/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),
];

import { setupWorker } from 'msw/browser'

export const worker = setupWorker(...handlers);
