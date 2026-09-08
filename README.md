# 📊 Digital-Life AI Log

> **PC 작업 활동과 모바일 앱 사용 내역을 수집하여 AI가 하루 갓생 리포트 및 현대인 맞춤 루틴 피드백을 제공하는 시스템**

## 🏗️ 프로젝트 구조

- `pc_tracker/`: Windows PC 활동 수집기 (`pc_tracker.py` - `PcTracker` 클래스)
- `mobile_app/`: 모바일 사용량 수집 모듈 (`mobileUsage.ts` - `MobileUsage` 클래스)
- `backend/`: AI 리포트 생성 엔진 (`ai_reporter.py` - `AiReporter` 클래스)
- `docs/`: 시스템 구현 계획서 (`implementation_plan.md`)

## 🌟 주요 특징 및 키워드 규칙

- **3단계 코치 강도**: 🌱 순한맛 / ⚖️ 보통 / 🌶️ 매운맛 팩폭 모드
- **Zero-Cost 하이브리드 동기화**: 동일 Wi-Fi 망 P2P 로컬 통신 + Supabase Free Tier
- **현대인 맞춤 루틴**: 알람 설정 후 흑백 모드 전환, 2m 책상 알람 배치
- **간결한 키워드 네이밍 규칙**: 유지보수를 위한 포인트 키워드 단어 네이밍 엄수 (`PcTracker`, `MobileUsage`, `AiReporter`)
