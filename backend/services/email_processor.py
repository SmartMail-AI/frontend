import google.generativeai as genai
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import re
from sqlalchemy.orm import Session
from models.email_model import Email
from services.gmail_service import GmailService
from services.email_classifier import classify_email
from services.email_summarizer import summarize_email
import base64

load_dotenv()

# Gemini API 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

class EmailCategory:
    WORK = "WORK"  # 업무 관련 중요 이메일
    PERSONAL = "PERSONAL"  # 개인 통신
    NEWSLETTER = "NEWSLETTER"  # 뉴스레터
    SPAM = "SPAM"  # 스팸
    ADVERTISEMENT = "ADVERTISEMENT"  # 광고
    SOCIAL = "SOCIAL"  # 소셜 미디어 알림
    UNKNOWN = "UNKNOWN"  # 분류 불가

def parse_gemini_response(response_text: str) -> Dict:
    """Gemini API 응답을 파싱합니다."""
    try:
        # JSON 형식 찾기
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            json_str = json_match.group()
            return json.loads(json_str)
        
        # JSON 형식이 아닌 경우 기본 구조 생성
        return {
            "category": EmailCategory.UNKNOWN,
            "importance": 50
        }
    except json.JSONDecodeError:
        # JSON 파싱 실패 시 기본 구조 생성
        return {
            "category": EmailCategory.UNKNOWN,
            "importance": 50
        }

async def process_email(email_id: str, gmail_service: GmailService, db: Session) -> Optional[Email]:
    """이메일을 처리(분류 및 요약)합니다."""
    try:
        # 이미 처리된 이메일인지 확인
        existing = db.query(Email).filter(Email.email_id == email_id).first()
        if existing:
            return existing

        # 이메일 내용 가져오기
        email_data = await gmail_service.get_email(email_id)
        
        # 이메일 분류
        classification = await classify_email(
            subject=email_data['subject'],
            content=email_data['content'],
            sender=email_data['sender']
        )
        
        # 이메일 요약
        try:
            summary_result = await summarize_email(
                content=email_data['content'],
                subject=email_data['subject'],
                sender=email_data['sender']
            )
            summary = summary_result.get('summary') if summary_result else None
            key_points = summary_result.get('key_points') if summary_result else None
            action_items = summary_result.get('action_items') if summary_result else None
        except Exception as e:
            print(f"이메일 요약 실패: {str(e)}")
            summary = None
            key_points = None
            action_items = None

        # DB에 저장
        email = Email(
            email_id=email_id,
            subject=email_data['subject'],
            sender=email_data['sender'],
            content=email_data['content'],
            category=classification["category"],
            importance=float(classification["importance"]),
            summary=summary,
            key_points=json.dumps(key_points) if key_points else None,
            action_items=json.dumps(action_items) if action_items else None,
            received_at=email_data['date']
        )
        db.add(email)
        db.commit()
        db.refresh(email)
        
        return email

    except Exception as e:
        db.rollback()
        raise Exception(f"이메일 처리 실패: {str(e)}")

async def get_emails_by_category(
    db: Session,
    category: str,
    sort_by: str = "importance",
    sort_order: str = "desc",
    limit: int = 100
) -> List[Dict]:
    """카테고리별 이메일 목록을 조회합니다."""
    query = db.query(Email).filter(Email.category == category)
    
    # 정렬
    if sort_by == "importance":
        query = query.order_by(
            Email.importance.desc() if sort_order == "desc" 
            else Email.importance.asc()
        )
    elif sort_by == "received_at":
        query = query.order_by(
            Email.received_at.desc() if sort_order == "desc"
            else Email.received_at.asc()
        )
    
    # 결과 반환
    results = query.limit(limit).all()
    return [email.to_dict() for email in results]

async def get_latest_email_id(gmail_service: GmailService) -> str:
    """가장 최근 이메일의 ID를 가져옵니다."""
    emails = await gmail_service.get_emails(max_results=1)
    return emails['messages'][0]['id'] if emails and emails['messages'] else None

async def save_email_to_db(db: Session, message: dict, category: str = "UNCATEGORIZED", importance: float = 50.0) -> Email:
    """이메일 데이터를 데이터베이스에 저장합니다."""
    try:
        # 이메일 본문 디코딩
        def decode_body(part):
            if 'body' in part and 'data' in part['body']:
                return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
            return None

        # 이메일 본문 추출
        content = None
        html_content = None
        if 'payload' in message:
            payload = message['payload']
            if 'body' in payload and 'data' in payload['body']:
                content = decode_body(payload)
            elif 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/html':
                        html_content = decode_body(part)
                    elif part['mimeType'] == 'text/plain':
                        content = decode_body(part)

        # 헤더 정보 추출
        headers = {}
        if 'payload' in message and 'headers' in message['payload']:
            for header in message['payload']['headers']:
                headers[header['name']] = header['value']

        # 수신 시간 파싱
        received_at = datetime.utcnow()
        if 'Date' in headers:
            try:
                received_at = datetime.strptime(headers['Date'], '%a, %d %b %Y %H:%M:%S %z')
            except:
                pass

        # 새 이메일 객체 생성
        email = Email(
            email_id=message['id'],
            thread_id=message['threadId'],
            subject=headers.get('Subject', ''),
            sender=headers.get('From', ''),
            recipient=headers.get('To', ''),
            content=content,
            html_content=html_content,
            category=category,
            importance=importance,
            label_ids=json.dumps(message.get('labelIds', [])),
            received_at=received_at
        )

        # DB에 저장
        db.add(email)
        db.commit()
        db.refresh(email)
        
        return email

    except Exception as e:
        db.rollback()
        raise e 

