import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Job } from '@/types/job';

const JOBS_COLLECTION = 'jobs';

// Firestore에서 모든 채용공고 가져오기
export const getJobsFromFirestore = async (): Promise<Job[]> => {
  try {
    const q = query(collection(db, JOBS_COLLECTION), orderBy('postedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      } as Job);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error getting jobs from Firestore:', error);
    return [];
  }
};

// Firestore에 새 채용공고 추가
export const addJobToFirestore = async (jobData: Omit<Job, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, JOBS_COLLECTION), jobData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding job to Firestore:', error);
    return null;
  }
};

// Firestore에서 채용공고 업데이트
export const updateJobInFirestore = async (jobId: string, jobData: Omit<Job, 'id'>): Promise<boolean> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, jobData);
    return true;
  } catch (error) {
    console.error('Error updating job in Firestore:', error);
    return false;
  }
};

// Firestore에서 채용공고 삭제
export const deleteJobFromFirestore = async (jobId: string): Promise<boolean> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await deleteDoc(jobRef);
    return true;
  } catch (error) {
    console.error('Error deleting job from Firestore:', error);
    return false;
  }
};

// 샘플 데이터로 Firestore 초기화
export const initializeSampleData = async (): Promise<boolean> => {
  try {
    const { sampleJobs } = await import('@/data/sample-jobs');
    
    // 각 샘플 job을 Firestore에 추가
    for (const job of sampleJobs) {
      const { id, ...jobData } = job;
      await addJobToFirestore(jobData);
    }
    
    console.log('Sample data initialized in Firestore');
    return true;
  } catch (error) {
    console.error('Error initializing sample data in Firestore:', error);
    return false;
  }
};

// 실시간 채용공고 리스너
export const subscribeToJobs = (callback: (jobs: Job[]) => void): Unsubscribe => {
  const q = query(collection(db, JOBS_COLLECTION), orderBy('postedDate', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      } as Job);
    });
    
    callback(jobs);
  }, (error) => {
    console.error('Error in jobs subscription:', error);
    callback([]);
  });
};
