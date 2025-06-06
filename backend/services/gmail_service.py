from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import base64
import os
import json
from typing import List, Optional, Dict
from datetime import datetime
import email
from email.mime.text import MIMEText
from dotenv import load_dotenv
from email.header import decode_header
import re

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailService:
    def __init__(self, user_id: str, access_token: str, refresh_token: str):
        self.user_id = user_id
        self.credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            scopes=[
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send'
            ]
        )
        self.service = build('gmail', 'v1', credentials=self.credentials)

    def _decode_email_header(self, header: str) -> str:
        """이메일 헤더 디코딩"""
        decoded_header = decode_header(header)
        header_parts = []
        for content, charset in decoded_header:
            if isinstance(content, bytes):
                if charset:
                    header_parts.append(content.decode(charset))
                else:
                    header_parts.append(content.decode('utf-8', errors='replace'))
            else:
                header_parts.append(content)
        return ''.join(header_parts)

    def _parse_date(self, date_str: str) -> datetime:
        """이메일 날짜 파싱"""
        try:
            date_str = re.sub(r'\s+\([A-Z]+\)$', '', date_str)
            return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
        except ValueError:
            try:
                return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S')
            except ValueError:
                return datetime.now()

    async def get_emails(self, max_results: int = 10, page_token: Optional[str] = None) -> Dict:
        """이메일 목록을 가져옵니다."""
        try:
            # Gmail API 서비스 초기화
            service = build('gmail', 'v1', credentials=self.credentials)
            
            # 이메일 목록 요청
            results = service.users().messages().list(
                userId='me',
                maxResults=max_results,
                pageToken=page_token
            ).execute()
            
            messages = results.get('messages', [])
            next_page_token = results.get('nextPageToken')
            previous_page_token = results.get('previousPageToken')
            
            # 각 이메일의 상세 정보 가져오기
            emails = []
            for message in messages:
                msg = service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='metadata',
                    metadataHeaders=['From', 'Subject', 'Date']
                ).execute()
                
                # 헤더 정보 추출
                headers = {}
                if 'payload' in msg and 'headers' in msg['payload']:
                    for header in msg['payload']['headers']:
                        headers[header['name']] = header['value']
                
                # 날짜 파싱
                date = datetime.utcnow()
                if 'Date' in headers:
                    try:
                        date = datetime.strptime(headers['Date'], '%a, %d %b %Y %H:%M:%S %z')
                    except:
                        pass
                
                emails.append({
                    'id': message['id'],
                    'subject': headers.get('Subject', ''),
                    'sender': headers.get('From', ''),
                    'date': date,
                    'snippet': msg.get('snippet', '')
                })
            
            return {
                'messages': emails,
                'next_page_token': next_page_token,
                'previous_page_token': previous_page_token
            }
            
        except Exception as e:
            raise Exception(f"이메일 목록 조회 실패: {str(e)}")

    async def get_email(self, email_id: str) -> Dict:
        """특정 이메일의 상세 내용을 가져옵니다."""
        try:
            msg = self.service.users().messages().get(
                userId='me',
                id=email_id,
                format='full'
            ).execute()
            
            headers = msg['payload']['headers']
            subject = next((self._decode_email_header(h['value']) for h in headers if h['name'].lower() == 'subject'), '')
            sender = next((self._decode_email_header(h['value']) for h in headers if h['name'].lower() == 'from'), '')
            date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
            date = self._parse_date(date_str)
            
            # 이메일 본문 가져오기
            if 'parts' in msg['payload']:
                parts = msg['payload']['parts']
                content = ''
                for part in parts:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        if data:
                            content += base64.urlsafe_b64decode(data).decode('utf-8')
            else:
                data = msg['payload']['body'].get('data', '')
                content = base64.urlsafe_b64decode(data).decode('utf-8') if data else ''
            
            return {
                'id': email_id,
                'subject': subject,
                'sender': sender,
                'date': date,
                'content': content
            }
            
        except Exception as e:
            raise Exception(f"Failed to fetch email: {str(e)}")

    def _get_content_from_parts(self, parts: List[dict]) -> str:
        content = ""
        for part in parts:
            if part['mimeType'] == 'text/plain':
                content += base64.urlsafe_b64decode(
                    part['body']['data']).decode()
            elif 'parts' in part:
                content += self._get_content_from_parts(part['parts'])
        return content 