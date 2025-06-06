import google.generativeai as genai
from typing import List, Dict
import os
from dotenv import load_dotenv
from datetime import datetime
from jose import jwt
from services.gmail_service import GmailService
import json
import re

load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# print("사용 가능한 모델 목록:")
# try:
#     for model in genai.list_models():
#         # generateContent를 지원하는 모델만 필터링
#         if "generateContent" in model.supported_generation_methods:
#             print(f"Model Name: {model.name}")
#             print(f"  Description: {model.description}")
#             print(f"  Supported methods: {model.supported_generation_methods}")
#             print("---")
# except Exception as e:
#     print(f"ListModels 호출 실패: {e}")

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
            "summary": response_text.strip(),
            "key_points": [],
            "action_items": []
        }
    except json.JSONDecodeError:
        # JSON 파싱 실패 시 기본 구조 생성
        return {
            "summary": response_text.strip(),
            "key_points": [],
            "action_items": []
        }

async def summarize_email(content: str, subject: str = "", sender: str = "") -> Dict:
    """이메일을 요약합니다."""
    try:
        # Gemini에 전달할 프롬프트 준비
        prompt = f"""
        다음 이메일을 분석하여 다음 정보를 제공해주세요:
        1. 간단한 요약
        2. 핵심 포인트
        3. 실행 항목 (있는 경우)

        이메일 제목: {subject}
        발신자: {sender}
        이메일 내용: {content}

        반드시 다음 JSON 형식으로 응답해주세요:
        {{
            "summary": "간단한 요약",
            "key_points": [
                "핵심 포인트 1",
                "핵심 포인트 2",
                ...
            ],
            "action_items": [
                "실행 항목 1",
                "실행 항목 2",
                ...
            ]
        }}
        """

        # Gemini API 호출 (동기식)
        response = model.generate_content(prompt)
        result = response.text
        
        # 응답 파싱
        analysis = parse_gemini_response(result)
        
        return {
            "summary": analysis["summary"],
            "key_points": analysis["key_points"],
            "action_items": analysis["action_items"],
            "summarized_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise Exception(f"이메일 요약 실패: {str(e)}") 