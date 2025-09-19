// 파비콘 가져오기 유틸리티 함수

export const getFaviconUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // 여러 파비콘 서비스 시도
    const faviconServices = [
      `https://www.google.com/s2/favicons?sz=64&domain=${domain}`, // Google 파비콘 서비스
      `https://favicon.yandex.net/favicon/${domain}`, // Yandex 파비콘 서비스
      `https://icons.duckduckgo.com/ip3/${domain}.ico`, // DuckDuckGo 파비콘 서비스
      `https://${domain}/favicon.ico`, // 직접 파비콘
      `https://${domain}/apple-touch-icon.png`, // Apple Touch Icon
    ];
    
    // Google 파비콘 서비스를 기본으로 사용 (가장 안정적)
    return faviconServices[0];
  } catch {
    console.error('Invalid URL for favicon extraction');
    return null;
  }
};

export const testFaviconUrl = async (faviconUrl: string): Promise<boolean> => {
  try {
    // 이미지 로드 테스트
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = faviconUrl;
      
      // 5초 타임아웃
      setTimeout(() => resolve(false), 5000);
    });
  } catch {
    return false;
  }
};

export const extractDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};
