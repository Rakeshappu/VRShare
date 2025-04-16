
// Activity interface
export interface Activity {
  _id?: string;
  user: string;
  type: 'view' | 'download' | 'like' | 'comment' | 'share' | 'upload';
  resource: string;
  details?: any;
  timestamp: string | Date;
}

// SubjectFolder interface
export interface SubjectFolder {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  description?: string;
  resourceCount: number;
  createdAt: string;
  // Legacy fields
  subjectName?: string;
  lecturerName?: string;
}

// UploadFormData for resource uploads
export interface UploadFormData {
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'note';
  subject: string;
  semester: number;
  file?: File;
  link?: string;
  category?: string;
  placementCategory?: string;
}

// Faculty Resource interface
export interface FacultyResource {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'note';
  subject: string;
  semester: number;
  category?: 'study' | 'placement' | 'common';
  placementCategory?: string;
  uploadDate: string;
  fileName?: string;
  fileUrl?: string;
  link?: string;
  fileContent?: string;
  createdAt: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    downloads: number;
    lastViewed: string;
  };
  uploadedBy?: string;
  tags?: string[];
}

// ResourceCommentData interface for comments
export interface ResourceCommentData {
  resourceId: string;
  content: string;
}

// ResourceStats interface
export interface ResourceStats {
  views: number;
  likes: number;
  comments: number;
  downloads: number;
  lastViewed?: string;
  dailyViews?: Array<{
    date: string;
    count: number;
  }>;
}

// ResourceFilters interface
export interface ResourceFilters {
  type?: string;
  semester?: number;
  subject?: string;
  sortOrder?: 'newest' | 'oldest' | 'popular';
}

// Subject data for creation
export interface SubjectData {
  name: string;
  code: string;
  department: string;
  semester: number;
  description?: string;
  subjectName?: string; // For backward compatibility
  lecturerName?: string; // For backward compatibility
}

// Pagination interface
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Search result interface
export interface SearchResource {
  id: string;
  title: string;
  description?: string;
  type: string;
  subject?: string;
  semester?: number;
  source?: string;
  url?: string;
  thumbnailUrl?: string;
  publishDate?: string;
  author?: string;
  score?: number;
}
