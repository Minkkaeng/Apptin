import React, { useState } from 'react';
import { MobileUsage, MobileLog } from '../mobileUsage';

export default function App() {
  const [mode, setMode] = useState<'mild' | 'balanced' | 'spicy'>('spicy');
  const [log, setLog] = useState<MobileLog | null>(null);

  const handleFetch = async () => {
    const data = await MobileUsage.getLog();
    setLog(data);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ color: '#2b2d42', fontSize: '28px', margin: 0 }}>📱 AppTin (앱틴)</h1>
        <p style={{ color: '#6c757d', marginTop: '6px', fontSize: '14px' }}>앱 + 루틴 | AI 라이프 코칭 대시보드</p>
      </header>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>🎚️ AI 코치 강도 선택</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['mild', 'balanced', 'spicy'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '24px',
                border: 'none',
                background: mode === m ? '#2b2d42' : '#f1f3f5',
                color: mode === m ? '#fff' : '#495057',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              {m === 'mild' ? '🌱 순한맛' : m === 'balanced' ? '⚖️ 보통' : '🌶️ 매운맛'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleFetch}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: '#4a4e69',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(74,78,105,0.3)'
        }}
      >
        오늘의 사용량 측적 및 AI 리포트 불러오기
      </button>

      {log && (
        <div style={{ marginTop: '24px', background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2b2d42' }}>📊 일일 모바일 스크린 타임</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>
            총 사용 시간: <strong>{log.totalMins}분</strong> | 화면 켬: <strong>{log.unlocks}회</strong>
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, color: '#343a40', fontSize: '14px', lineHeight: '1.6' }}>
            {log.apps.map((app) => (
              <li key={app.pkg}>
                <strong>{app.name}</strong>: {app.mins}분 시청 ({app.launches}회 실행)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
