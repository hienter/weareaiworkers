import { Job } from '@/types/job';
import { sampleJobs } from '@/data/sample-jobs';
import { 
  getJobsFromFirestore, 
  addJobToFirestore, 
  updateJobInFirestore, 
  deleteJobFromFirestore,
  initializeSampleData
} from './firestore-jobs';

// Firebase 전용 함수들
export const getJobs = async (): Promise<Job[]> => {
  try {
    const firestoreJobs = await getJobsFromFirestore();
    
    // Firestore에 데이터가 없으면 샘플 데이터로 초기화
    if (firestoreJobs.length === 0) {
      await initializeSampleData();
      return sampleJobs;
    }
    
    return firestoreJobs;
  } catch (error) {
    console.error('Failed to get jobs from Firestore:', error);
    throw new Error('채용공고를 불러오는데 실패했습니다.');
  }
};

export const addJob = async (job: Job): Promise<Job[]> => {
  try {
    const { id, ...jobData } = job;
    const newJobId = await addJobToFirestore(jobData);
    
    if (!newJobId) {
      throw new Error('Failed to add job to Firestore');
    }
    
    return await getJobs();
  } catch (error) {
    console.error('Failed to add job to Firestore:', error);
    throw new Error('채용공고 등록에 실패했습니다.');
  }
};

export const updateJob = async (updatedJob: Job): Promise<Job[]> => {
  try {
    const { id, ...jobData } = updatedJob;
    const success = await updateJobInFirestore(id, jobData);
    
    if (!success) {
      throw new Error('Failed to update job in Firestore');
    }
    
    return await getJobs();
  } catch (error) {
    console.error('Failed to update job in Firestore:', error);
    throw new Error('채용공고 수정에 실패했습니다.');
  }
};

export const deleteJob = async (jobId: string): Promise<Job[]> => {
  try {
    const success = await deleteJobFromFirestore(jobId);
    
    if (!success) {
      throw new Error('Failed to delete job from Firestore');
    }
    
    return await getJobs();
  } catch (error) {
    console.error('Failed to delete job from Firestore:', error);
    throw new Error('채용공고 삭제에 실패했습니다.');
  }
};
