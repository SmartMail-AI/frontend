from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from routers.auth import get_current_user, TokenData
from services.email_classifier import classify_email, EmailCategory
from services.gmail_service import GmailService
from sqlalchemy.orm import Session
from models.email import get_db, init_db, Email
from services.email_processor import process_email, get_emails_by_category, get_latest_email_id
from datetime import datetime, timedelta
from fastapi_utils.tasks import repeat_every
import json

load_dotenv()

router = APIRouter()


# 이메일 폴링 상태 저장
last_checked_email_id = None
last_check_time = None
is_polling_started = False

async def check_new_emails():
    """새로운 이메일을 확인하고 처리합니다."""
    global last_checked_email_id, last_check_time, is_polling_started
    
    if not is_polling_started:
        return
        
    try:
        # DB 세션 생성
        db = next(get_db())
        
        # 모든 사용자의 Gmail 서비스 초기화 및 체크
        gmail_service = GmailService(
            user_id="current_user",  # 실제 구현에서는 사용자별로 처리
            access_token=os.getenv("GMAIL_ACCESS_TOKEN"),
            refresh_token=os.getenv("GMAIL_REFRESH_TOKEN")
        )

        # 최신 이메일 ID 가져오기
        latest_email_id = await get_latest_email_id(gmail_service)
        if not latest_email_id:
            return

        # 새로운 이메일이 있는 경우
        if latest_email_id != last_checked_email_id:
            # 이메일 처리
            await process_email(latest_email_id, gmail_service, db)
            
            # 상태 업데이트
            last_checked_email_id = latest_email_id
            last_check_time = datetime.utcnow()

    except Exception as e:
        print(f"이메일 체크 실패: {str(e)}")
    finally:
        db.close()

def setup_email_polling(app):
    """이메일 폴링을 설정합니다."""
    @app.on_event("startup")
    async def startup_event():
        """서버 시작 시 실행되는 이벤트"""
        # DB 초기화
        init_db()
        
    @app.on_event("startup")
    @repeat_every(seconds=300)  # 5분마다 체크
    async def start_email_polling():
        """이메일 폴링을 시작합니다."""
        await check_new_emails()

# Gmail API 관련 함수들
def get_gmail_service(credentials: Credentials):
    """Gmail API 서비스 생성"""
    return build('gmail', 'v1', credentials=credentials)

def create_message(sender: str, to: str, subject: str, message_text: str):
    """이메일 메시지 생성"""
    message = MIMEMultipart()
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject

    msg = MIMEText(message_text)
    message.attach(msg)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

class EmailMessage(BaseModel):
    id: str
    subject: str
    from_: str
    snippet: str
    date: str
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    sentiment: Optional[str] = None
    action_items: Optional[List[str]] = None
    category: Optional[str] = None
    importance: Optional[float] = None

class EmailList(BaseModel):
    messages: List[EmailMessage]
    next_page_token: Optional[str] = None
    previous_page_token: Optional[str] = None

class CategoryInfo(BaseModel):
    category: str
    count: int

