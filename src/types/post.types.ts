export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface PostFilters {
  search?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published';
  sortBy?: 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
}

export interface PostResponse {
  success: boolean;
  data?: any;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  message?: string;
}
