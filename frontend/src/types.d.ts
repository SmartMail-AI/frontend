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

export interface DetailedEmail {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  headers: EmailHeaders
  body: string
  summary: string
  key_points: string | string[]
  sentiment: string | null
  action_items: string | string[]
  category: string
  importance: number
  received_at: string
  processed_at: string
}

export interface EmailHeaders {
  'Delivered-To': string
  'Received': string
  'X-Google-Smtp-Source': string
  'X-Received': string
  'ARC-Seal': string
  'ARC-Message-Signature': string
  'ARC-Authentication-Results': string
  'Return-Path': string
  'Received-SPF': string
  'Authentication-Results': string
  'MIME-Version': string
  'From': string
  'To': string
  'Subject': string
  'X-Mailer': string
  'X-Priority': string
  'Message-Id': string
  'Date': string
  'X-MSP-FID': string
  'Content-Type': string
}


export interface GetEmailsResponse {
  messages: Email[];
  next_page_token: string | null;
  previous_page_token: string | null;
}

export interface GetAuthUrlResponse {
  authorization_url: string;
}
