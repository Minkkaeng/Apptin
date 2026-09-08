import React, { useState, useEffect } from 'react';
import { askGeminiCoach } from './services/aiService';

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

interface GroupFeedPost {
  id: string;
  author: string;
  time: string;
  score: number;
  routineSummary: string;
  likes: number;
}

const STORAGE_KEYS = {
  LOG: 'apptin_log_data',
  CHAT: 'apptin_chat_history',
  FEED: 'apptin_feed_posts',
  MODE: 'apptin_coach_mode',
  GRAYSCALE: 'apptin_grayscale_state'
};

export default function App() {
  const [tab, setTab] = useState<'report' | 'chat' | 'group' | 'settings' | 'help'>('report');
  
  const [mode, setMode] = useState<'mild' | 'balanced' | 'spicy'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as any) || 'spicy';
  });
  
  const [isGrayscale, setIsGrayscale] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.GRAYSCALE) === 'true';
  });

  const [log, setLog] = useState<MobileLog | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOG);
    return saved ? JSON.parse(saved) : null;
  });

  const [chatLog, setChatLog] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
    return saved ? JSON.parse(saved) : [];
  });

  const [feedPosts, setFeedPosts] = useState<GroupFeedPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEED);
    return saved ? JSON.parse(saved) : [];
  });

  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [groupCode] = useState('APPTIN-8291');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newRoutineText, setNewRoutineText] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRAYSCALE, isGrayscale.toString());
  }, [isGrayscale]);

  useEffect(() => {
    if (log) localStorage.setItem(STORAGE_KEYS.LOG, JSON.stringify(log));
    else localStorage.removeItem(STORAGE_KEYS.LOG);
  }, [log]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatLog));
  }, [chatLog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(feedPosts));
  }, [feedPosts]);

  const getDopamineLevel = () => {
    if (!log || !log.apps.length) return 0;
    const mediaMins = log.apps.filter(a => a.type === 'Media' || a.type === 'Social').reduce((acc, curr) => acc + curr.mins, 0);
    const workMins = log.apps.filter(a => a.type === 'Work').reduce((acc, curr) => acc + curr.mins, 0);
    return Math.max(10, Math.min(100, Math.round(100 - (mediaMins / (workMins + 1)) * 40)));
  };

  const score = getDopamineLevel();

  const handleInjectSampleData = () => {
    const sampleLog: MobileLog = {
      date: new Date().toISOString().split('T')[0],
      totalMins: 195,
      unlocks: 42,
      apps: [
        { pkg: 'com.google.android.youtube', name: '유튜브 (Shorts)', mins: 95, launches: 14, type: 'Media' },
        { pkg: 'com.instagram.android', name: '인스타그램', mins: 50, launches: 18, type: 'Social' },
        { pkg: 'com.kakao.talk', name: '카카오톡', mins: 35, launches: 25, type: 'Chat' },
        { pkg: 'com.microsoft.code', name: 'VS Code (PC 연동)', mins: 210, launches: 5, type: 'Work' },
      ]
    };
    setLog(sampleLog);
    if (chatLog.length === 0) {
      setChatLog([
        { sender: 'ai', text: 'Gemini AI 연동이 완료되었습니다! 오늘 하루 디지털 활동이나 루틴 고민에 대해 편하게 물어보세요.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }
  };

  const handleResetData = () => {
    if (window.confirm('모든 로컬 데이터를 초기화하시겠습니까?')) {
      localStorage.clear();
      setLog(null);
      setChatLog([]);
      setFeedPosts([]);
      setIsGrayscale(false);
      setMode('spicy');
    }
  };

  const handleCopyLinkOnly = () => {
    const shareUrl = `https://apptin.app/join/${groupCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSnsShare = (platform: 'kakao' | 'twitter' | 'facebook' | 'native') => {
    const shareUrl = `https://apptin.app/join/${groupCode}`;
    const text = `AppTin(앱틴) - 나만의 AI 디지털 갓생 & 루틴 모임에 참여해보세요! (초대코드: ${groupCode})`;

    if (platform === 'kakao') {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `kakaolink://send?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
      } else {
        window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
      }
      return;
    }

    if (platform === 'native' && navigator.share) {
      navigator.share({ title: 'AppTin 초대', text: text, url: shareUrl }).catch(() => {});
      return;
    }

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  };

  const handleShareMyRoutine = () => {
    if (!log) {
      alert('공유할 일일 측정 데이터가 없습니다. 먼저 사용량을 측정해주세요.');
      return;
    }
    const routineSummary = newRoutineText.trim() || `오늘 몰입 지수 ${score}% 달성. 작업시간 ${log.apps.find(a => a.type === 'Work')?.mins || 0}분 완료.`;
    const newPost: GroupFeedPost = {
      id: Date.now().toString(),
      author: '사용자 (나)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: score,
      routineSummary: routineSummary,
      likes: 0
    };
    setFeedPosts([newPost, ...feedPosts]);
    setNewRoutineText('');
  };

  const handleLike = (id: string) => {
    setFeedPosts(feedPosts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    const contextLogs = log ? `몰입도: ${score}%, 작업: ${log.apps.find(a => a.type === 'Work')?.mins || 0}분, 미디어: ${log.apps.filter(a => a.type === 'Media' || a.type === 'Social').reduce((a, b) => a + b.mins, 0)}분` : undefined;

    const aiReplyText = await askGeminiCoach({
      mode: mode,
      userMessage: userText,
      contextLogs: contextLogs
    });

    const aiMsg: ChatMessage = {
      sender: 'ai',
      text: aiReplyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, aiMsg]);
    setIsAiLoading(false);
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
      paddingBottom: '85px',
      filter: isGrayscale ? 'grayscale(100%)' : 'none',
      transition: 'filter 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 20px 18px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#f8fafc' }}>
              AppTin <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>App + Routine</span>
            </h1>
          </div>
          <div style={{ fontSize: '13px', color: '#38bdf8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', background: '#0f172a', fontWeight: '700' }}>
            연속 4일 실천
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main style={{ padding: '20px' }}>

        {/* TAB 1: REPORT & DASHBOARD */}
        {tab === 'report' && (
          <div>
            {!log ? (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '36px 24px', border: '1px solid #334155', textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>측정된 하루 데이터가 없습니다</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                  실제 Gemini AI 테스트를 위해 아래 버튼을 눌러 테스트용 데이터를 불러오세요.
                </p>
                <button
                  onClick={handleInjectSampleData}
                  style={{ width: '100%', padding: '16px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
                >
                  테스트용 실사용 데이터 로드하기
                </button>
              </div>
            ) : (
              <>
                <section style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#cbd5e1' }}>오늘의 몰입 지수</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: score > 60 ? '#4ade80' : '#f87171' }}>{score}%</span>
                  </div>
                  <div style={{ background: '#0f172a', borderRadius: '6px', height: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                    <div style={{ width: `${score}%`, height: '100%', background: score > 60 ? '#22c55e' : '#ef4444' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 0 0', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                    <span>작업 몰입: {log.apps.find(a => a.type === 'Work')?.mins || 0}분</span>
                    <span>미디어 시청: {log.apps.filter(a => a.type === 'Media' || a.type === 'Social').reduce((acc, curr) => acc + curr.mins, 0)}분</span>
                  </div>
                </section>

                <section style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>AppTin 일일 리포트</h3>
                  <blockquote style={{ margin: '0 0 16px 0', padding: '14px 16px', background: '#0f172a', borderLeft: '4px solid #38bdf8', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0' }}>
                    {mode === 'spicy'
                      ? '"오늘 PC 개발 몰입 3시간 30분은 우수하나, 퇴근 후 숏폼 시청 2시간 25분은 뇌 피로도를 가중시킵니다."'
                      : mode === 'balanced'
                      ? '"생산성 및 휴식 균형 분석: PC 생산성은 높으나 저녁 스마트폰 미디어 사용 비중이 높습니다."'
                      : '"수고 많으셨습니다. 오늘 진행된 개발 작업에 높은 몰입도를 보여주셨습니다."'}
                  </blockquote>
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#4ade80' }}>주요 성과:</strong> VS Code 개발 몰입 210분 달성
                  </div>
                  <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#f87171' }}>개선점:</strong> 유튜브 숏츠 95분, 인스타 50분 (화면 켬 42회)
                  </div>
                </section>

                <section style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#f8fafc', fontWeight: '800' }}>상세 사용 내역</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {log.apps.map((app) => (
                      <div key={app.pkg} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#0f172a', borderRadius: '10px', fontSize: '14px' }}>
                        <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{app.name}</span>
                        <span style={{ color: app.type === 'Work' ? '#38bdf8' : '#f87171', fontWeight: '800' }}>{app.mins}분</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* TAB 2: AI INTERACTIVE CHAT */}
        {tab === 'chat' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>Gemini AI 코치 1:1 상담</h3>
              <span style={{ fontSize: '12px', color: '#22c55e', border: '1px solid #22c55e', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>LIVE AI 연동됨</span>
            </div>

            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '16px', minHeight: '340px', maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', marginBottom: '16px' }}>
              {chatLog.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', paddingTop: '120px' }}>
                  아직 대화 내역이 없습니다. 아래 입력창에 Gemini AI에게 전달할 메시지를 남겨보세요.
                </div>
              ) : (
                chatLog.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.sender === 'user' ? '#38bdf8' : '#0f172a',
                      color: msg.sender === 'user' ? '#0f172a' : '#e2e8f0',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      fontWeight: '500'
                    }}>
                      {msg.text}
                      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '6px', textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))
              )}
              {isAiLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ background: '#0f172a', color: '#38bdf8', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                    Gemini AI가 라이브 분석 중...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isAiLoading ? "Gemini가 대답을 생성 중입니다..." : "Gemini AI에게 오늘 하루 고민/질문 입력..."}
                disabled={isAiLoading}
                style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '14px' }}
              />
              <button type="submit" disabled={isAiLoading} style={{ padding: '14px 20px', background: isAiLoading ? '#64748b' : '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: isAiLoading ? 'default' : 'pointer' }}>
                전송
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: GROUP & ROUTINE SHARING */}
        {tab === 'group' && (
          <div>
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #38bdf8', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8', fontWeight: '800' }}>알고리즘 & 갓생 루틴 모임</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>그룹원 실시간 공유 참여 중</span>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  style={{
                    padding: '10px 16px',
                    background: '#38bdf8',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  초대 공유하기
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', background: '#0f172a', padding: '8px 12px', borderRadius: '6px' }}>
                초대 코드: <strong>{groupCode}</strong>
              </div>
            </section>

            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>오늘 내 하루 루틴 공유하기</h4>
              <input
                type="text"
                value={newRoutineText}
                onChange={(e) => setNewRoutineText(e.target.value)}
                placeholder="오늘 실천한 핵심 루틴 한 줄 메모..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px' }}
              />
              <button
                onClick={handleShareMyRoutine}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                그룹 피드에 루틴 게시하기
              </button>
            </section>

            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '800' }}>그룹원 실시간 피드 ({feedPosts.length}건)</h4>
              {feedPosts.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '24px 0' }}>
                  아직 공유된 루틴이 없습니다. 상단에서 첫 루틴을 공유해보세요!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {feedPosts.map((post) => (
                    <div key={post.id} style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>{post.author}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{post.time} | 몰입지수 {post.score}%</span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5' }}>{post.routineSummary}</p>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        자극받음 ({post.likes})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: SETTINGS (AI MODE, THEME, DATA RESET) */}
        {tab === 'settings' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>환경 및 테마 설정</h3>

            {/* AI Coach Mode Selector */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>AI 분석 강도 선택</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                AI 코치가 하루 리포트를 작성하거나 대화할 때의 피드백 톤과 직설적인 강도를 조절합니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '6px', borderRadius: '12px', border: '1px solid #334155' }}>
                {(['mild', 'balanced', 'spicy'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: mode === m ? '#38bdf8' : 'transparent',
                      color: mode === m ? '#0f172a' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: '800',
                      fontSize: '14px'
                    }}
                  >
                    {m === 'mild' ? '순한맛' : m === 'balanced' ? '보통' : '매운맛'}
                  </button>
                ))}
              </div>
            </section>

            {/* Grayscale Theme Setting */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>수면 가이드 흑백 모드</strong>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>시각적 도파민 유혹을 줄이는 디스플레이 흑백 필터</div>
                </div>
                <button
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  style={{ padding: '10px 16px', background: isGrayscale ? '#22c55e' : '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {isGrayscale ? '흑백 ON' : '흑백 OFF'}
                </button>
              </div>
            </section>

            {/* Data Management */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>데이터 관리 및 초기화</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                로컬에 저장된 일일 측정 기록, AI 대화 내역 및 피드 데이터를 초기화합니다.
              </p>
              <button
                onClick={handleResetData}
                style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#f87171', border: '1px solid #ef4444', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                전체 로컬 데이터 초기화
              </button>
            </section>
          </div>
        )}

        {/* TAB 5: HELP & PRIVACY POLICY */}
        {tab === 'help' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>고객센터 및 개인정보처리방침</h3>

            {/* Guide Section */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#38bdf8', fontWeight: '700' }}>AppTin 서비스 사용 지침</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <li><strong>PC 트래커 연동</strong>: Windows PC에서 <code style={{ color: '#38bdf8' }}>pc_tracker.py</code> 스크립트를 실행하여 작업 시간을 자동 기록합니다.</li>
                <li><strong>모바일 권한 승인</strong>: 안드로이드 설정 ➔ 사용 정보 접근 권한에서 AppTin 앱을 허용해주세요.</li>
                <li><strong>수면 루틴 추천</strong>: 저녁 10시 이후 알람을 설정한 뒤 디스플레이를 흑백 모드로 전환하면 깊은 수면에 도움이 됩니다.</li>
              </ul>
            </section>

            {/* Privacy Policy */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#4ade80', fontWeight: '700' }}>개인정보 처리방침 안내</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                AppTin 서비스는 사용자의 개인정보 수집 및 정보보호를 최우선으로 선언합니다.
              </p>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                <li><strong>로컬 저장 우선</strong>: 모든 작업 창 및 모바일 사용량 통계는 사용자 기기 내부 LocalStorage에만 저장되며 외부 전송되지 않습니다.</li>
                <li><strong>민감 데이터 마스킹</strong>: 비밀번호나 암호 입력 창 제목은 자동 마스킹 처리된 후 AI 리포트 생성에 사용됩니다.</li>
                <li><strong>AI API 전송</strong>: 리포트 작성을 위한 통계 요약 데이터만 암호화(HTTPS)를 통해 구글 Gemini API로 전송되며, 저장되지 않고 즉시 소멸합니다.</li>
              </ol>
            </section>

            {/* FAQ & Support */}
            <section style={{ background: '#1e293b', borderRadius: '16px', padding: '18px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '700' }}>고객 지원 및 문의</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#cbd5e1' }}>
                서비스 이용 중 궁금하신 점이나 버그 제보는 아래 이메일로 보내주세요.
              </p>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>
                📧 고객센터 문의: support@apptin.app
              </div>
            </section>
          </div>
        )}

      </main>

      {/* SNS Share Modal Component */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '800' }}>AppTin 모임 공유하기</h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>
              원하는 채널을 선택하여 카카오톡 앱 자동 실행 또는 SNS 공유로 친구들을 초대해보세요!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => handleSnsShare('kakao')}
                style={{ padding: '14px', background: '#fee500', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
              >
                카카오톡 (앱 실행)
              </button>
              <button
                onClick={() => handleSnsShare('twitter')}
                style={{ padding: '14px', background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
              >
                트위터 / X
              </button>
              <button
                onClick={() => handleSnsShare('facebook')}
                style={{ padding: '14px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
              >
                페이스북
              </button>
              <button
                onClick={() => handleSnsShare('native')}
                style={{ padding: '14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
              >
                기기 공유 API
              </button>
            </div>

            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                https://apptin.app/join/{groupCode}
              </span>
              <button
                onClick={handleCopyLinkOnly}
                style={{ padding: '6px 12px', background: copied ? '#22c55e' : '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                {copied ? '복사됨!' : '링크 복사'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
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
        padding: '14px 0 16px',
        zIndex: 100
      }}>
        {[
          { id: 'report', label: '리포트' },
          { id: 'chat', label: 'AI 상담' },
          { id: 'group', label: '그룹&공유' },
          { id: 'settings', label: '설정' },
          { id: 'help', label: '고객센터' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: tab === t.id ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: tab === t.id ? '800' : '600',
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
