from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from services.gmail_service import GmailService
from routers import auth, emails
from routers.emails import setup_email_polling

# 환경변수 로드
load_dotenv()

app = FastAPI(
    title="SmartMail AI",
    description="AI-powered email classification and summarization system",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 특정 출처로 교체 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 포함
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])

# 상태 확인 엔드포인트
@app.get("/")
async def root():
    return {"status": "healthy", "message": "SmartMail AI API is running"}


# 이메일 폴링 설정
setup_email_polling(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
