/**
 * MobileUsage: 모바일 사용량 수집 모듈
 * 간결하고 직관적인 키워드 중심 네이밍 적용
 */

export interface AppUsage {
  pkg: string;
  name: string;
  mins: number;
  launches: number;
  type: 'Social' | 'Media' | 'Work' | 'Chat' | 'Etc';
}

export interface MobileLog {
  date: string;
  device: string;
  totalMins: number;
  unlocks: number;
  apps: AppUsage[];
}

export class MobileUsage {
  /** 사용량 권한 확인 */
  static async checkPerm(): Promise<boolean> {
    console.log("📱 [MobileUsage] 권한 상태 확인");
    return true;
  }

  /** 하루 사용 통계 가져오기 */
  static async getLog(): Promise<MobileLog> {
    console.log("📱 [MobileUsage] 일일 사용량 측정");
    return {
      date: new Date().toISOString().split('T')[0],
      device: "Android_Mobile",
      totalMins: 195,
      unlocks: 42,
      apps: [
        { pkg: "com.google.android.youtube", name: "유튜브", mins: 95, launches: 14, type: "Media" },
        { pkg: "com.instagram.android", name: "인스타그램", mins: 50, launches: 18, type: "Social" },
        { pkg: "com.kakao.talk", name: "카카오톡", mins: 35, launches: 25, type: "Chat" },
        { pkg: "com.nhn.android.naver3rdapp", name: "네이버 웹툰", mins: 15, launches: 3, type: "Media" }
      ]
    };
  }
}
