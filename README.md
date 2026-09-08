# 📱 앱틴 (AppTin)

> **앱(App) + 루틴(Routine)**
> PC 작업 활동과 모바일 앱 사용 내역을 자동으로 수집하여 AI가 하루 갓생 리포트 및 현대인 맞춤 루틴 피드백을 제공하는 스마트 서비스

---

## 🏗️ 프로젝트 구조 (Project Structure)

```
AppTin/
├── pc_tracker/          # Windows PC 활동 측정 에이전트 (Python)
│   └── pc_tracker.py
├── mobile_app/          # AppTin 모바일 앱 (React + TypeScript + Capacitor)
│   └── mobileUsage.ts
├── backend/             # AppTin AI 리포트 생성 및 데이터 동기화 파이프라인
│   └── ai_reporter.py
├── docs/                # 시스템 구현 계획서 및 설계 문서
│   └── implementation_plan.md
├── .gitignore
└── README.md
```

---

## 🌟 주요 기능 및 키워드 규칙

1. **PC 활동 수집 (PcTracker)**
   - 활성 작업 창 제목 및 시간 측정 (`get_idle_time()`, `get_win_title()`)
   - 유휴 시간(Idle time) 자동 감지 및 보안 마스킹

2. **모바일 사용량 수집 (MobileUsage)**
   - Android `UsageStatsManager` 기반 앱별 사용 시간 및 화면 켬 횟수 측정 (`getLog()`)

3. **AppTin AI Daily 리포트 (AiReporter)**
   - **3단계 코치 강도 선택**: 🌱 순한맛 / ⚖️ 보통 / 🌶️ 매운맛 팩폭 모드 (`gen_report()`)
   - **Zero-Cost 하이브리드 동기화**: 동일 Wi-Fi 망 P2P 로컬 통신 + Supabase Free Tier
   - **현대인 맞춤 루틴 팁**: 알람 설정 후 흑백 모드, 2m 책상 알람 등 현실적인 피드백 제공

---

## 🚀 시작하기

### PC Tracker 실행
```bash
cd pc_tracker
python pc_tracker.py
```

### AppTin AI 리포트 엔진 실행
```bash
cd backend
python ai_reporter.py
```
