import { Comment, User } from '../models/Database';
import { CommentData } from '../models/Comment';

export interface PaginatedResult {
  data: CommentData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export class CommentController {

  static getCommentDataByModel(comment: any): CommentData {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.User.id,
        username: comment.User.username
      },
      memeId: comment.memeId
    };
  }

  static async createComment(content: string, userId: number, memeId: number): Promise<CommentData> {
    const comment = await Comment.create({
      content: content,
      userId: userId,
      memeId: memeId
    });
    await comment.reload({ include: [{ model: User, attributes: ['id', 'username'] }] });
    return this.getCommentDataByModel(comment);
  }

  static async getCommentsByMemeId(memeId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedResult> {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Comment.findAndCountAll({
      where: { memeId: memeId },
      include: [{ model: User, attributes: ['id', 'username'] }],
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const comments = rows.map(comment => this.getCommentDataByModel(comment));
    return {
      data: comments,
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize
    };
  }

  private static async getCommentById(commentId: number) {
    const comment = await Comment.findByPk(commentId, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
    if (!comment) {
      return null;
    }
    return comment;
  }
    

  static async updateComment(commentId: number, content: string): Promise<CommentData> {
    const comment:any = await this.getCommentById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    comment.content = content;
    await comment.save();
    return this.getCommentDataByModel(comment);
  }

  static async deleteComment(commentId: number): Promise<boolean> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    await comment.destroy();
    return true;
  }
}