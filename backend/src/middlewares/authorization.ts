import { Request, Response, NextFunction } from 'express';
import { AuthController } from "../controllers/AuthController";
import { UserData } from '../models/User.js';
import { AuthenticatedRequest } from '../types/requests';


export function enforceAuthentication(req: AuthenticatedRequest, res: Response, next: NextFunction) : void{
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1];
  if(!token){
    next({status: 401, message: "Unauthorized"});
    return;
  }
  AuthController.isTokenValid(token)
    .then((user) => {
      req.user = user as UserData;
      next();
    })
    .catch(err => {
      next({status: 401, message: "Unauthorized"});
    });
}

export const optionalAuthentication = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Nessun token, continua senza autenticazione
    return next();
  }
  const token = authHeader.substring(7);

  AuthController.isTokenValid(token)
    .then((user) => {
      req.user = user as UserData;
      next();
    })
    .catch(err => {
      next({status: 401, message: "Unauthorized"});
    });
};

export async function ensureUsersModifyOnlyOwnMemes(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const user = req.user;
  if (!user) {
    next({ status: 401, message: "Unauthorized" });
    return;
  }
  const memeId = req.params.memeId;
  if (!memeId) {
    next({ status: 400, message: "Meme ID is required" });
    return;
  }

  const userHasPermission = await AuthController.canUserModifyMeme(user, parseInt(memeId));
  if(userHasPermission){
    next();
  } else {
    next({
      status: 403, 
      message: "Forbidden! You do not have permissions to view or modify this resource"
    });
  }
}

export async function ensureUsersModifyOnlyOwnComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    next({ status: 401, message: "Unauthorized" });
    return;
  }
  const commentId = req.params.commentId;
  if (!commentId) {
    next({ status: 400, message: "Comment ID is required" });
    return;
  }

  // Check if the user has permission to modify the comment
  const userHasPermission = await AuthController.canUserModifyComment(user, parseInt(commentId));
  if (userHasPermission) {
    next();
  }
  else {
    next({
      status: 403,
      message: "Forbidden! You do not have permissions to view or modify this resource"
    });
  }
}