export interface Comment {
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentResponse extends Comment {
  id: string;
}
