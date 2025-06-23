import {Tag} from "../models/Database.js";
import {TagData} from "../models/Tag.js";
import {Model} from "sequelize/types";

export class TagController {

  static getTagDataByModel(model: Model): TagData {
    const tag = model.get({ plain: true });
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }
  }

  static async createTag(name: string) : Promise<TagData> {
    const newTag = Tag.build({
      name: name
    });
    
    return this.getTagDataByModel(await newTag.save());
  }

  static async findByName(name: string) : Promise<TagData | null> {
    const tag = await Tag.findOne({
      where: {
        name: name
      }
    });
    return tag ? this.getTagDataByModel(tag) : null;
  }

  static async findById(tagId: number) : Promise<TagData | null>{
    const tag = await Tag.findByPk(tagId);
    return tag ? this.getTagDataByModel(tag) : null;
  }

}