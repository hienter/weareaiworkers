// GA 추적 파라미터를 URL에 추가하는 함수
export const addTrackingParams = (url: string, jobId: string, company: string, title: string): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // UTM 파라미터 추가
    urlObj.searchParams.set('utm_source', 'weareaiworkers');
    urlObj.searchParams.set('utm_medium', 'referral');
    urlObj.searchParams.set('utm_campaign', 'job_listing');
    urlObj.searchParams.set('utm_content', `${company}_${title}`.replace(/[^a-zA-Z0-9가-힣_]/g, '_'));
    urlObj.searchParams.set('utm_term', jobId);
    
    // 추가 추적 파라미터
    urlObj.searchParams.set('ref', 'weareaiworkers');
    urlObj.searchParams.set('job_id', jobId);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Invalid URL provided:', error);
    return url; // 잘못된 URL인 경우 원본 반환
  }
};

// GA gtag 함수 타입 정의
interface GtagWindow {
  gtag?: (
    command: string,
    eventName: string,
    parameters: Record<string, string | number>
  ) => void;
}

// 클릭 이벤트 추적 함수
export const trackJobClick = (jobId: string, company: string, title: string, url: string) => {
  // GA4 이벤트 추적 (gtag가 있는 경우)
  if (typeof window !== 'undefined') {
    const gtagWindow = window as unknown as GtagWindow;
    if (gtagWindow.gtag) {
      gtagWindow.gtag('event', 'job_click', {
        job_id: jobId,
        company: company,
        job_title: title,
        destination_url: url,
        source: 'weareaiworkers'
      });
    }
  }
  
  // 콘솔에 로그 (개발용)
  console.log('Job Click Tracked:', {
    jobId,
    company,
    title,
    url,
    timestamp: new Date().toISOString()
  });
};
