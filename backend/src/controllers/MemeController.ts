import {Meme,Comment,Vote,User,Tag} from "../models/Database.js";
import {MemeData} from "../models/Meme.js";
import {Model} from "sequelize/types";
import {TagController} from "./TagController.js";
import {Sequelize, Op, WhereOptions, Order} from "sequelize";

interface MemeFilters {
  title?: string;
  userId?: number | null;
  tags?: string[];
  sortBy?: string;
  sortOrder?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginatedResult {
  data: MemeData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export class MemeController {

  static getMemeDataByModel(model: Model): MemeData {
    const meme = model.get({ plain: true });
    return {
      id: meme.id,
      title: meme.title,
      path: meme.path,
      createdAt: meme.createdAt,
      updatedAt: meme.updatedAt,
      user: meme.User,
      tags: meme.Tags,
      commentsCount: meme.commentsCount,
      upvotesCount: meme.upvotesCount,
      downvotesCount: meme.downvotesCount,
      userVote: meme.userVote
    }
  }

  static async getMemes(memeId?: number, userId?: number, filters?: MemeFilters, page: number = 1, pageSize: number = 10): Promise<PaginatedResult> {
    // 1. Costruisci filtri base
    const whereConditions = this.buildWhereConditions(memeId, filters);
    
    // 2. Costruisci include per tag con filtri
    const tagInclude = this.buildTagInclude(filters);
    
    // 3. Costruisci ordinamento
    const order = this.buildOrderClause(filters);

    // 4. Query principale con findAndCountAll
    const { count, rows } = await Meme.findAndCountAll({
      attributes: [
        'id', 'title', 'path', 'createdAt', 'updatedAt', 'userId',
        // Subquery per conteggi invece di GROUP BY
        [Sequelize.literal('(SELECT COUNT(*) FROM Comments WHERE Comments.memeId = Meme.id)'), 'commentsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM Votes WHERE Votes.memeId = Meme.id AND Votes.type = "upvote")'), 'upvotesCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM Votes WHERE Votes.memeId = Meme.id AND Votes.type = "downvote")'), 'downvotesCount'],
        // Voto utente con parametro sicuro
        userId ? [
          Sequelize.literal('(SELECT type FROM Votes WHERE Votes.memeId = Meme.id AND Votes.userId = :userId LIMIT 1)'),
          'userVote'
        ] : [Sequelize.literal('NULL'), 'userVote']
      ],
      include: [
        { model: User, attributes: ['id', 'username'] },
        tagInclude
      ],
      where: whereConditions,
      order: order,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true, // Per conteggio corretto con join
      replacements: { userId } // Parametro sicuro
    });

    return {
      data: rows.map(meme => this.getMemeDataByModel(meme)),
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize
    };
  }

  private static buildWhereConditions(memeId?: number, filters?: MemeFilters): WhereOptions {
    const where: WhereOptions = {};
    
    if (memeId) where.id = memeId;
    
    if (filters) {
      if (filters.title?.trim()) {
        where.title = { [Op.like]: `%${filters.title.trim()}%` };
      }
      if (filters.userId) where.userId = filters.userId;
      if (filters.dateFrom || filters.dateTo) {
        const dateFilter: any = {};
        if (filters.dateFrom) dateFilter[Op.gte] = filters.dateFrom;
        if (filters.dateTo) dateFilter[Op.lte] = filters.dateTo;
        where.createdAt = dateFilter;
      }
    }
    
    return where;
  }

  private static buildTagInclude(filters?: MemeFilters) {
    const include = {
      model: Tag,
      attributes: ['id', 'name'],
      through: { attributes: [] }
    };

    if (filters?.tags?.length) {
      return {
        ...include,
        where: { name: { [Op.in]: filters.tags } },
        required: true
      };
    }

    return include;
  }

  private static buildOrderClause(filters?: MemeFilters): Order {
    if (!filters?.sortBy || !filters?.sortOrder) {
      return [['createdAt', 'DESC']];
    }

    const direction = filters.sortOrder.toUpperCase() as 'ASC' | 'DESC';
    switch (filters.sortBy) {
      case 'upload_date': return [['createdAt', direction]];
      case 'upvotes': return [[Sequelize.literal('upvotesCount'), direction]];
      case 'downvotes': return [[Sequelize.literal('downvotesCount'), direction]];
      default: return [['createdAt', 'DESC']];
    }
  }

