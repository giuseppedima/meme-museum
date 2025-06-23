export interface MemeData {
  id: number;
  title: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  commentsCount: number;
  upvotesCount: number;
  downvotesCount: number;
  userVote: 'upvote' | 'downvote' | null; // Voto dell'utente, può essere null se non ha votato
}

export interface MemeDataPaginated {
  data: MemeData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}