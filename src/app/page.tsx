'use client';

import { useState, useEffect } from 'react';
import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/jobs';
import { subscribeToJobs } from '@/lib/firestore-jobs';
import { addTrackingParams, trackJobClick } from '@/lib/analytics';
import { Job } from '@/types/job';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 초기 데이터 로드
    const initializeData = async () => {
      try {
        await getJobs(); // Firestore 초기화 처리
        setError(null);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setError('채용공고를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    initializeData();

    // 실시간 리스너 설정
    const unsubscribe = subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
      setIsLoading(false);
      setError(null);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe();
  }, []);

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // 지원 URL이 있는 경우
    if (job.applyUrl) {
      // GA 추적 파라미터 추가
      const trackedUrl = addTrackingParams(job.applyUrl, job.id, job.company, job.title);
      
      // 클릭 이벤트 추적
      trackJobClick(job.id, job.company, job.title, trackedUrl);
      
      // 새 탭에서 열기
      window.open(trackedUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 지원 URL이 없는 경우 기본 메시지
      alert(`${job.title} 포지션에 관심을 가져주셔서 감사합니다!\n\n해당 채용공고의 지원 링크가 아직 설정되지 않았습니다.\n회사에 직접 문의해주세요: ${job.company}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-900">WE ARE AIWORKERS</h1>
            <span className="text-gray-400">|</span>
            <p className="text-sm text-gray-500">AI 채용공고만 모아서</p>
          </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            채용공고 ({jobs.length}개)
          </h2>

          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700"
                >
                  새로고침
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">채용공고를 불러오는 중...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">등록된 채용공고가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 weareaiworkers. 모든 권리 보유.</p>
            <p className="mt-1">AI 채용공고만 모아서</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
