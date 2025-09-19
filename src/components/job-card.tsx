'use client';

import { Job } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Building, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className={`w-full hover:shadow-lg transition-shadow duration-200 border-gray-200 bg-white ${
        job.applyUrl ? 'cursor-pointer hover:border-gray-300' : 'cursor-default'
      }`}
      onClick={() => onApply?.(job.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.logo ? (
              <Image
                src={job.logo}
                alt={`${job.company} 로고`}
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">
              {job.company}
            </CardDescription>
          </div>

          {/* Apply Status */}
          {job.applyUrl && (
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ExternalLink className="h-3 w-3" />
                <span>지원가능</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
           <CardContent className="pt-0">
             <div className="flex items-center justify-between">
               {/* Location - 좌측 */}
               <div className="flex items-center gap-1 text-sm text-gray-600">
                 <MapPin className="h-4 w-4" />
                 <span>{job.location}</span>
               </div>

               {/* Deadline - 우측 */}
               {job.deadline && (
                 <div className="flex items-center gap-1 text-sm text-gray-600">
                   <Clock className="h-4 w-4" />
                   <span>마감일: {formatDate(job.deadline)}</span>
                 </div>
               )}
             </div>
           </CardContent>
    </Card>
  );
}
