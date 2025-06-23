import { User } from "../models/Database";
import { Model } from "sequelize/types";
import { UserData } from "../models/User";

export class UserController {

  static getUserDataByModel(model: Model): UserData {
    const user = model.get({ plain: true });
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  static async getUsers(): Promise<UserData[]> {
    const users = await User.findAll({
      attributes: ['id', 'username', 'createdAt', 'updatedAt']
    });

    return users.map(user => this.getUserDataByModel(user));
  }

}