import { User, Meme, Comment } from "../models/Database";
import Jwt from "jsonwebtoken";
import config from '../config/config';
import { createHash } from "crypto";
import { UserController } from "./UserController";
import { UserData } from "../models/User";

export class AuthController {


  static getUserDataByJwtToken(token: Jwt.JwtPayload) : UserData {
    return {
      id: token.id,
      username: token.username,
      createdAt: new Date(token.createdAt),
      updatedAt: new Date(token.updatedAt)
    }
  }

  static async checkCredentials(username: string, password: string) : Promise<UserData | null> {
    // Hash the password manually for comparison
    let hash = createHash("sha256");
    let hashedPassword = hash.update(password).digest("hex");

    let found = await User.findOne({
      where: {
        username: username,
        password: hashedPassword
      }
    });


    return found ? UserController.getUserDataByModel(found) : null;
  }

  static async createUser(username: string, password: string){
    const user = await User.create({
      username: username, 
      password: password // The setter will hash this automatically
    });
    return UserController.getUserDataByModel(user);
  }

  static issueToken(user: UserData): string {
    return Jwt.sign(user, config.tokenSecret, { expiresIn: `${24 * 60 * 60}s` });
  }

  static isTokenValid(token: string) {
    return new Promise((resolve, reject) => {
      Jwt.verify(token, config.tokenSecret, (err, decoded) => {
        if (err) {
          reject(err);
        } else if (decoded && typeof decoded === "object") {
          resolve(this.getUserDataByJwtToken(decoded as Jwt.JwtPayload));
        } else {
          reject(new Error("Invalid token payload"));
        }
      });
    });
  }

  static async canUserModifyMeme(user: UserData, memeId: number): Promise<boolean> {
    const meme = await Meme.findOne({
      where: {
        id: memeId,
        userId: user.id
      }
    });
    return !!meme; // Returns true if the meme exists and belongs to the user
  }

  static async canUserModifyComment(user: UserData, commentId: number): Promise<boolean> {
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        userId: user.id
      }
    });
    return !!comment; // Returns true if the comment exists and belongs to the user
  }

}