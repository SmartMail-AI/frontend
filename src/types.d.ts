export interface Email {
  id: string;
  subject: string;
  from_: string;
  snippet: string;
  date: Date;
  summary: string;
  key_points: string[];
  sentiment: string;
  action_items: string[];
  category: string;
  importance: number;
}

export interface DetailedEmail extends Email {
  content: string;
}

export interface GetEmailsResponse {
  messages: Email[];
  next_page_token: string;
}
