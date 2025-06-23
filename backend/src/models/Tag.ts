import { DataTypes, Sequelize } from "sequelize";

export interface TagData {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createModel(database: Sequelize) {
  database.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure tag names are unique
      validate: {
        is: /^[a-z]+$/i, // Allow only alphabetic characters
        len: [4, 16] // Name must be between 4 and 16 characters long
      },
      set(value: string) { // Custom setter method
        // Ensure the name is always stored in a normalized format
        this.setDataValue('name', value.trim().toLowerCase());
      }
    }
  }, {});
}
