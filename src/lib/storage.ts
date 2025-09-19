import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// 이미지 업로드 함수
export const uploadLogo = async (file: File, companyName: string): Promise<string> => {
  try {
    // 파일명 생성 (회사명 + 타임스탬프)
    const timestamp = Date.now();
    const fileName = `logos/${companyName.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${timestamp}`;
    const storageRef = ref(storage, fileName);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    
    // 다운로드 URL 반환
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('로고 업로드에 실패했습니다.');
  }
};

// 이미지 삭제 함수 (선택사항)
export const deleteLogo = async (logoUrl: string): Promise<void> => {
  try {
    if (logoUrl.includes('firebasestorage.googleapis.com')) {
      const storageRef = ref(storage, logoUrl);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error('Error deleting logo:', error);
    // 삭제 실패해도 에러 던지지 않음 (기존 데이터 유지)
  }
};

// 이미지 파일 검증
export const validateImageFile = (file: File): string | null => {
  // 파일 크기 체크 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return '파일 크기는 5MB 이하여야 합니다.';
  }
  
  // 파일 타입 체크
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return '지원하는 이미지 형식: JPG, PNG, GIF, WebP';
  }
  
  return null; // 유효한 파일
};
