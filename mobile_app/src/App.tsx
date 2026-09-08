import React, { useState } from 'react';

interface AppUsage {
  pkg: string;
  name: string;
  mins: number;
  launches: number;
  type: 'Media' | 'Social' | 'Work' | 'Chat';
}

interface MobileLog {
  date: string;
  totalMins: number;
  unlocks: number;
  apps: AppUsage[];
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export default function App() {
  const [tab, setTab] = useState<'report' | 'chat' | 'routine' | 'social'>('report');
  const [mode, setMode] = useState<'mild' | 'balanced' | 'spicy'>('spicy');
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { sender: 'ai', text: '오늘 미디어 시청 시간이 145분으로 다소 길었습니다. 이유나 피로한 점이 있으셨나요?', time: '21:00' }
  ]);

  const [log] = useState<MobileLog>({
    date: new Date().toISOString().split('T')[0],
    totalMins: 195,
    unlocks: 42,
    apps: [
      { pkg: 'com.google.android.youtube', name: '유튜브 (Shorts)', mins: 95, launches: 14, type: 'Media' },
      { pkg: 'com.instagram.android', name: '인스타그램', mins: 50, launches: 18, type: 'Social' },
      { pkg: 'com.kakao.talk', name: '카카오톡', mins: 35, launches: 25, type: 'Chat' },
      { pkg: 'com.microsoft.code', name: 'VS Code (PC 연동)', mins: 210, launches: 5, type: 'Work' },
    ]
  });

  const getDopamineLevel = () => {
    const mediaMins = log.apps.filter(a => a.type === 'Media' || a.type === 'Social').reduce((acc, curr) => acc + curr.mins, 0);
    const workMins = log.apps.filter(a => a.type === 'Work').reduce((acc, curr) => acc + curr.mins, 0);
    return Math.max(10, Math.min(100, Math.round(100 - (mediaMins / (workMins + 1)) * 40)));
  };

  const score = getDopamineLevel();

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    let aiText = '';

    if (mode === 'spicy') {
      aiText = `그렇군요. 하지만 변명보다는 내일 숏폼 타이머를 15분 줄여보는 행동이 훨씬 유익합니다.`;
    } else if (mode === 'mild') {
      aiText = `오늘 피곤하셨군요! 스스로를 너무 자책하지 마시고 내일 가볍게 10분만 줄여봐요.`;
    } else {
      aiText = `원인을 파악하신 것은 긍정적입니다. 내일은 밤 10시 흑백 모드를 활용해 보세요.`;
    }

    const aiMsg: ChatMessage = { sender: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, userMsg, aiMsg]);
    setChatInput('');
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      paddingBottom: '70px',
      filter: isGrayscale ? 'grayscale(100%)' : 'none',
      transition: 'filter 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 20px 14px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: '#f8fafc' }}>
              AppTin <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>App + Routine</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsGrayscale(!isGrayscale)}
              style={{
                background: isGrayscale ? '#38bdf8' : '#0f172a',
                color: isGrayscale ? '#0f172a' : '#cbd5e1',
                border: '1px solid #334155',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isGrayscale ? '흑백모드 ON' : '흑백모드 OFF'}
            </button>
            <span style={{ fontSize: '11px', color: '#38bdf8', border: '1px solid #334155', padding: '5px 8px', borderRadius: '6px', background: '#0f172a' }}>
              연속 4일
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main style={{ padding: '16px' }}>

        {/* TAB 1: REPORT & DASHBOARD */}
        {tab === 'report' && (
          <div>
            <section style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>오늘의 몰입 지수</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: score > 60 ? '#4ade80' : '#f87171' }}>{score}%</span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '4px', height: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <div style={{ width: `${score}%`, height: '100%', background: score > 60 ? '#22c55e' : '#ef4444' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                <span>작업 몰입: 210분</span>
                <span>미디어 시청: 145분</span>
              </div>
            </section>

            <section style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>AI 분석 강도 선택</div>
              <div style={{ display: 'flex', gap: '6px', background: '#1e293b', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
                {(['mild', 'balanced', 'spicy'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: '4px',
                      border: 'none',
                      background: mode === m ? '#38bdf8' : 'transparent',
                      color: mode === m ? '#0f172a' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}
                  >
                    {m === 'mild' ? '순한맛' : m === 'balanced' ? '보통' : '매운맛'}
                  </button>
                ))}
              </div>
            </section>

            <section style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc', fontWeight: '700' }}>AppTin 일일 리포트</h3>
              <blockquote style={{ margin: '0 0 12px 0', padding: '10px 12px', background: '#0f172a', borderLeft: '3px solid #38bdf8', borderRadius: '4px', fontSize: '12px', lineHeight: '1.5', color: '#e2e8f0' }}>
                {mode === 'spicy'
                  ? '"오늘 PC 개발 몰입 3시간 30분은 우수하나, 퇴근 후 숏폼 시청 2시간 25분은 뇌 피로도를 가중시킵니다."'
                  : mode === 'balanced'
                  ? '"생산성 및 휴식 균형 분석: PC 생산성은 높으나 저녁 스마트폰 미디어 사용 비중이 높습니다."'
                  : '"수고 많으셨습니다. 오늘 진행된 개발 작업에 높은 몰입도를 보여주셨습니다."'}
              </blockquote>
              <div style={{ marginBottom: '10px', fontSize: '12px', color: '#cbd5e1' }}>
                <strong style={{ color: '#4ade80' }}>주요 성과:</strong> VS Code 개발 몰입 210분 달성
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <strong style={{ color: '#f87171' }}>개선점:</strong> 유튜브 숏츠 95분, 인스타 50분 (화면 켬 42회)
              </div>
            </section>

            <section style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc', fontWeight: '700' }}>상세 사용 내역</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {log.apps.map((app) => (
                  <div key={app.pkg} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#0f172a', borderRadius: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#f1f5f9' }}>{app.name}</span>
                    <span style={{ color: app.type === 'Work' ? '#38bdf8' : '#f87171', fontWeight: '600' }}>{app.mins}분</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: AI INTERACTIVE CHAT */}
        {tab === 'chat' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc' }}>AI 코치 1:1 상담</h3>
            <div style={{ background: '#1e293b', borderRadius: '10px', padding: '12px', minHeight: '320px', maxHeight: '380px', overflowY: 'auto', border: '1px solid #334155', marginBottom: '12px' }}>
              {chatLog.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: msg.sender === 'user' ? '#38bdf8' : '#0f172a',
                    color: msg.sender === 'user' ? '#0f172a' : '#e2e8f0',
                    fontSize: '12px',
                    lineHeight: '1.4'
                  }}>
                    {msg.text}
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="오늘 하루나 피로 원인 입력..."
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '12px' }}
              />
              <button type="submit" style={{ padding: '10px 14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                전송
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ROUTINE & SLEEP ASSIST */}
        {tab === 'routine' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc' }}>스마트 수면 & 루틴 가이드</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px', color: '#f8fafc' }}>수면 전 흑백 모드 실행</strong>
                  <button
                    onClick={() => setIsGrayscale(!isGrayscale)}
                    style={{ padding: '4px 8px', background: isGrayscale ? '#22c55e' : '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {isGrayscale ? '설정 완료' : '지금 실행'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>알람을 유지한 상태로 스마트폰 디스플레이 색상을 제한하여 도파민 유혹 감소.</p>
              </div>

              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                <strong style={{ fontSize: '13px', color: '#f8fafc' }}>침대 2m 원거리 알람 위치</strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>아침 상체 일으키기 동선을 확보하여 깔끔한 아침 기상 루틴을 지원합니다.</p>
              </div>

              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                <strong style={{ fontSize: '13px', color: '#f8fafc' }}>저녁 10시 숏폼 타이머 제한</strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>유튜브/인스타그램 사용 시간을 저녁 시간대 15분 단위로 일시 제한합니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BADGES & LEADERBOARD */}
        {tab === 'social' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc' }}>달성 뱃지 & 팀 랭킹</h3>
            
            {/* Badges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8' }}>PC 몰입왕</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>PC 작업 3시간 이상 달성</div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1' }}>4일 연속 실천</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>4일 연속 갓생 루틴 진행</div>
              </div>
            </div>

            {/* Leaderboard */}
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>개발 스터디 루틴 랭킹</h4>
            <div style={{ background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '8px' }}>
              {[
                { rank: 1, name: '사용자 (나)', score: 78, status: '우수' },
                { rank: 2, name: '김개발님', score: 72, status: '보통' },
                { rank: 3, name: '이코드님', score: 65, status: '보통' }
              ].map((user) => (
                <div key={user.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: user.rank !== 3 ? '1px solid #334155' : 'none', fontSize: '12px' }}>
                  <span>{user.rank}위. {user.name}</span>
                  <span style={{ color: '#38bdf8', fontWeight: '600' }}>{user.score}점</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Tab Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        background: '#1e293b',
        borderTop: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        zIndex: 100
      }}>
        {[
          { id: 'report', label: '리포트' },
          { id: 'chat', label: 'AI 상담' },
          { id: 'routine', label: '루틴설정' },
          { id: 'social', label: '랭킹/뱃지' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: tab === t.id ? '#38bdf8' : '#94a3b8',
              fontSize: '12px',
              fontWeight: tab === t.id ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