# Gmail API 엔드포인트
@router.get("/", response_model=EmailList)
async def get_emails(
    max_results: int = 10,
    page_token: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: str = "importance",
    sort_order: str = "desc",
    current_user: TokenData = Depends(get_current_user)
):
    """사용자의 이메일 목록을 가져옵니다."""
    global is_polling_started
    
    try:
        # 폴링이 시작되지 않았다면 시작
        if not is_polling_started:
            # Gmail API 서비스 초기화
            credentials = Credentials(
                token=current_user.access_token,
                refresh_token=current_user.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                scopes=[
                    'openid',
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.send',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ]
            )

            # 환경 변수 업데이트
            os.environ["GMAIL_ACCESS_TOKEN"] = current_user.access_token
            os.environ["GMAIL_REFRESH_TOKEN"] = current_user.refresh_token
            
            # 폴링 시작
            is_polling_started = True

        gmail_service = GmailService(
            user_id=current_user.user_id,
            access_token=current_user.access_token,
            refresh_token=current_user.refresh_token
        )
        
        # Gmail API에서 이메일 목록 가져오기
        gmail_response = await gmail_service.get_emails(
            max_results=max_results,
            page_token=page_token
        )
        
        # DB 세션 생성
        db = next(get_db())
        
        email_list = []
        for email in gmail_response['messages']:
            # DB에서 이메일 정보 조회
            db_email = db.query(Email).filter(Email.email_id == email['id']).first()
            
            # 이미 처리된 이메일이 아닌 경우에만 처리
            if not db_email:
                processed_email = await process_email(email['id'], gmail_service, db)
            else:
                processed_email = db_email
            
            # 카테고리 필터링
            if category and processed_email.category != category:
                continue
            
            # JSON 문자열을 파싱
            key_points = json.loads(processed_email.key_points) if processed_email.key_points else None
            action_items = json.loads(processed_email.action_items) if processed_email.action_items else None
            
            email_list.append(EmailMessage(
                id=email['id'],
                subject=email['subject'],
                from_=email['sender'],
                snippet=email.get('snippet', ''),
                date=email['date'].isoformat(),
                summary=processed_email.summary,
                key_points=key_points,
                sentiment=processed_email.sentiment,
                action_items=action_items,
                category=processed_email.category,
                importance=processed_email.importance
            ))
            
        # 정렬
        if sort_by == "importance":
            email_list.sort(key=lambda x: x.importance if x.importance is not None else 0, reverse=(sort_order == "desc"))
        elif sort_by == "date":
            email_list.sort(key=lambda x: x.date, reverse=(sort_order == "desc"))
            
        return {
            "messages": email_list,
            "next_page_token": gmail_response['next_page_token'],
            "previous_page_token": gmail_response['previous_page_token']
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.get("/categories")
async def get_categories(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """모든 카테고리 목록을 조회합니다."""
    try:
        # EmailCategory 클래스에서 정의된 모든 카테고리 반환
        categories = [
            getattr(EmailCategory, attr) 
            for attr in dir(EmailCategory) 
            if not attr.startswith('_')
        ]
        return categories
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{email_id}")
async def get_email(
    email_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Dict:
    """특정 이메일의 상세 내용을 조회합니다."""
    try:
        # DB에서 이메일 조회
        email = db.query(Email).filter(Email.email_id == email_id).first()
        if not email:
            raise HTTPException(status_code=404, detail="이메일을 찾을 수 없습니다.")
        
        # Gmail API에서 이메일 상세 정보 가져오기
        credentials = Credentials(
            token=current_user.access_token,
            refresh_token=current_user.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        )

        service = get_gmail_service(credentials)
        message = service.users().messages().get(
            userId='me',
            id=email_id,
            format='full'
        ).execute()

        # 이메일 본문 디코딩
        def decode_body(part):
            if 'body' in part and 'data' in part['body']:
                return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
            return None

        # 이메일 본문 추출
        body = None
        if 'payload' in message:
            payload = message['payload']
            if 'body' in payload and 'data' in payload['body']:
                body = decode_body(payload)
            elif 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/html':
                        body = decode_body(part)
                        break
                    elif part['mimeType'] == 'text/plain':
                        body = decode_body(part)

        # 헤더 정보 추출
        headers = {}
        if 'payload' in message and 'headers' in message['payload']:
            for header in message['payload']['headers']:
                headers[header['name']] = header['value']

        return {
            "id": message['id'],
            "threadId": message['threadId'],
            "labelIds": message['labelIds'],
            "snippet": message['snippet'],
            "headers": headers,
            "body": body,
            "summary": email.summary,
            "key_points": email.key_points,
            "sentiment": email.sentiment,
            "action_items": email.action_items,
            "category": email.category,
            "importance": email.importance,
            "received_at": email.received_at.isoformat() if email.received_at else None,
            "processed_at": email.processed_at.isoformat() if email.processed_at else None
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#테스트 용도
@router.post("/save/{email_id}")
async def save_email(
    email_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """이메일 ID를 받아서 DB에 저장합니다."""
    try:
        # Gmail API 서비스 초기화
        credentials = Credentials(
            token=current_user.access_token,
            refresh_token=current_user.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        )

        service = get_gmail_service(credentials)
        
        # 이메일 상세 내용 가져오기
        message = service.users().messages().get(
            userId='me',
            id=email_id,
            format='full'
        ).execute()

        # 이미 저장된 이메일인지 확인
        existing_email = db.query(Email).filter(Email.email_id == email_id).first()
        if existing_email:
            return {"message": "이미 저장된 이메일입니다.", "email": existing_email.to_dict()}

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
            email_id=email_id,
            thread_id=message.get('threadId'),
            subject=headers.get('Subject', ''),
            sender=headers.get('From', ''),
            recipient=headers.get('To', ''),
            content=content,
            html_content=html_content,
            category="UNCATEGORIZED",  # 기본 카테고리
            importance=50.0,  # 기본 중요도
            label_ids=json.dumps(message.get('labelIds', [])),
            received_at=received_at
        )

        # DB에 저장
        db.add(email)
        db.commit()
        db.refresh(email)
        
        return {"message": "이메일이 성공적으로 저장되었습니다.", "email": email.to_dict()}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 