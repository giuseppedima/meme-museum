import { DataTypes, Sequelize } from "sequelize";


export function createModel(database: Sequelize) {
  database.define('Vote', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('upvote', 'downvote'),
      allowNull: false,
      validate: {
        isIn: [['upvote', 'downvote']] // Ensure type is either 'upvote' or 'downvote'
      }
    }
  }, {});
}
