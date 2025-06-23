import { DataTypes, Sequelize } from "sequelize";

export interface CommentData {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
  };
  memeId: number; // ID of the meme associated with the comment
}

export function createModel(database: Sequelize) {
  database.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500] // Content must be between 1 and 500 characters long
      },
      set(value: string) { // Custom setter method
        this.setDataValue('content', value.trim());
      }
    }
  }, {});
}
