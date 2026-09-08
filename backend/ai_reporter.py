"""
AiReporter: PC + Mobile 통합 AI 일지 & 코칭 생성 엔진
- 간결하고 직관적인 키워드 중심 네이밍 적용
"""

import json
import os
import datetime

COACH_STYLES = {
    "mild": {"title": "🌱 순한맛", "desc": "칭찬 70%, 다정한 격려 중심"},
    "balanced": {"title": "⚖️ 보통", "desc": "칭찬과 개선점 50:50 밸런스 분석"},
    "spicy": {"title": "🌶️ 매운맛", "desc": "직설적인 팩트 폭격 및 경각심 일깨우기"}
}

class AiReporter:
    def __init__(self, mode="spicy"):
        self.mode = mode
        self.style = COACH_STYLES.get(mode, COACH_STYLES["balanced"])

    def load_pc_log(self) -> dict:
        """PC 데이터 로드"""
        path = os.path.join(os.path.dirname(__file__), "sample_pc_activity.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"total_recorded_seconds": 18000, "activities": []}

    def load_mobile_log(self) -> dict:
        """모바일 데이터 로드"""
        return {
            "totalMins": 195,
            "unlocks": 42,
            "apps": [
                {"name": "유튜브", "mins": 95, "type": "Media"},
                {"name": "인스타그램", "mins": 50, "type": "Social"},
                {"name": "카카오톡", "mins": 35, "type": "Chat"}
            ]
        }

    def build_prompt(self, pc: dict, mobile: dict) -> str:
        """AI 프롬프트 생성"""
        pc_hours = pc.get("total_recorded_seconds", 0) / 3600.0
        mobile_hours = mobile["totalMins"] / 60.0
        
        return f"""
[AI 라이프 코치 - {self.style['title']} 모드]
지침: {self.style['desc']}

- PC 활동 ({pc_hours:.1f}h): {pc.get('activities', [])}
- 모바일 활동 ({mobile_hours:.1f}h, 잠금해제 {mobile['unlocks']}회): {mobile['apps']}

주의: "폰을 다른 방에 두기" 금지 ➔ "알람 후 흑백 모드", "2m 거리 책상 알람" 등 현대인 맞춤 루틴 제안!
"""

    def gen_report(() -> str:
        """최종 AI 리포트 생성"""
        pc = self.load_pc_log()
        mobile = self.load_mobile_log()
        prompt = self.build_prompt(pc, mobile)

        # 리포트 반환 샘플
        return f"""
### 🏆 오늘의 AI 라이프 리포트 ({self.style['title']} 모드)

> **"오늘 개발 몰입도는 최고! 하지만 퇴근 후 숏폼 시청시간은 피로를 가중시켜요 🌿"**

#### 👏 잘한 점
- VS Code 몰입 작업 3.5시간 달성

#### ⚠️ 개선할 점
- 유튜브/인스타 숏폼 총 2시간 25분 시청 (화면 켬 42회)

#### 💡 현대인 맞춤 루틴 팁
1. **📱 알람 설정 후 '흑백 모드' 전환**: 눈 피로와 도파민 유혹 동시 감소!
2. **⏰ 침대에서 2m 떨어진 책상 위 알람**: 상체를 일으키는 상쾌한 아침 기상 루틴.
"""

if __name__ == "__main__":
    reporter = AiReporter(mode="spicy")
    print(reporter.gen_report())
