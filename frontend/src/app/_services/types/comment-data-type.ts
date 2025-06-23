export interface CommentData {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
  };
  memeId: number; // ID del meme a cui il commento è associato
}

export interface CommentDataPaginated {
  data: CommentData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}