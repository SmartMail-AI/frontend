from sqlalchemy import Column, Integer, String, DateTime, Float, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class Email(Base):
    __tablename__ = 'emails'

    id = Column(Integer, primary_key=True)
    email_id = Column(String, unique=True, nullable=False)  # Gmail message ID
    thread_id = Column(String)  # Gmail thread ID
    subject = Column(String)
    sender = Column(String)
    recipient = Column(String)
    content = Column(Text)
    html_content = Column(Text)  # HTML 형식의 이메일 내용
    category = Column(String, nullable=False)  # WORK, PERSONAL, NEWSLETTER, etc.
    importance = Column(Float, nullable=False)  # 0-100
    summary = Column(Text)  # 이메일 요약
    key_points = Column(Text)  # 주요 포인트
    sentiment = Column(String)  # 감정 분석 결과
    action_items = Column(Text)  # 액션 아이템
    label_ids = Column(Text)  # Gmail 라벨 ID들 (JSON 문자열로 저장)
    received_at = Column(DateTime, nullable=False)  # Gmail 수신 시간
    processed_at = Column(DateTime, default=datetime.utcnow)  # 처리 시간

    def to_dict(self):
        return {
            "id": self.id,
            "email_id": self.email_id,
            "thread_id": self.thread_id,
            "subject": self.subject,
            "sender": self.sender,
            "recipient": self.recipient,
            "content": self.content,
            "html_content": self.html_content,
            "category": self.category,
            "importance": self.importance,
            "summary": self.summary,
            "key_points": self.key_points,
            "sentiment": self.sentiment,
            "action_items": self.action_items,
            "label_ids": self.label_ids,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None
        }

# SQLite 데이터베이스 설정
DATABASE_URL = "sqlite:///./emails.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    from models.email_model import Email
    """데이터베이스를 초기화합니다."""
    # 테이블 생성
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 