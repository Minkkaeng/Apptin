"""
PcTracker: Windows PC 활동 데이터 수집기
- 간결하고 직관적인 키워드 중심 네이밍 적용
"""

import time
import json
import os
import datetime
import ctypes
from ctypes import wintypes

class LastInputInfo(ctypes.Structure):
    _fields_ = [
        ('cbSize', wintypes.UINT),
        ('dwTime', wintypes.DWORD),
    ]

class PcTracker:
    def __init__(self, interval=5, idle_limit=60):
        self.interval = interval
        self.idle_limit = idle_limit
        self.logs = {}

    def get_idle_time(self) -> float:
        """유휴 시간(초) 측정"""
        info = LastInputInfo()
        info.cbSize = ctypes.sizeof(LastInputInfo)
        if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(info)):
            elapsed = ctypes.windll.kernel32.GetTickCount() - info.dwTime
            return elapsed / 1000.0
        return 0.0

    def get_win_title(self) -> str:
        """현재 활성화된 창 제목 반환"""
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value
        if "비밀번호" in title or "Password" in title:
            return "[보안 마스킹]"
        return title

    def run(self):
        """추적 시작"""
        print("🚀 PcTracker 시작 (Ctrl+C로 종료)")
        try:
            while True:
                idle = self.get_idle_time()
                if idle < self.idle_limit:
                    title = self.get_win_title()
                    if title:
                        self.logs[title] = self.logs.get(title, 0) + self.interval
                        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {title[:30]} ({self.logs[title]}s)")
                else:
                    print(f"⏸️ 부재 중 ({int(idle)}s)")
                time.sleep(self.interval)
        except KeyboardInterrupt:
            self.save()

    def save(self):
        """결과 저장"""
        today = datetime.date.today().isoformat()
        path = f"pc_activity_{today}.json"
        data = {
            "date": today,
            "total_sec": sum(self.logs.values()),
            "activities": self.logs
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ 저장 완료: {path}")

if __name__ == "__main__":
    tracker = PcTracker(interval=5, idle_limit=60)
    tracker.run()
