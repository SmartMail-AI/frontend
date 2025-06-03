import axios from 'axios';
import { getStoredValue } from '../utils/storage';
import type { DetailedEmail, GetEmailsResponse } from '../types';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL! + '/api',
  headers: {
    authorization: `Bearer ${getStoredValue('token') || ''}`,
  }
});

export async function fetchEmails({ pageParam: pageToken }: { pageParam?: string }) {
  const response = await axiosInstance.get<GetEmailsResponse>('/emails', {
    params: {
      page_token: pageToken,
      max_results: 10,
    }
  });
  return response.data;
}

export async function fetchEmail(id: string) {
  const response = await axiosInstance.get<DetailedEmail>(`/emails/${id}`);
  return response.data;
}
