export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
  images?: string[];
}

export interface UpdateCommentInput {
  content?: string;
  images?: string[];
}

export interface CommentFilters {
  postId: string;
  parentId?: string;
  page?: number;
  limit?: number;
}

export interface CommentResponse {
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
