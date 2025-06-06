import axios from 'axios';
import { getStoredValue, invalidateToken } from '../utils/storage';
import type {
  DetailedEmail,
  GetAuthUrlResponse,
  GetEmailsResponse,
} from '../types';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL! + '/api',
  headers: {
    authorization: `Bearer ${getStoredValue('token') || ''}`,
  }
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      invalidateToken()
      window.location.reload();
    }

    return Promise.reject(error)
  }
)



export async function fetchAuthUrl() {
  const response = await axiosInstance.get<GetAuthUrlResponse>('/auth/google');
  return response.data;
}

export async function fetchEmails({ pageParam: pageToken, selectedCategory }
                                    : { pageParam?: string, selectedCategory?: string }) {
  const response = await axiosInstance.get<GetEmailsResponse>('/emails', {
    params: {
      page_token: pageToken,
      max_results: 10,
      category: selectedCategory,
    }
  });

  return response.data;
}

export async function fetchEmail(id: string) {
  const response = await axiosInstance.get<DetailedEmail>(`/emails/${id}`);
  return response.data;
}

export async function fetchCategories() {
  const response = await axiosInstance.get<string[]>('/emails/categories');
  return response.data;
}
