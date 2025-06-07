from fastapi import APIRouter, HTTPException, Depends
from fastapi import Request as FastAPIRequest
from fastapi.security import OAuth2PasswordBearer
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from starlette.responses import RedirectResponse

load_dotenv()

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT 설정
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth 2.0 설정
CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [os.getenv("OAUTH_REDIRECT_URI")],
    }
}

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

# Pydantic 모델
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    credentials: Optional[Credentials] = None

    class Config:
        arbitrary_types_allowed = True

class GoogleTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    jwt_token: str
    email: str
    name: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        access_token: str = payload.get("access_token")
        refresh_token: str = payload.get("refresh_token")
        if email is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return TokenData(email=email, user_id=user_id, access_token=access_token, refresh_token=refresh_token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Google OAuth 인증 엔드포인트
@router.get("/google")
async def google_auth(request: FastAPIRequest):
    """Google OAuth 인증 URL을 생성합니다."""
    mode = os.getenv('MODE', 'development')
    if mode == 'production':
        redirect_uri = "https://server.cla6sha.de/api/auth/google/callback"
    else:
        redirect_uri = str(request.url_for('google_auth_callback'))
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # 항상 동의 화면 표시
    )
    return {"authorization_url": authorization_url}

@router.get("/google/callback")
async def google_auth_callback(request: FastAPIRequest, code: str):
    """Google OAuth 콜백을 처리합니다."""
    try:
        mode = os.getenv('MODE', 'development')
        if mode == 'production':
            redirect_uri = "https://server.cla6sha.de/auth/google/callback"
        else:
            redirect_uri = str(request.url_for('google_auth_callback'))
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
        flow.fetch_token(code=code)

        credentials = flow.credentials

        # Google People API를 사용하여 사용자 정보 가져오기
        service = build('people', 'v1', credentials=credentials)
        profile = service.people().get(
            resourceName='people/me',
            personFields='emailAddresses,names'
        ).execute()

        # 사용자 이메일 가져오기
        email = profile['emailAddresses'][0]['value']
        # 사용자 이름 가져오기
        name = profile['names'][0]['displayName']

        # TODO: 여기서 사용자 정보를 데이터베이스에 저장
        # user_id = create_or_update_user(email, name, credentials)
        user_id = email  # 임시로 이메일을 user_id로 사용

        # JWT 토큰 생성
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={
                "sub": email,
                "user_id": user_id,
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token
            },
            expires_delta=access_token_expires
        )

        spa_redirect_uri = os.getenv('SPA_REDIRECT_URI', 'http://localhost:5173/auth/result')
        query = f"?token={jwt_token}&email={email}&name={name}"
        return RedirectResponse(spa_redirect_uri + query)
        # return GoogleTokenResponse(
        #     access_token=credentials.token,
        #     refresh_token=credentials.refresh_token,
        #     user_id=user_id,
        #     jwt_token=jwt_token,
        #     email=email,
        #     name=name
        # )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 보호된 엔드포인트 예시
@router.get("/protected")
async def protected_route(current_user: TokenData = Depends(get_current_user)):
    """JWT 토큰으로 보호된 엔드포인트 예시"""
    return {
        "message": "This is a protected route",
        "user_email": current_user.email,
        "user_id": current_user.user_id
    }
