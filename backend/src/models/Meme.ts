import { DataTypes, Sequelize } from "sequelize";

export interface MemeData {
  id: number;
  path: string;
  title: string;
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

export function createModel(database: Sequelize) {
  database.define('Meme', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure meme paths are unique
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255] // Title must be between 1 and 255 characters long
      },
      set(value: string) { // Custom setter method
        // Ensure the title is always stored in a normalized format
        this.setDataValue('title', value.trim());
      }
    },
    todaysMemeDate:{
      type: DataTypes.DATEONLY,
      defaultValue: null,
      allowNull: true
    },
    commentsCount: {
      type: DataTypes.VIRTUAL,
      get() {
        // Will be populated by Sequelize with the count of comments
        return this.getDataValue('commentsCount') || 0;
      }
    },
    upvotesCount: {
      type: DataTypes.VIRTUAL,
      get() {
        // Will be populated by Sequelize with the count of upvotes
        return this.getDataValue('upvotesCount') || 0;
      }
    },
    downvotesCount: {
      type: DataTypes.VIRTUAL,
      get() {
        // Will be populated by Sequelize with the count of downvotes
        return this.getDataValue('downvotesCount') || 0;
      }
    },
    userVote: {
      type: DataTypes.VIRTUAL,
      get() {
        // Will be populated by Sequelize with the user's vote type
        // This can be 'upvote', 'downvote', or null if the user hasn't voted
        return this.getDataValue('userVote') || null;
      }
    }
  }, {});
}
