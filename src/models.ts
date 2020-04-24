export interface CommentsList {
  [key: string]: CommentRequest;
}

export interface CommentRequest {
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentResponse extends CommentRequest {
  id: string;
}
