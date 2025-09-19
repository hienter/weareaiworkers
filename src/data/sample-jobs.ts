import { Job } from '@/types/job';

export const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: '테크스타트업',
    logo: '/logos/tech-startup.svg',
    location: '서울 강남구',
    deadline: '2025-02-15',
    applyUrl: 'https://careers.techstartup.com/frontend-developer',
    postedDate: '2025-01-15'
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: '핀테크솔루션',
    logo: '/logos/fintech-solution.svg',
    location: '서울 서초구',
    deadline: '2025-02-20',
    applyUrl: 'https://jobs.fintechsolution.co.kr/backend-engineer',
    postedDate: '2025-01-14'
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: '이커머스플랫폼',
    logo: '/logos/ecommerce-platform.svg',
    location: '부산 해운대구',
    postedDate: '2025-01-13'
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: '디자인에이전시',
    logo: '/logos/design-agency.svg',
    location: '서울 홍대',
    deadline: '2025-01-30',
    applyUrl: 'https://apply.designagency.kr/uiux-designer',
    postedDate: '2025-01-12'
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: '클라우드서비스',
    logo: '/logos/cloud-service.svg',
    location: '원격근무',
    postedDate: '2025-01-11'
  }
];
