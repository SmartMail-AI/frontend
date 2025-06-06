import google.generativeai as genai
from typing import Dict
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import re

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

async def classify_email(subject: str, content: str, sender: str) -> Dict:
    try:
        # Gemini에 전달할 프롬프트 준비
        prompt = f"""
        다음 이메일을 분석하여 분류해주세요:

        제목: {subject}
        발신자: {sender}
        내용: {content}

        반드시 다음 카테고리 중 하나로 분류하고, 중요 점수(0-100)와 함께 응답해주세요:
        - WORK: 중요한 업무 관련 이메일 (회의, 프로젝트, 보고서 등)
        - PERSONAL: 개인적인 통신 (친구, 가족과의 대화)
        - NEWSLETTER: 뉴스레터 및 구독 메일 (뉴스, 블로그, 업데이트 등)
        - SPAM: 원치 않는 또는 의심스러운 이메일
        - ADVERTISEMENT: 마케팅 및 홍보성 콘텐츠
        - SOCIAL: 소셜 미디어 알림 (SNS, 커뮤니티 등)
        - UNKNOWN: 분류 불가능한 이메일

        반드시 다음 JSON 형식으로 응답해주세요:
        {{
            "category": "카테고리",
            "importance": "중요도 점수"
        }}
        """

        # Gemini API 호출(동기)
        response = model.generate_content(prompt)
        result = response.text
        
        # 응답 파싱
        classification = parse_gemini_response(result)
        
        # 분류 결과 검증
        valid_categories = [getattr(EmailCategory, attr) for attr in dir(EmailCategory) 
                          if not attr.startswith('_')]
        if classification["category"] not in valid_categories:
            classification["category"] = EmailCategory.UNKNOWN
            
        return {
            "category": classification["category"],
            "importance": classification["importance"],
            "classified_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise Exception(f"이메일 분류 실패: {str(e)}")

async def get_email_priority(category: str, importance: int) -> str:
    """이메일의 우선순위를 결정합니다."""
    if category == EmailCategory.WORK and importance >= 80:
        return "HIGH"
    elif category in [EmailCategory.PERSONAL] and importance >= 70:
        return "MEDIUM"
    elif category == EmailCategory.SPAM:
        return "LOW"
    else:
        return "NORMAL" 