  static async createMeme(title: string, path: string, tags:string[], userId: number) : Promise<MemeData> {
    const newMeme = await Meme.create({
      title: title,
      path: path,
      userId: userId
    });
    
    if (tags && tags.length > 0) {
      const tagIds:number[] = [];
      for(let tagName of tags) {
        let tag = await TagController.findByName(tagName);
        if(!tag) {
          tag = await TagController.createTag(tagName);
        }
        tagIds.push(tag.id);
      }
      await (newMeme as any).setTags(tagIds);
    }
    
    return this.getMemeDataByModel(newMeme);
  }
  
  private static async generateTodaysMeme(userId?: number): Promise<MemeData | null> {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Converte la data in formato YYYY-MM-DD
    
    // Seleziona un meme a caso che ha todaysMemeDate a null
    const randomMeme = await Meme.findOne({
      attributes: ['id'],
      where: {
        todaysMemeDate: null
      },
      order: Sequelize.literal('RANDOM()') // Per SQLite/PostgreSQL, usa 'RAND()' per MySQL
    });
    
    if (!randomMeme) {
      // Nessun meme disponibile, resetta tutti i todaysMemeDate a null
      const updated = await Meme.update(
        { todaysMemeDate: null },
        { where: {} }
      );
      // Se non hai aggiornato almeno un valore, esci per evitare loop infiniti
      if (!updated[0]) {
        return null;
      }
      return this.generateTodaysMeme(userId); // Riprova ricorsivamente
    }
    
    // Aggiorna il meme selezionato con la data di oggi
    randomMeme.set('todaysMemeDate', formattedDate);
    await randomMeme.save();
    
    // Restituisci i dati del meme usando il metodo esistente
    return this.findById(randomMeme.get('id') as number, userId);
  }


  static async getTodaysMeme(userId?: number): Promise<MemeData | null> {
    const today = new Date();

    let meme = await Meme.findOne({
      attributes: ['id'],
      where: {
        todaysMemeDate: today.toISOString().split('T')[0] // Confronta solo la data, senza l'ora
      }
    });

    if (!meme) {
      return this.generateTodaysMeme(userId);
    }

    return this.findById(meme.get('id') as number, userId);
      
  }

  static async findById(memeId: number, userId?: number): Promise<MemeData | null>{
    let meme: PaginatedResult= await this.getMemes(memeId, userId);
    if (meme.totalItems === 0) {
      return null;
    }
    return meme.data[0];
  }

  static async vote(memeId: number, userId: number, type: 'upvote' | 'downvote') : Promise<MemeData | null> {
    const meme = await Meme.findByPk(memeId);
    if (!meme) {
      return null; // Meme not found
    }
  
    // Check if the user has already voted
    const existingVote = await Vote.findOne({
      where: {
        memeId: memeId,
        userId: userId
      }
    });
    if (existingVote) {
      if (existingVote.get('type') === type) {
        // If the user already voted, remove the vote
        await existingVote.destroy();
      } else {
        // If the user downvoted, change to upvote
        existingVote.set('type', type);
        await existingVote.save();
      }
    }
    else {
      // Create a new upvote
      await Vote.create({
        memeId: memeId,
        userId: userId,
        type: type
      });
    }
  
    // Re-fetch the meme to get updated counts with user vote
    return this.findById(memeId, userId);
  
  }

  static async delete(memeId: number): Promise<boolean> {
    const meme = await Meme.findOne({
      where: {
        id: memeId
      }
    });
    if (!meme) {
      return false;
    }
    await meme.destroy();
    return true;
  }
  
  static async update(memeId: number, title?: string, tags?: string[]): Promise<MemeData | null> {
    const meme: any = await Meme.findByPk(memeId);
    if (!meme) {
      return null; // Meme not found
    }
    if (!title && !tags) {
      throw new Error("At least one field (title or tags) must be provided for update");
    }
    if (title) {
      title = title.trim();
      if (title === '') {
        throw new Error("Title cannot be empty");
      }
      meme.title = title;
      await meme.save();
    }
    
    if (tags && tags.length > 0) {
      const tagIds: number[] = [];
      for (let tagName of tags) {
        let tag = await TagController.findByName(tagName);
        if (!tag) {
          tag = await TagController.createTag(tagName);
        }
        tagIds.push(tag.id);
      }
      await (meme as any).setTags(tagIds);
    }

    return this.findById(memeId, meme.userId);
  }
}