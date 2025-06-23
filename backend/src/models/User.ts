import { DataTypes, Sequelize } from "sequelize";
import { createHash } from "crypto";

export interface UserData {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createModel(database: Sequelize) {
  database.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure usernames are unique
      validate: {
        is: /^[a-z0-9]+$/i, // Allow only alphanumeric characters
        len: [4, 16] // Username must be between 3 and 20 characters long
      },
      set(value: string) { //custom setter method
        // Ensure the username is always stored in lowercase and trimmed
        this.setDataValue('username', value.trim().toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) { //custom setter method
        // Saving passwords in plaintext in a database is a no-no!
        // You should at least store a secure hash of the password (as done here).
        // Even better, you should use a random salt to protect against rainbow tables.
        let hash = createHash("sha256");    
        this.setDataValue('password', hash.update(value).digest("hex"));
      }
    }
  }, {});
}
