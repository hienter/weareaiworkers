'use client';

import { useState, useEffect } from 'react';
import { JobCard } from '@/components/job-card';
import { AdminJobForm } from '@/components/admin-job-form';
import { AdminLogin } from '@/components/admin-login';
import { getJobs, addJob, updateJob, deleteJob } from '@/lib/jobs';
import { subscribeToJobs } from '@/lib/firestore-jobs';
import { Job } from '@/types/job';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Settings, Briefcase, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    if (isAdmin) {
      // 초기 데이터 로드
      const initializeData = async () => {
        try {
          await getJobs(); // Firestore 초기화 처리
        } catch (error) {
          console.error('Failed to initialize data:', error);
        }
      };

      initializeData();

      // 실시간 리스너 설정
      const unsubscribe = subscribeToJobs((updatedJobs) => {
        setJobs(updatedJobs);
      });

      // 컴포넌트 언마운트 시 리스너 정리
      return () => unsubscribe();
    }
  }, [isAdmin]);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const handleAddJob = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('정말로 이 채용공고를 삭제하시겠습니까?')) {
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert(error instanceof Error ? error.message : '삭제에 실패했습니다.');
      }
    }
  };

  const handleSaveJob = async (jobData: Omit<Job, 'id'>) => {
    try {
      if (editingJob) {
        // 수정
        const updatedJob: Job = { ...jobData, id: editingJob.id };
        await updateJob(updatedJob);
      } else {
        // 새 채용공고 추가
        const newJob: Job = {
          ...jobData,
          id: Date.now().toString()
        };
        await addJob(newJob);
      }
      setShowForm(false);
      setEditingJob(null);
      // setJobs 제거 - 실시간 리스너가 자동으로 업데이트
    } catch (error) {
      console.error('Failed to save job:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WE ARE AIWORKERS Admin</h1>
                <p className="text-sm text-gray-500">AI 채용공고만 모아서 · 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>{jobs.length}개의 채용공고</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.displayName || user?.email}</span>
              </div>
              
              <Button onClick={handleAddJob} className="bg-gray-900 hover:bg-gray-700">
                <Plus className="h-4 w-4 mr-2" />
                새 채용공고
              </Button>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <div className="mb-8">
            <AdminJobForm
              job={editingJob}
              onSave={handleSaveJob}
              onCancel={() => {
                setShowForm(false);
                setEditingJob(null);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                채용공고 관리 ({jobs.length}개)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="relative">
                  <JobCard job={job} />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditJob(job)}
                      className="bg-white/90 hover:bg-white"
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteJob(job.id)}
                      className="bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 weareaiworkers Admin. 관리자 전용 페이지</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
