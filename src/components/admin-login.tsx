'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Settings, LogIn, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-900 p-3 rounded-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            WE ARE AIWORKERS Admin
          </CardTitle>
          <CardDescription className="text-gray-600">
            AI 채용공고만 모아서 · 관리자 전용 페이지<br />
            구글 계정으로 로그인해주세요.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                로그인 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                구글로 로그인
              </div>
            )}
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>허용된 관리자 계정만 접근 가능합니다.</p>
            <p className="mt-1">문의사항은 개발자에게 연락해주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
