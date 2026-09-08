/**
 * aiService.ts: AppTin Gemini AI Live 연동 서비스 모듈
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDxwFLgY6xiCkxEWjS7io1FsCdntMfdsK0";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface AiCoachOptions {
  mode: 'mild' | 'balanced' | 'spicy';
  userMessage: string;
  contextLogs?: string;
}

export async function askGeminiCoach({ mode, userMessage, contextLogs }: AiCoachOptions): Promise<string> {
  const modeInstruction = mode === 'spicy'
    ? '당신은 AppTin 서비스의 🌶️ 매운맛 팩폭 코치입니다. 위트 있으면서도 직설적으로 경각심을 일깨워주세요.'
    : mode === 'mild'
    ? '당신은 AppTin 서비스의 🌱 순한맛 다정한 코치입니다. 따스함과 격려 위주로 보듬어주세요.'
    : '당신은 AppTin 서비스의 ⚖️ 보통 밸런스 코치입니다. 이성적이고 객관적으로 분석해주세요.';

  const promptText = `
${modeInstruction}

[주의사항]:
- 현대인은 스마트폰을 아침 알람으로 사용하므로 "폰을 다른 방에 두라"는 팁은 금지합니다.
- 대신 "알람 설정 후 흑백 모드", "2m 거리 책상 알람 배치", "숏폼 타이머 설정" 등 현대인 맞춤 팁을 제안하세요.
- 답변은 2~3문장 이내로 간결하고 친근하게 한국어로 작성하세요.

${contextLogs ? `[오늘의 사용자 사용 통계]:\n${contextLogs}\n` : ''}
[사용자 메시지]: ${userMessage}
`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error Response:", errText);
      return "AI 연결 상태가 원활하지 않습니다. (Gemini API 오프라인)";
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "죄송합니다. 답변을 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini API Call Error:", error);
    return "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
}
