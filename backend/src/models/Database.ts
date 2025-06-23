import { Sequelize, Dialect } from "sequelize";
import { createModel as createUserModel } from "./User";
import { createModel as createMemeModel } from "./Meme";
import { createModel as createTagModel } from "./Tag";
import { createModel as createCommentModel } from "./Comment";
import { createModel as createVoteModel } from "./Vote";

import config from '../config/config';

export const database = new Sequelize(config.dbConnectionUri, {
  dialect: config.dialect as Dialect
});

createUserModel(database);
createMemeModel(database);
createTagModel(database);
createCommentModel(database);
createVoteModel(database);

export const {User, Meme, Tag, Comment, Vote} = database.models;

//associations configuration
User.hasMany(Meme, {
  foreignKey: 'userId',
  as: 'memes',
  onDelete: 'CASCADE' // Quando un utente viene eliminato, elimina tutti i suoi meme
});
Meme.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE' // Quando un meme viene eliminato, elimina il riferimento all'utente che lo ha caricato
});
Meme.belongsToMany(Tag, {
  through: 'MemeTag',
  foreignKey: 'memeId',
  onDelete: 'CASCADE' // Elimina le associazioni quando il meme viene eliminato
});
Tag.belongsToMany(Meme, {
  through: 'MemeTag',
  foreignKey: 'tagId',
  onDelete: 'CASCADE' // Elimina le associazioni quando il tag viene eliminato
});
Comment.belongsTo(Meme, {
  foreignKey: 'memeId',
  onDelete: 'CASCADE' // Elimina i commenti quando il meme viene eliminato
});
Meme.hasMany(Comment, {
  foreignKey: 'memeId',
  onDelete: 'CASCADE' // Elimina i commenti quando il meme viene eliminato
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE' // Elimina i commenti quando l'utente viene eliminato
});
Vote.belongsTo(Meme, {
  foreignKey: 'memeId',
  onDelete: 'CASCADE' // Elimina i voti quando il meme viene eliminato
});
Meme.hasMany(Vote, {
  foreignKey: 'memeId',
  onDelete: 'CASCADE' // Elimina i voti quando il meme viene eliminato
});
Vote.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE' // Elimina i voti quando l'utente viene eliminato
});

//synchronize schema (creates missing tables)
database.sync().then( () => {
  console.log("Database synced correctly");
}).catch( err => {
  console.error("Error with database synchronization: " + err.message);
});