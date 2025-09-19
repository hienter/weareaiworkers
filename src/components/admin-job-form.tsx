'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadLogo, validateImageFile } from '@/lib/storage';
import { getFaviconUrl, testFaviconUrl, extractDomainFromUrl } from '@/lib/favicon';
import { Upload, X, Globe } from 'lucide-react';

interface AdminJobFormProps {
  job?: Job | null;
  onSave: (jobData: Omit<Job, 'id'>) => void;
  onCancel: () => void;
}

export function AdminJobForm({ job, onSave, onCancel }: AdminJobFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    logo: '',
    location: '',
    deadline: '',
    applyUrl: '',
    postedDate: new Date().toISOString().split('T')[0]
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoInputType, setLogoInputType] = useState<'file' | 'url' | 'favicon'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        logo: job.logo || '',
        location: job.location,
        deadline: job.deadline || '',
        applyUrl: job.applyUrl || '',
        postedDate: job.postedDate
      });
      if (job.logo) {
        setLogoPreview(job.logo);
        setLogoUrl(job.logo);
        setLogoInputType('url'); // 기존 로고는 URL로 간주
      }
    }
  }, [job]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setUploadError(error);
        return;
      }
      
      setLogoFile(file);
      setUploadError('');
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setLogoUrl(url);
    setUploadError('');
    
    if (url.trim()) {
      // URL 유효성 검사
      try {
        new URL(url);
        setLogoPreview(url);
      } catch {
        setUploadError('올바른 URL 형식이 아닙니다.');
        setLogoPreview('');
      }
    } else {
      setLogoPreview('');
    }
  };

  const handleInputTypeChange = (type: 'file' | 'url' | 'favicon') => {
    setLogoInputType(type);
    setUploadError('');
    setLogoFile(null);
    setLogoUrl('');
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoUrl('');
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const extractFaviconFromUrl = async () => {
    const applyUrl = formData.applyUrl;
    if (!applyUrl.trim()) {
      setUploadError('먼저 지원 URL을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const faviconUrl = getFaviconUrl(applyUrl);
      if (!faviconUrl) {
        setUploadError('URL에서 파비콘을 추출할 수 없습니다.');
        return;
      }

      // 파비콘 로드 테스트
      const isValid = await testFaviconUrl(faviconUrl);
      if (!isValid) {
        setUploadError('파비콘을 로드할 수 없습니다. URL을 확인해주세요.');
        return;
      }

      setLogoUrl(faviconUrl);
      setLogoPreview(faviconUrl);
      setFormData(prev => ({ ...prev, logo: faviconUrl }));
      
    } catch {
      setUploadError('파비콘 추출 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalLogoUrl = formData.logo;
      
      if (logoInputType === 'file' && logoFile) {
        // 파일 업로드
        finalLogoUrl = await uploadLogo(logoFile, formData.company);
      } else if (logoInputType === 'url' && logoUrl.trim()) {
        // URL 사용
        finalLogoUrl = logoUrl.trim();
      } else if (logoInputType === 'favicon' && logoUrl.trim()) {
        // 파비콘 사용
        finalLogoUrl = logoUrl.trim();
      }
      
      onSave({
        ...formData,
        logo: finalLogoUrl
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '저장 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {job ? '채용공고 수정' : '새 채용공고 작성'}
        </CardTitle>
        <CardDescription>
          채용공고 정보를 입력해주세요.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직무명 *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="예: Frontend Developer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사명 *
              </label>
              <Input
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="예: 테크스타트업"
                required
              />
            </div>
          </div>

               {/* 로고 업로드/URL */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   회사 로고
                 </label>
                 <div className="space-y-4">
                   {/* 입력 방식 선택 */}
                   <div className="flex flex-wrap gap-4">
                     <label className="flex items-center">
                       <input
                         type="radio"
                         name="logoInputType"
                         value="file"
                         checked={logoInputType === 'file'}
                         onChange={() => handleInputTypeChange('file')}
                         className="mr-2"
                       />
                       파일 업로드
                     </label>
                     <label className="flex items-center">
                       <input
                         type="radio"
                         name="logoInputType"
                         value="url"
                         checked={logoInputType === 'url'}
                         onChange={() => handleInputTypeChange('url')}
                         className="mr-2"
                       />
                       이미지 URL
                     </label>
                     <label className="flex items-center">
                       <input
                         type="radio"
                         name="logoInputType"
                         value="favicon"
                         checked={logoInputType === 'favicon'}
                         onChange={() => handleInputTypeChange('favicon')}
                         className="mr-2"
                       />
                       파비콘 자동 추출
                     </label>
                   </div>

                   {/* 파일 업로드 */}
                   {logoInputType === 'file' && (
                     <div className="flex items-center gap-4">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleLogoChange}
                         className="hidden"
                         id="logo-upload"
                       />
                       <label
                         htmlFor="logo-upload"
                         className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                       >
                         <Upload className="h-4 w-4" />
                         로고 선택
                       </label>
                       {logoPreview && (
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={removeLogo}
                           className="text-red-600 border-red-200 hover:bg-red-50"
                         >
                           <X className="h-4 w-4 mr-1" />
                           제거
                         </Button>
                       )}
                     </div>
                   )}

                   {/* URL 입력 */}
                   {logoInputType === 'url' && (
                     <div className="space-y-2">
                       <Input
                         type="url"
                         value={logoUrl}
                         onChange={(e) => handleLogoUrlChange(e.target.value)}
                         placeholder="https://example.com/logo.png"
                       />
                       <p className="text-xs text-gray-500">
                         다른 사이트의 이미지 링크를 복사해서 붙여넣으세요
                       </p>
                       {logoUrl && (
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={removeLogo}
                           className="text-red-600 border-red-200 hover:bg-red-50"
                         >
                           <X className="h-4 w-4 mr-1" />
                           URL 제거
                         </Button>
                       )}
                     </div>
                   )}

                   {/* 파비콘 자동 추출 */}
                   {logoInputType === 'favicon' && (
                     <div className="space-y-3">
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <div className="flex items-start gap-3">
                           <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                           <div className="flex-1">
                             <p className="text-sm text-blue-800 font-medium mb-2">
                               지원 URL에서 파비콘 자동 추출
                             </p>
                             <p className="text-xs text-blue-600 mb-3">
                               지원 URL에 입력한 사이트의 파비콘(작은 로고)을 자동으로 가져옵니다.
                               {formData.applyUrl ? (
                                 <>
                                   <br />
                                   <span className="font-medium">
                                     대상 사이트: {extractDomainFromUrl(formData.applyUrl)}
                                   </span>
                                 </>
                               ) : (
                                 <>
                                   <br />
                                   <span className="text-orange-600">
                                     먼저 아래 &ldquo;지원 URL&rdquo;을 입력해주세요.
                                   </span>
                                 </>
                               )}
                             </p>
                             <Button
                               type="button"
                               onClick={extractFaviconFromUrl}
                               disabled={!formData.applyUrl.trim() || isUploading}
                               className="bg-blue-600 hover:bg-blue-700 text-white"
                               size="sm"
                             >
                               {isUploading ? (
                                 <div className="flex items-center gap-2">
                                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                   파비콘 추출 중...
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-2">
                                   <Globe className="h-4 w-4" />
                                   파비콘 가져오기
                                 </div>
                               )}
                             </Button>
                           </div>
                         </div>
                       </div>
                       {logoPreview && (
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={removeLogo}
                           className="text-red-600 border-red-200 hover:bg-red-50"
                         >
                           <X className="h-4 w-4 mr-1" />
                           파비콘 제거
                         </Button>
                       )}
                     </div>
                   )}

              {/* 로고 미리보기 */}
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="로고 미리보기"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>로고 미리보기</p>
                    <p className="text-xs text-gray-500">
                      {logoFile ? `새 파일: ${logoFile.name}` : '기존 로고'}
                    </p>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {uploadError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {uploadError}
                </div>
              )}

                   {/* 업로드 가이드 */}
                   <div className="text-xs text-gray-500">
                     {logoInputType === 'file' ? (
                       <>
                         <p>• 지원 형식: JPG, PNG, GIF, WebP</p>
                         <p>• 최대 크기: 5MB</p>
                         <p>• 권장 크기: 200x200px 정사각형</p>
                       </>
                     ) : logoInputType === 'url' ? (
                       <>
                         <p>• 이미지 직접 링크 URL을 입력하세요</p>
                         <p>• 권장 크기: 200x200px 정사각형</p>
                         <p>• 예시: https://company.com/logo.png</p>
                       </>
                     ) : (
                       <>
                         <p>• 지원 URL의 사이트에서 파비콘을 자동으로 가져옵니다</p>
                         <p>• Google 파비콘 서비스를 통해 고화질 이미지 제공</p>
                         <p>• 대부분의 웹사이트에서 작동하며 빠르고 편리합니다</p>
                       </>
                     )}
                   </div>
            </div>
          </div>

          {/* 근무지 및 마감일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                근무지 *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="예: 서울 강남구"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                마감일
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                선택사항 - 설정하지 않으면 마감일이 표시되지 않습니다
              </p>
            </div>
          </div>

          {/* 지원 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지원 URL
            </label>
            <Input
              type="url"
              value={formData.applyUrl}
              onChange={(e) => handleInputChange('applyUrl', e.target.value)}
              placeholder="예: https://company.com/careers/frontend-developer"
            />
            <p className="text-xs text-gray-500 mt-1">
              선택사항 - 지원자가 클릭했을 때 이동할 채용 페이지 URL을 입력하세요
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-700"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  업로드 중...
                </div>
              ) : (
                job ? '수정 완료' : '채용공고 등록'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isUploading}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
